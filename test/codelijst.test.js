// Integratietests op de echte configuratie en de gegenereerde codelijst. Ze controleren ook dat de
// dependencies (js-yaml, @zazuko/env-node, de generator) nog samenwerken.
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import rdf from '@zazuko/env-node';
import { odcsSource, skosOptions, skosSource } from '../src/utils/variables.js';
import { leesHuidig } from '../src/utils/releases.js';

describe('configuration', () => {
    // De ingelezen config.yml staat in __snapshots__/config.json: een update van js-yaml die de
    // inhoud anders inleest, valt zo op. Na een bewuste wijziging aan config.yml: 'pnpm run test -u'.
    it('reads config.yml the same way', () =>
        expect(JSON.stringify(odcsSource.config, null, 2) + '\n').toMatchFileSnapshot('__snapshots__/config.json'));

    it('loads config.yml and the SHACL shapes', () => {
        expect(Object.keys(skosSource.prefixes).length).toBeGreaterThan(0);
        expect(skosSource.shapesDataset.size).toBeGreaterThan(0);
    });

    it('defines every prefix used in the _id column of the CSV', () => {
        const ongekend = new Set();
        for (const bron of skosSource.sourcePaths) {
            const regels = fs.readFileSync(bron, 'utf8').split('\n').slice(1);
            for (const id of regels.map((regel) => regel.split(',')[0]).filter(Boolean)) {
                const prefix = id.includes('://') ? null : id.split(':')[0];
                if (prefix && !(prefix in skosSource.prefixes)) ongekend.add(prefix);
            }
        }
        expect([...ongekend]).toEqual([]);
    });
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
