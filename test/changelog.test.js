'use strict';
// De changelog-sectie (04_create_changelog.js) op een kleine, vaste codelijst. De verwachte Markdown
// staat in __snapshots__/ en verandert dus enkel als de code of een dependency de inhoud, sortering of
// opmaak verandert, niet bij een wijziging aan de echte codelijst. Bewust gewijzigd: 'pnpm run test -u'.
import { beforeAll, describe, expect, it } from 'vitest';
import rdf from '@zazuko/env-node';
import { sectie } from '../src/04_create_changelog.js';
import { parseNTriples } from '../src/utils/rdf.js';

const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const SCHEMA = 'https://data.omgeving.vlaanderen.be/id/conceptscheme/lzs/test';
const C = 'https://data.omgeving.vlaanderen.be/id/concept/lzs/type/';
const VOCAB = 'https://data.lzs.omgeving.vlaanderen.be/ns/vocab#';

const nt = (s, p, o) => `<${s}> <${p}> ${o} .`;
const label = (tekst) => `"${tekst}"@nl`;
const concept = (id, tekst, extra = []) => [
    nt(C + id, TYPE, `<${SKOS}Concept>`),
    nt(C + id, `${SKOS}prefLabel`, label(tekst)),
    nt(C + id, `${SKOS}inScheme`, `<${SCHEMA}>`),
    ...extra,
];
const VORIGE = [
    nt(SCHEMA, TYPE, `<${SKOS}ConceptScheme>`),
    nt(SCHEMA, `${SKOS}prefLabel`, label('Testschema')),
    ...concept('a', 'Systeem A', [nt(C + 'a', `${SKOS}topConceptOf`, `<${SCHEMA}>`)]),
    ...concept('b', 'Systeem B', [nt(C + 'b', `${SKOS}broader`, `<${C}a>`)]),
    ...concept('c', 'Systeem C', [nt(C + 'c', `${SKOS}broader`, `<${C}a>`)]),
    ...concept('d', 'Systeem D'),
].join('\n');

let vorige;
beforeAll(() =>
    parseNTriples(VORIGE).then((triples) => {
        vorige = triples;
    }),
);

const metIri = (triples, iri) => (q) => q.subject.value === iri || q.object.value === iri;

describe('sectie', () => {
    it('reports no changes for the same code list', () => {
        const { tekst, aantallen } = sectie({ label: '1.0.1', datum: '2026-01-02', vorige, huidige: vorige });
        expect(aantallen).toEqual({ toegevoegd: 0, gewijzigd: 0, verwijderd: 0 });
        expect(tekst).toBe('## [1.0.1] - 2026-01-02\n\nGeen inhoudelijke wijzigingen aan de codelijst.\n');
    });

    it('describes the first release', () => {
        const { tekst, aantallen } = sectie({ label: '1.0.0', datum: '2026-01-01', vorige: null, huidige: vorige });
        expect(aantallen).toEqual({ toegevoegd: 4, gewijzigd: 0, verwijderd: 0 });
        return expect(tekst).toMatchFileSnapshot('__snapshots__/changelog-eerste-release.md');
    });

    it('describes added, changed and removed concepts', () => {
        // a verwijderd (b en c verliezen hun broader), label van d gewijzigd, e nieuw
        const nieuw = vorige
            .filter((q) => !metIri(vorige, C + 'a')(q))
            .filter((q) => !(q.subject.value === C + 'd' && q.predicate.value === `${SKOS}prefLabel`));
        nieuw.push(
            rdf.quad(rdf.namedNode(C + 'd'), rdf.namedNode(`${SKOS}prefLabel`), rdf.literal('Systeem D2', 'nl')),
        );
        return parseNTriples(concept('e', 'Systeem E').join('\n')).then((e) => {
            const { tekst, aantallen } = sectie({
                label: 'Volgende versie',
                vorige,
                vorigeLabel: '1.0.0',
                huidige: [...nieuw, ...e],
            });
            expect(aantallen).toEqual({ toegevoegd: 1, gewijzigd: 3, verwijderd: 1 });
            return expect(tekst).toMatchFileSnapshot('__snapshots__/changelog-wijzigingen.md');
        });
    });

    it('describes a new property and an added value', () => {
        const d = rdf.namedNode(C + 'd');
        const nieuw = [
            ...vorige,
            rdf.quad(d, rdf.namedNode(`${VOCAB}nieuweProperty`), rdf.literal('x')),
            rdf.quad(d, rdf.namedNode(`${SKOS}altLabel`), rdf.literal('Ander label', 'nl')),
        ];
        const { tekst, aantallen } = sectie({ label: '1.1.0', datum: '2026-02-01', vorige, huidige: nieuw });
        expect(aantallen).toEqual({ toegevoegd: 0, gewijzigd: 1, verwijderd: 0 });
        return expect(tekst).toMatchFileSnapshot('__snapshots__/changelog-property.md');
    });
});
