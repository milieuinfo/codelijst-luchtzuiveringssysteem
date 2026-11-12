'use strict';
// De changelog-sectie (04_create_changelog.js) op een kleine, vaste codelijst. De verwachte Markdown
// staat in __snapshots__/ en verandert dus enkel als de code of een dependency de inhoud, sortering of
// opmaak verandert, niet bij een wijziging aan de echte codelijst. Bewust gewijzigd: 'pnpm run test -u'.
import { writeFile } from 'node:fs/promises';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import rdf from '@zazuko/env-node';
import { maakVolledigeChangelog, sectie, voegHuidigeVersieToe } from '../src/04_create_changelog.js';
import { bestandInRevisie, datumVanRevisie, vereisteReleaseTags } from '../src/utils/git-utils.js';
import { parseNTriples } from '../src/utils/rdf.js';
import { alsTekst, huidig, vangUitvoer, vorigeRelease } from './fixtures.js';

// Geen echte git en geen CHANGELOG.md overschrijven: tags, hun bestanden en writeFile worden gesimuleerd
vi.mock('../src/utils/git-utils.js', async (importOriginal) => ({
    ...(await importOriginal()),
    bestandInRevisie: vi.fn(),
    datumVanRevisie: vi.fn(),
    vereisteReleaseTags: vi.fn(),
}));
vi.mock('node:fs/promises', async (importOriginal) => ({
    ...(await importOriginal()),
    writeFile: vi.fn(() => Promise.resolve()),
}));

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

describe('script', () => {
    const ID = 'codelijst-luchtzuiveringssysteem';
    let triples;
    beforeAll(() =>
        huidig().then((t) => {
            triples = t;
        }),
    );

    // Per tag de inhoud van het N-Triples-bestand; een tag zonder inhoud heeft geen bestand
    const releases = (inhoud) => {
        vereisteReleaseTags.mockResolvedValue(Object.keys(inhoud));
        datumVanRevisie.mockResolvedValue('2026-01-01');
        bestandInRevisie.mockImplementation((tag) =>
            inhoud[tag] ? Promise.resolve(inhoud[tag]) : Promise.reject(new Error(`missing in ${tag}`)),
        );
    };
    const geschreven = () => {
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile.mock.calls[0][0]).toBe('../CHANGELOG.md');
        return writeFile.mock.calls[0][1];
    };

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        writeFile.mockClear();
    });

    it('adds the current files as the next version', () => {
        vangUitvoer(vi);
        vi.stubEnv('VERSION', undefined);
        releases({ [`${ID}-1.0.0`]: alsTekst(vorigeRelease(triples)) });
        return voegHuidigeVersieToe().then(() => {
            const tekst = geschreven();
            expect(tekst).toMatch(/^# Changelog/);
            expect(tekst).toContain('## [Volgende versie]\n\nNog niet gepubliceerd: wijzigingen t.o.v. release 1.0.0.');
            expect(tekst.match(/^## \[Volgende versie\]/gm)).toHaveLength(1);
        });
    });

    it('replaces the next version by the released version', () => {
        vangUitvoer(vi);
        vi.stubEnv('VERSION', '1.1.0');
        releases({ [`${ID}-1.0.0`]: alsTekst(vorigeRelease(triples)) });
        return voegHuidigeVersieToe().then(() => {
            const tekst = geschreven();
            expect(tekst).toMatch(/^## \[1\.1\.0\] - \d{4}-\d{2}-\d{2}$/m);
            expect(tekst).not.toContain('## [Volgende versie]');
        });
    });

    it('refuses a version that is already released', () => {
        vangUitvoer(vi);
        vi.stubEnv('VERSION', '1.0.0');
        releases({ [`${ID}-1.0.0`]: alsTekst(triples) });
        return expect(voegHuidigeVersieToe()).rejects.toThrow('Version 1.0.0 is already released');
    });

    it('rebuilds the changelog from all release tags with --full', () => {
        const uitvoer = vangUitvoer(vi);
        vi.stubEnv('VERSION', undefined);
        releases({
            [`${ID}-0.9.0`]: null,
            [`${ID}-1.0.0`]: alsTekst(vorigeRelease(triples)),
            [`${ID}-1.1.0`]: alsTekst(triples),
        });
        return maakVolledigeChangelog().then(() => {
            const secties = geschreven().match(/^## \[[^\]]+\].*$/gm);
            expect(secties).toEqual([
                '## [Volgende versie]',
                '## [1.1.0] - 2026-01-01',
                '## [1.0.0] - 2026-01-01',
                '## [0.9.0] - 2026-01-01',
            ]);
            expect(uitvoer()).toContain('no code list');
        });
    });

    it('does not add the current files with --full when the version is already released', () => {
        const uitvoer = vangUitvoer(vi);
        vi.stubEnv('VERSION', '1.0.0');
        releases({ [`${ID}-1.0.0`]: alsTekst(triples) });
        return maakVolledigeChangelog().then(() => {
            expect(geschreven().match(/^## \[[^\]]+\].*$/gm)).toEqual(['## [1.0.0] - 2026-01-01']);
            expect(uitvoer()).toContain('Version 1.0.0 is already released');
        });
    });
});
