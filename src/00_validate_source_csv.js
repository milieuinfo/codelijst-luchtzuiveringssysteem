'use strict';
// Controleert de bron-CSV vóór de generatie, op fouten die een spreadsheet er makkelijk insluipt:
//
// - elke prefix van een CURIE in een IRI-kolom (_id, _type en wat in context.json "@type": "@id" heeft)
//   staat in prefixes: van config.yml;
// - elke waarde in een kolom met een XSD-datatype in context.json heeft een geldige lexicale vorm,
//   bv. '0.8' en niet '0,8' voor een xsd:decimal (gebeurd vóór release 0.2.2).
//
// Gebruik (vanuit src/):  node 00_validate_source_csv.js
// Exit code 1 bij een fout; create_skos_only genereert dan niets.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { skosSource } from './utils/variables.js';
import { parseCsv } from './utils/csv.js';
import { style, symbol, print, plural } from './utils/console.js';
import { isMainModule } from './utils/script.js';

// Kolommen met IRI's als waarde
const IRI_KOLOMMEN = new Set([
    '_id',
    '_type',
    ...Object.entries(skosSource.contextPrefixes)
        .filter(([, waarde]) => waarde?.['@type'] === '@id')
        .map(([kolom]) => kolom),
]);

// Geldige lexicale vorm per XSD-datatype (https://www.w3.org/TR/xmlschema11-2/)
const XSD = 'http://www.w3.org/2001/XMLSchema#';
const LEXICALE_VORM = {
    [`${XSD}boolean`]: /^(true|false|1|0)$/,
    [`${XSD}date`]: /^-?\d{4,}-\d{2}-\d{2}(Z|[+-]\d{2}:\d{2})?$/,
    [`${XSD}dateTime`]: /^-?\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
    [`${XSD}decimal`]: /^[+-]?(\d+(\.\d*)?|\.\d+)$/,
    [`${XSD}integer`]: /^[+-]?\d+$/,
};

// Kolommen met een XSD-datatype in context.json, met dat datatype
const DATATYPE_KOLOMMEN = new Map(
    Object.entries(skosSource.contextPrefixes)
        .filter(([, waarde]) => waarde?.['@type']?.startsWith(XSD))
        .map(([kolom, waarde]) => [kolom, waarde['@type']]),
);

// De waarden van een cel (meerdere met '|')
const waarden = (cel) => cel.split('|').map((w) => w.trim());

/**
 * Prefixen van CURIE's in de IRI-kolommen die niet in config.yml staan, alfabetisch.
 * @param {Record<string, string>[]} rijen
 * @returns {string[]}
 */
export function ongekendePrefixen(rijen) {
    const ongekend = new Set();
    for (const rij of rijen) {
        for (const [kolom, cel] of Object.entries(rij)) {
            if (!IRI_KOLOMMEN.has(kolom) || !cel) continue;
            for (const waarde of waarden(cel)) {
                const curie = /^([A-Za-z][\w.-]*):(?!\/\/)/.exec(waarde);
                if (curie && !(curie[1] in skosSource.prefixes)) ongekend.add(curie[1]);
            }
        }
    }
    return [...ongekend].sort((a, b) => a.localeCompare(b));
}

/**
 * Waarden zonder geldige lexicale vorm voor het datatype van hun kolom, als 'id kolom: waarde (datatype)'.
 * De bron heeft de kolom _id en lege cellen; de gegenereerde CSV de kolom id en 'null' voor een lege cel.
 * @param {Record<string, string>[]} rijen
 * @param {string} [leeg] - waarde van een lege cel
 * @returns {string[]}
 * @throws {Error} bij een datatype zonder patroon: voeg het toe aan LEXICALE_VORM
 */
export function ongeldigeWaarden(rijen, leeg = '') {
    const ongeldig = [];
    for (const rij of rijen) {
        for (const [kolom, cel] of Object.entries(rij)) {
            const datatype = DATATYPE_KOLOMMEN.get(kolom);
            if (!datatype || !cel || cel === leeg) continue;
            const patroon = LEXICALE_VORM[datatype];
            if (!patroon) throw new Error(`No pattern for ${datatype} (column ${kolom}).`);
            for (const waarde of waarden(cel)) {
                if (!patroon.test(waarde))
                    ongeldig.push(`${rij._id ?? rij.id} ${kolom}: ${waarde} (${datatype.slice(XSD.length)})`);
            }
        }
    }
    return ongeldig;
}

/**
 * Leest de bron-CSV's en schrijft de fouten uit; zet de exit code op 1 bij een fout.
 * @returns {Promise<void>}
 */
export function valideerBron() {
    print.title('Validation of the source CSV');
    return Promise.all(skosSource.sourcePaths.map((bron) => readFile(bron, 'utf8').then(parseCsv))).then((bronnen) => {
        const rijen = bronnen.flat();
        print.keyValue({
            Files: skosSource.sourcePaths.map((p) => style.cyan(path.basename(p))).join(', '),
            Rows: style.bold(rijen.length),
        });
        const prefixen = ongekendePrefixen(rijen);
        const ongeldig = ongeldigeWaarden(rijen);
        if (prefixen.length) {
            print.error(`${plural(prefixen.length, 'prefix', 'prefixes')} not in config.yml`);
            prefixen.forEach((p) => print.errorDetail(`${style.red(symbol.bullet)} ${p}`));
        }
        if (ongeldig.length) {
            print.error(`${plural(ongeldig.length, 'value', 'values')} not valid for the datatype of the column`);
            ongeldig.forEach((o) => print.errorDetail(`${style.red(symbol.bullet)} ${o}`));
        }
        if (prefixen.length || ongeldig.length) {
            process.exitCode = 1;
        } else {
            print.success('The source CSV is valid');
        }
    });
}

// Enkel als script gestart; bij een import (bv. in de tests) gebeurt er niets
if (isMainModule(import.meta.url)) {
    valideerBron().catch((err) => {
        print.error(err.message);
        process.exitCode = 1;
    });
}
