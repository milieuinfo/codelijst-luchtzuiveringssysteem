'use strict';
// Hulpfuncties voor tests op de echte codelijst: deterministisch gekozen concepten en kopieën van de
// triples met een bewuste wijziging (concept verwijderd, waarde verwijderd of gewijzigd).
import rdf from '@zazuko/env-node';
import { leesHuidig } from '../src/utils/releases.js';

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
