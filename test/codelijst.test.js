'use strict';
// Integratietests op de echte configuratie en de gegenereerde codelijst. Ze controleren ook dat de
// dependencies (js-yaml, @zazuko/env-node, de generator) nog samenwerken.
import fs from 'node:fs';
import { Readable } from 'node:stream';
import csv from 'csv-parser';
import { describe, expect, it } from 'vitest';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import rdf from '@zazuko/env-node';
import { odcsSource, skosOptions, skosSource } from '../src/utils/variables.js';
import { leesHuidig } from '../src/utils/releases.js';

// Rijen van een CSV-bron (zoals de generator ze leest: de eerste rij bevat de kolomnamen)
const leesCsv = (tekst) =>
    new Promise((resolve, reject) => {
        const rijen = [];
        Readable.from([tekst])
            .pipe(csv())
            .on('data', (rij) => rijen.push(rij))
            .on('end', () => resolve(rijen))
            .on('error', reject);
    });

// Kolommen met IRI's als waarde: _id, _type en wat in context.json "@type": "@id" heeft
const IRI_KOLOMMEN = new Set([
    '_id',
    '_type',
    ...Object.entries(skosSource.contextPrefixes)
        .filter(([, waarde]) => waarde?.['@type'] === '@id')
        .map(([kolom]) => kolom),
]);

// Prefixen van CURIE's in die kolommen (meerdere waarden met '|') die niet in config.yml staan
function ongekendePrefixen(rijen) {
    const ongekend = new Set();
    for (const rij of rijen) {
        for (const [kolom, cel] of Object.entries(rij)) {
            if (!IRI_KOLOMMEN.has(kolom) || !cel) continue;
            for (const waarde of cel.split('|').map((w) => w.trim())) {
                const curie = /^([A-Za-z][\w.-]*):(?!\/\/)/.exec(waarde);
                if (curie && !(curie[1] in skosSource.prefixes)) ongekend.add(curie[1]);
            }
        }
    }
    return [...ongekend].sort((a, b) => a.localeCompare(b));
}

describe('configuration', () => {
    // De ingelezen config.yml staat in __snapshots__/config.json: een update van js-yaml die de
    // inhoud anders inleest, valt zo op. Na een bewuste wijziging aan config.yml: 'pnpm run test -u'.
    it('reads config.yml the same way', () =>
        expect(JSON.stringify(odcsSource.config, null, 2) + '\n').toMatchFileSnapshot('__snapshots__/config.json'));

    it('loads config.yml and the SHACL shapes', () => {
        expect(Object.keys(skosSource.prefixes).length).toBeGreaterThan(0);
        expect(skosSource.shapesDataset.size).toBeGreaterThan(0);
    });

    it('defines every prefix used in an IRI column of the CSV', () =>
        Promise.all(skosSource.sourcePaths.map((bron) => leesCsv(fs.readFileSync(bron, 'utf8')))).then((bronnen) => {
            expect(ongekendePrefixen(bronnen.flat())).toEqual([]);
        }));

    it('detects an unknown prefix in any IRI column', () =>
        leesCsv('_id,_type,broader\nlzs-type:x,skos:Concept,onbekend:y|lzs-type:z\n').then((rijen) => {
            expect(ongekendePrefixen(rijen)).toEqual(['onbekend']);
        }));
});

describe('generated code list', () => {
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
