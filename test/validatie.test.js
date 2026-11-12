'use strict';
// De vergelijking met de vorige release (03_validate_against_previous_release.js): deelt verdwenen
// triples correct in, zodat een dependency-update de controle niet ongemerkt uitschakelt.
import { beforeAll, describe, expect, it } from 'vitest';
import { leesRegel, vergelijk } from '../src/03_validate_against_previous_release.js';
import { toNT } from '../src/utils/rdf.js';
import { conceptMetVerwijzing, enigeWaarde, gewijzigd, huidig, SKOS, zonder, zonderConcept } from './fixtures.js';

let triples;
beforeAll(() =>
    huidig().then((t) => {
        triples = t;
    }),
);

const vergelijkMet = (nieuw, regels = []) => vergelijk({ tag: 'vorige', vorige: triples, huidig: nieuw, regels });

describe('vergelijk', () => {
    it('finds nothing when the code list is unchanged', () => {
        const r = vergelijkMet([...triples].reverse());
        expect(r.verwijderdeConcepten.size).toBe(0);
        expect(r.verwijderdeWaarden).toEqual([]);
        expect(r.gewijzigd.size).toBe(0);
        expect(r.aantallen).toEqual({ vorige: triples.length, huidig: triples.length, toegevoegd: 0, verwijderd: 0 });
    });

    it('reports a removed concept, including the references to it', () => {
        const concept = conceptMetVerwijzing(triples);
        const nieuw = zonderConcept(triples, concept);
        const r = vergelijkMet(nieuw);
        const gevonden = r.verwijderdeConcepten.get(toNT(concept));
        expect([...r.verwijderdeConcepten.keys()]).toEqual([toNT(concept)]);
        expect(gevonden.triples).toHaveLength(triples.length - nieuw.length);
        expect(gevonden.verwijzingen).toBe(triples.filter((q) => q.object.equals(concept)).length);
        expect(gevonden.verwijzingen).toBeGreaterThan(0);
    });

    it('reports a removed value', () => {
        const q = enigeWaarde(triples, `${SKOS}prefLabel`);
        const r = vergelijkMet(zonder(triples, q));
        expect(r.verwijderdeConcepten.size).toBe(0);
        expect(r.verwijderdeWaarden.map((t) => t.equals(q))).toEqual([true]);
    });

    it('reports a changed value as a change, not as a removal', () => {
        const q = enigeWaarde(triples, `${SKOS}prefLabel`);
        const r = vergelijkMet(gewijzigd(triples, q, 'Nieuw label'));
        expect(r.verwijderdeWaarden).toEqual([]);
        const [wijziging] = r.gewijzigd.values();
        expect(r.gewijzigd.size).toBe(1);
        expect(wijziging.oud.map((o) => o.value)).toEqual([q.object.value]);
        expect(wijziging.nieuw.map((o) => o.value)).toEqual(['Nieuw label']);
    });

    it('allows a removal that is in the allowlist', () =>
        leesRegel(toNT(conceptMetVerwijzing(triples)), 1).then((regel) => {
            const concept = conceptMetVerwijzing(triples);
            const r = vergelijkMet(zonderConcept(triples, concept), [regel]);
            expect(r.verwijderdeConcepten.size).toBe(0);
            expect(r.toegestaan.length).toBeGreaterThan(0);
            expect(regel.gebruikt).toBe(r.toegestaan.length);
        }));
});

describe('leesRegel (toegestane-verwijderingen.txt)', () => {
    it('expands a CURIE subject with the prefixes from config.yml', () =>
        leesRegel('skos:Concept', 3).then((regel) => {
            expect(regel).toMatchObject({ regelnr: 3, subject: `<${SKOS}Concept>` });
            expect(regel.predicaat).toBeUndefined();
        }));

    it('reads a subject and predicate', () =>
        leesRegel('<http://example.org/x> skos:prefLabel', 1).then((regel) => {
            expect(regel).toMatchObject({ subject: '<http://example.org/x>', predicaat: `<${SKOS}prefLabel>` });
        }));

    it('reads a complete N-Triples line', () =>
        leesRegel(`<http://example.org/x> <${SKOS}prefLabel> "X"@nl .`, 1).then((regel) => {
            expect(regel.triple).toBe(`<http://example.org/x> <${SKOS}prefLabel> "X"@nl .`);
        }));

    it('rejects unknown prefixes, invalid lines and too many tokens', () =>
        Promise.all([
            expect(leesRegel('onbekend:x', 7)).rejects.toThrow(":7: 'onbekend:x' is not an IRI or known CURIE."),
            expect(leesRegel('<http://example.org/x> kapot .', 8)).rejects.toThrow(':8: not a valid N-Triples line.'),
            expect(leesRegel('a:b c:d e:f', 9)).rejects.toThrow(':9: expected a subject'),
        ]));
});
