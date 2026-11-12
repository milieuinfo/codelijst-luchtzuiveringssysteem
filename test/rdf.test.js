'use strict';
import { describe, expect, it } from 'vitest';
import { groupBy, parseNTriples, shorten, shortenIri, toNT, tripleKey } from '../src/utils/rdf.js';

const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const prefixes = {
    skos: SKOS,
    ex: 'http://example.org/',
    exa: 'http://example.org/a/',
    '@base': 'http://example.org/',
};

const ntriples = [
    `<http://example.org/a/1> <${SKOS}prefLabel> "Eén"@nl .`,
    `<http://example.org/a/1> <${SKOS}notation> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .`,
    `<http://example.org/a/1> <${SKOS}note> "tekst" .`,
    `_:b0 <${SKOS}related> <http://example.org/a/1> .`,
].join('\n');

describe('parseNTriples', () => {
    it('parses every triple', () =>
        parseNTriples(ntriples).then((quads) => {
            expect(quads).toHaveLength(4);
        }));

    it('returns an empty list for empty input', () =>
        parseNTriples('').then((quads) => {
            expect(quads).toEqual([]);
        }));
});

describe('toNT and tripleKey', () => {
    it('writes every kind of term in N-Triples notation', () =>
        parseNTriples(ntriples).then((quads) => {
            const keys = quads.map(tripleKey);
            expect(keys).toContain(`<http://example.org/a/1> <${SKOS}prefLabel> "Eén"@nl .`);
            expect(keys).toContain(
                `<http://example.org/a/1> <${SKOS}notation> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .`,
            );
            // xsd:string wordt niet uitgeschreven
            expect(keys).toContain(`<http://example.org/a/1> <${SKOS}note> "tekst" .`);
            const blank = quads.find((quad) => quad.subject.termType === 'BlankNode');
            expect(toNT(blank.subject)).toMatch(/^_:/);
        }));

    it('escapes quotes in literals', () =>
        parseNTriples(`<http://example.org/x> <${SKOS}note> "een \\"citaat\\"" .`).then(([quad]) => {
            expect(toNT(quad.object)).toBe('"een \\"citaat\\""');
        }));
});

describe('shortenIri', () => {
    it('uses the longest matching namespace', () => {
        expect(shortenIri('http://example.org/a/1', prefixes)).toBe('exa:1');
        expect(shortenIri('http://example.org/b', prefixes)).toBe('ex:b');
    });

    it('ignores keys starting with @', () => {
        expect(shortenIri('http://example.org/b', { '@base': 'http://example.org/' })).toBe('<http://example.org/b>');
    });

    it('keeps the full IRI without a match', () => {
        expect(shortenIri('https://other.org/x', prefixes)).toBe('<https://other.org/x>');
    });
});

describe('shorten', () => {
    it('shortens IRIs and datatypes, keeps language tags', () =>
        parseNTriples(ntriples).then((quads) => {
            const short = quads.map((quad) => `${shorten(quad.predicate, prefixes)} ${shorten(quad.object, prefixes)}`);
            expect(short).toContain('skos:prefLabel "Eén"@nl');
            expect(short).toContain('skos:notation "1"^^<http://www.w3.org/2001/XMLSchema#integer>');
            expect(short).toContain('skos:related exa:1');
        }));
});

describe('groupBy', () => {
    it('groups by key in order of first occurrence', () => {
        const groups = groupBy(['b1', 'a1', 'b2'], (item) => item[0]);
        expect([...groups.keys()]).toEqual(['b', 'a']);
        expect(groups.get('b')).toEqual(['b1', 'b2']);
    });
});
