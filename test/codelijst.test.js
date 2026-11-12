'use strict';
// Integratietests op de echte configuratie en de gegenereerde codelijst. Ze controleren ook dat de
// dependencies (js-yaml, @zazuko/env-node, de generator) nog samenwerken.
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import rdf from '@zazuko/env-node';
import { odcsSource, skosOptions, skosSource } from '../src/utils/variables.js';
import { leesHuidig } from '../src/utils/releases.js';
import { parseCsv as leesCsv } from '../src/utils/csv.js';
import { ongeldigeWaarden } from '../src/00_validate_source_csv.js';

describe('configuration', () => {
    // De ingelezen config.yml staat in __snapshots__/config.json: een update van js-yaml die de
    // inhoud anders inleest, valt zo op. Na een bewuste wijziging aan config.yml: 'pnpm run test -u'.
    it('reads config.yml the same way', () =>
        expect(JSON.stringify(odcsSource.config, null, 2) + '\n').toMatchFileSnapshot('__snapshots__/config.json'));

    it('loads config.yml and the SHACL shapes', () => {
        expect(Object.keys(skosSource.prefixes).length).toBeGreaterThan(0);
        expect(skosSource.shapesDataset.size).toBeGreaterThan(0);
    });
});

describe('generated code list', () => {
    // Wat afnemers krijgen: ook een waarde die de bron niet rechtstreeks bevat, moet geldig zijn
    it('has a valid lexical form for every typed value in the generated CSV', () =>
        leesCsv(fs.readFileSync(skosOptions.csvOptions.file, 'utf8')).then((rijen) => {
            expect(rijen.length).toBeGreaterThan(0);
            expect(ongeldigeWaarden(rijen, 'null')).toEqual([]);
        }));

    it('detects a decimal comma in the generated CSV', () =>
        leesCsv('id,minValue,maxValue\nhttps://example.org/x,null,"0,8"\n').then((rijen) => {
            expect(ongeldigeWaarden(rijen, 'null')).toEqual(['https://example.org/x maxValue: 0,8 (decimal)']);
        }));

    it('exists in every configured format', () => {
        for (const pad of [skosOptions.turtlePath, skosOptions.ntriplesPath]) {
            expect(fs.existsSync(pad), pad).toBe(true);
        }
    });

    it('conforms to the SHACL shapes of the application profile', () =>
        leesHuidig()
            .then((triples) => {
                expect(triples.length).toBeGreaterThan(0);
                return validate(skosSource.shapesDataset, rdf.dataset(triples));
            })
            .then((report) => {
                expect(report.conforms).toBe(true);
            }));
});
