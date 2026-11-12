// Genereert de codelijst opnieuw uit de CSV, met de echte generator, naar een tijdelijke map en
// vergelijkt elk bestand byte voor byte met de gecommitte versie (zoals Jenkins doet). Zo faalt
// een dependency-update die de generatie breekt of de output verandert.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { create_odcs, generate_skos } from '@milieuinfo/maven-metadata-generator-npm';
import { metadataOptions, odcsOptions, odcsSource, skosOptions, skosSource } from '../src/utils/variables.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codelijst-'));
const naarTmp = (pad) => path.join(tmp, path.basename(pad));

// dezelfde opties, maar elk uitvoerbestand in de tijdelijke map
const tmpOptions = Object.fromEntries(
    Object.entries(skosOptions).map(([key, value]) => [
        key,
        typeof value === 'string' ? naarTmp(value) : { ...value, file: naarTmp(value.file) },
    ]),
);
const paren = Object.values(skosOptions).map((value) => {
    const pad = typeof value === 'string' ? value : value.file;
    return [pad, naarTmp(pad)];
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('generation from the CSV', () => {
    beforeAll(() => generate_skos(tmpOptions, skosSource));

    it.each(paren)('reproduces %s exactly', (gecommit, gegenereerd) => {
        expect(fs.existsSync(gegenereerd), `${gegenereerd} not written`).toBe(true);
        expect(fs.readFileSync(gegenereerd).equals(fs.readFileSync(gecommit))).toBe(true);
    });
});

// Het ODCS data contract (02_metadata.js) komt uit het parquet-bestand en de SHACL-shapes, zonder
// netwerk. De verwachte inhoud staat in __snapshots__/odcs.yaml, met <versie> en <tijdstip> in plaats
// van de versie uit pom.xml en het tijdstip: die veranderen bij elke release en build.
describe('ODCS data contract', () => {
    it('is generated the same way', () => {
        const bestand = path.join(tmp, 'odcs.yaml');
        return create_odcs(odcsSource, metadataOptions, { ...odcsOptions, file: bestand }).then(() => {
            const inhoud = fs
                .readFileSync(bestand, 'utf8')
                .replaceAll(metadataOptions.next_release_version, '<versie>')
                .replace(/^contractCreatedTs: .*$/m, 'contractCreatedTs: <tijdstip>');
            return expect(inhoud).toMatchFileSnapshot('__snapshots__/odcs.yaml');
        });
    });
});
