import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as git from '../src/utils/git.js';
import { artifactId, kort, leesReleases, leesRevisie, ntPad, versie } from '../src/utils/releases.js';
import rdf from '@zazuko/env-node';

vi.mock('../src/utils/git.js', () => ({ tag: vi.fn(), show: vi.fn(), mergeBase: vi.fn(), log: vi.fn() }));

const NT = '<http://example.org/x> <http://www.w3.org/2004/02/skos/core#prefLabel> "X"@nl .\n';

beforeEach(() => {
    vi.resetAllMocks();
});

describe('releases helpers', () => {
    it('versie strips the artifactId from a release tag', () => {
        expect(artifactId).toBe('codelijst-luchtzuiveringssysteem');
        expect(versie(`${artifactId}-0.2.1`)).toBe('0.2.1');
    });

    it('kort shortens with the prefixes from config.yml', () => {
        expect(kort(rdf.namedNode('http://www.w3.org/2004/02/skos/core#Concept'))).toBe('skos:Concept');
    });
});

describe('leesRevisie', () => {
    it('reads the N-Triples file from the revision', () => {
        git.show.mockResolvedValue(NT);
        return leesRevisie('v1').then((triples) => {
            expect(triples).toHaveLength(1);
            expect(git.show).toHaveBeenCalledWith(`v1:${ntPad.startsWith('./') ? ntPad : './' + ntPad}`);
        });
    });
});

describe('leesReleases', () => {
    it('reads every release, with null when the file is missing in a tag', () => {
        git.show.mockImplementation((spec) =>
            spec.startsWith(`${artifactId}-0.0.1:`) ? Promise.reject(new Error('fatal')) : Promise.resolve(NT),
        );
        return leesReleases([`${artifactId}-0.0.1`, `${artifactId}-0.1.0`]).then((releases) => {
            expect(releases.map(({ tag, label }) => [tag, label])).toEqual([
                [`${artifactId}-0.0.1`, '0.0.1'],
                [`${artifactId}-0.1.0`, '0.1.0'],
            ]);
            expect(releases[0].triples).toBeNull();
            expect(releases[1].triples).toHaveLength(1);
        });
    });
});
