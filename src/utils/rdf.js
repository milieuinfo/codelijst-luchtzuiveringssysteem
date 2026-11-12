'use strict';
// Small, generic helpers for working with RDF terms and N-Triples, built on @zazuko/env-node.
//
//   import { parseNTriples, toNT, tripleKey, shorten } from './utils/rdf.js';
//   parseNTriples(text).then(quads => quads.map(tripleKey));
//   shorten(quad.subject, { skos: 'http://www.w3.org/2004/02/skos/core#' });   // 'skos:Concept'

import { Readable } from 'node:stream';
import rdf from '@zazuko/env-node';

const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

/**
 * Parses N-Triples text.
 * @param {string} text
 * @returns {Promise<import('@rdfjs/types').Quad[]>}
 */
export function parseNTriples(text) {
    return Promise.resolve()
        .then(() => rdf.formats.parsers.import('application/n-triples', Readable.from([text])))
        .then((stream) => rdf.dataset().import(stream))
        .then((dataset) => [...dataset]);
}

/**
 * N-Triples notation of a term, usable as a key: '<iri>', '_:b0', '"text"@nl', '"1"^^<...#integer>'.
 * @param {import('@rdfjs/types').Term} term
 * @returns {string}
 */
export function toNT(term) {
    if (term.termType === 'NamedNode') return `<${term.value}>`;
    if (term.termType === 'BlankNode') return `_:${term.value}`;
    const value = JSON.stringify(term.value);
    if (term.language) return `${value}@${term.language}`;
    if (term.datatype.value === XSD_STRING) return value;
    return `${value}^^<${term.datatype.value}>`;
}

/**
 * N-Triples line of a quad (without graph), usable as a key.
 * @param {import('@rdfjs/types').Quad} quad
 * @returns {string}
 */
export function tripleKey(quad) {
    return `${toNT(quad.subject)} ${toNT(quad.predicate)} ${toNT(quad.object)} .`;
}

/**
 * Shortens an IRI with the longest matching namespace: 'skos:Concept', or '<iri>' without a match.
 * @param {string} iri
 * @param {Object<string, string>} prefixes - prefix -> namespace
 * @returns {string}
 */
export function shortenIri(iri, prefixes) {
    let best = null;
    for (const [prefix, namespace] of Object.entries(prefixes)) {
        if (typeof namespace !== 'string' || prefix.startsWith('@')) continue;
        if (iri.startsWith(namespace) && (!best || namespace.length > best[1].length)) best = [prefix, namespace];
    }
    return best ? `${best[0]}:${iri.slice(best[1].length)}` : `<${iri}>`;
}

/**
 * Readable notation of a term: like toNT, but IRIs and datatypes shortened with the prefixes.
 * @param {import('@rdfjs/types').Term} term
 * @param {Object<string, string>} prefixes - prefix -> namespace
 * @returns {string}
 */
export function shorten(term, prefixes) {
    if (term.termType === 'NamedNode') return shortenIri(term.value, prefixes);
    if (term.termType !== 'Literal') return toNT(term);
    const value = JSON.stringify(term.value);
    if (term.language) return `${value}@${term.language}`;
    if (term.datatype.value === XSD_STRING) return value;
    return `${value}^^${shortenIri(term.datatype.value, prefixes)}`;
}

/**
 * Groups a list by key, keeping the order of first occurrence.
 * @template T
 * @param {T[]} list
 * @param {(item: T) => string} keyFn
 * @returns {Map<string, T[]>}
 */
export function groupBy(list, keyFn) {
    const map = new Map();
    for (const item of list) {
        const key = keyFn(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    }
    return map;
}
