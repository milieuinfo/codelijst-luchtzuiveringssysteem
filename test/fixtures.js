// Hulpfuncties voor tests op de echte codelijst: deterministisch gekozen concepten en kopieën van de
// triples met een bewuste wijziging (concept verwijderd, waarde verwijderd of gewijzigd, concept nieuw).
import rdf from '@zazuko/env-node';
import { leesHuidig } from '../src/utils/releases.js';

export const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

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

/** Met een nieuw concept in hetzelfde schema als het gegeven concept. */
export function metNieuwConcept(triples, naast, iri, label) {
    const schema = triples.find((q) => q.subject.equals(naast) && q.predicate.value === `${SKOS}inScheme`).object;
    const s = rdf.namedNode(iri);
    return [
        ...triples,
        rdf.quad(s, rdf.namedNode(RDF_TYPE), rdf.namedNode(`${SKOS}Concept`)),
        rdf.quad(s, rdf.namedNode(`${SKOS}prefLabel`), rdf.literal(label, 'nl')),
        rdf.quad(s, rdf.namedNode(`${SKOS}inScheme`), schema),
    ];
}
