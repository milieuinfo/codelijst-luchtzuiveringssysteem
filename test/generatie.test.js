// Genereert de codelijst opnieuw uit de CSV, met de echte generator, naar een tijdelijke map en
// vergelijkt elk bestand byte voor byte met de gecommitte versie (zoals Jenkins doet). Zo faalt
// een dependency-update die de generatie breekt of de output verandert.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generate_skos } from '@milieuinfo/maven-metadata-generator-npm';
import { skosOptions, skosSource } from '../src/utils/variables.js';

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

describe('generation from the CSV', () => {
    beforeAll(() => generate_skos(tmpOptions, skosSource));
    afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

    it.each(paren)('reproduces %s exactly', (gecommit, gegenereerd) => {
        expect(fs.existsSync(gegenereerd), `${gegenereerd} not written`).toBe(true);
        expect(fs.readFileSync(gegenereerd).equals(fs.readFileSync(gecommit))).toBe(true);
    });
});
