'use strict';
// De controle van de bron-CSV vóór de generatie (00_validate_source_csv.js): fouten die een spreadsheet
// er makkelijk insluipt, zoals een decimale komma of een prefix die niet in config.yml staat.
import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ongekendePrefixen, ongeldigeWaarden, valideerBron } from '../src/00_validate_source_csv.js';
import { parseCsv } from '../src/utils/csv.js';
import { skosSource } from '../src/utils/variables.js';
import { vangUitvoer } from './fixtures.js';

// Standaard de echte bestanden; een test kan de inhoud van de bron vervangen
vi.mock('node:fs/promises', async (importOriginal) => {
    const origineel = await importOriginal();
    return { ...origineel, readFile: vi.fn(origineel.readFile) };
});

const leesBron = () => Promise.all(skosSource.sourcePaths.map((bron) => readFile(bron, 'utf8').then(parseCsv)));

afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
});

describe('ongekendePrefixen', () => {
    it('finds no unknown prefix in the source CSV', () =>
        leesBron().then((bronnen) => expect(ongekendePrefixen(bronnen.flat())).toEqual([])));

    it('detects an unknown prefix in any IRI column, also after a |', () =>
        parseCsv('_id,_type,broader\nlzs-type:x,skos:Concept,lzs-type:z|onbekend:y\n').then((rijen) => {
            expect(ongekendePrefixen(rijen)).toEqual(['onbekend']);
        }));

    it('ignores full IRIs and columns that are not IRIs', () =>
        parseCsv('_id,broader,prefLabel\nhttps://example.org/x,https://example.org/y,Tekst: met dubbelpunt\n').then(
            (rijen) => expect(ongekendePrefixen(rijen)).toEqual([]),
        ));
});

describe('ongeldigeWaarden', () => {
    it('finds no invalid typed value in the source CSV', () =>
        leesBron().then((bronnen) => expect(ongeldigeWaarden(bronnen.flat())).toEqual([])));

    it('detects a decimal comma and other invalid typed values', () =>
        parseCsv('_id,minValue,maxValue,value\nlzs-param:x,1.4,"0,8",2|3\nlzs-param:y,.5,8.5 ,1e3\n').then((rijen) => {
            expect(ongeldigeWaarden(rijen)).toEqual([
                'lzs-param:x maxValue: 0,8 (decimal)',
                'lzs-param:y value: 1e3 (decimal)',
            ]);
        }));
});

describe('valideerBron', () => {
    const metBron = (tekst) => readFile.mockResolvedValueOnce(tekst);

    it('passes on the source CSV', () => {
        const uitvoer = vangUitvoer(vi);
        return valideerBron().then(() => {
            expect(process.exitCode).toBeUndefined();
            expect(uitvoer()).toContain('The source CSV is valid');
        });
    });

    it('fails with every error listed', () => {
        const uitvoer = vangUitvoer(vi);
        metBron('_id,_type,maxValue\nonbekend:x,skos:Concept,"0,8"\n');
        return valideerBron().then(() => {
            expect(process.exitCode).toBe(1);
            expect(uitvoer()).toMatch(/1 prefix not in config\.yml\n\s+• onbekend/);
            expect(uitvoer()).toMatch(
                /1 value not valid for the datatype of the column\n\s+• onbekend:x maxValue: 0,8/,
            );
            expect(uitvoer()).not.toContain('The source CSV is valid');
        });
    });
});
