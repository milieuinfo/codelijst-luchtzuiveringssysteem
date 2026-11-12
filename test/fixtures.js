'use strict';
// Hulpfuncties voor tests op de echte codelijst: deterministisch gekozen concepten en kopieën van de
// triples met een bewuste wijziging (concept verwijderd, waarde verwijderd of gewijzigd).
import rdf from '@zazuko/env-node';
import { leesHuidig } from '../src/utils/releases.js';
import { tripleKey } from '../src/utils/rdf.js';

export const SKOS = 'http://www.w3.org/2004/02/skos/core#';

export const huidig = () => leesHuidig();

const sorteer = (termen) =>
    [...new Map(termen.map((t) => [t.value, t])).values()].sort((a, b) => (a.value < b.value ? -1 : 1));

/** Eerste concept (alfabetisch) waarnaar een ander concept verwijst met skos:broader. */
export function conceptMetVerwijzing(triples) {
    return sorteer(triples.filter((q) => q.predicate.value === `${SKOS}broader`).map((q) => q.object))[0];
}

/** Eerste triple (alfabetisch op subject) met een predicaat dat bij dat subject maar één waarde heeft. */
export function enigeWaarde(triples, predicaat) {
    const perSubject = new Map();
    for (const q of triples.filter((t) => t.predicate.value === predicaat)) {
        perSubject.set(q.subject.value, [...(perSubject.get(q.subject.value) ?? []), q]);
    }
    const [, [q]] = [...perSubject.entries()]
        .filter(([, lijst]) => lijst.length === 1)
        .sort(([a], [b]) => (a < b ? -1 : 1))[0];
    return q;
}

/** Zonder het concept: alle triples met het concept als subject of object. */
export const zonderConcept = (triples, concept) =>
    triples.filter((q) => !q.subject.equals(concept) && !q.object.equals(concept));

export const zonder = (triples, weg) => triples.filter((q) => !q.equals(weg));

/** Met een andere waarde (zelfde taal) voor de triple. */
export const gewijzigd = (triples, q, nieuweWaarde) => [
    ...zonder(triples, q),
    rdf.quad(q.subject, q.predicate, rdf.literal(nieuweWaarde, q.object.language || undefined)),
];

/**
 * Een fictieve vorige release t.o.v. de huidige triples: met een concept dat nu ontbreekt (en een
 * verwijzing ernaar), een waarde die nu ontbreekt en een prefLabel dat nu anders is.
 */
export function vorigeRelease(triples) {
    const q = enigeWaarde(triples, `${SKOS}prefLabel`);
    const weg = rdf.namedNode('https://data.omgeving.vlaanderen.be/id/concept/lzs/type/verwijderd');
    const label = (tekst) => rdf.literal(tekst, 'nl');
    return [
        ...gewijzigd(triples, q, 'Oud label'),
        rdf.quad(weg, rdf.namedNode(`${SKOS}prefLabel`), label('Verwijderd concept')),
        rdf.quad(q.subject, rdf.namedNode(`${SKOS}related`), weg),
        rdf.quad(q.subject, rdf.namedNode(`${SKOS}altLabel`), label('Verwijderde waarde')),
    ];
}

/** Triples als N-Triples-tekst, zoals in een release-tag. */
export const alsTekst = (triples) => triples.map(tripleKey).join('\n') + '\n';

/** Vangt de uitvoer van console op (in volgorde); geeft een functie terug die alle uitvoer als één tekst geeft. */
export function vangUitvoer(vi) {
    const regels = [];
    for (const methode of ['log', 'warn', 'error']) {
        vi.spyOn(console, methode).mockImplementation((...args) => regels.push(args.join(' ')));
    }
    return () => regels.join('\n');
}
