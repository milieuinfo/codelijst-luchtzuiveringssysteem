// De changelog-sectie (04_create_changelog.js) voor bewuste wijzigingen aan de echte codelijst.
// De verwachte Markdown staat in __snapshots__/: een dependency-update die de inhoud, sortering of
// opmaak verandert, valt zo op. Een bewuste wijziging aan de changelog: 'pnpm run test -u'.
import { beforeAll, describe, expect, it } from 'vitest';
import rdf from '@zazuko/env-node';
import { sectie } from '../src/04_create_changelog.js';
import {
    conceptMetVerwijzing,
    enigeWaarde,
    gewijzigd,
    huidig,
    metNieuwConcept,
    SKOS,
    zonderConcept,
} from './fixtures.js';

let triples;
beforeAll(() =>
    huidig().then((t) => {
        triples = t;
    }),
);

describe('sectie', () => {
    it('reports no changes for the same code list', () => {
        const { tekst, aantallen } = sectie({ label: '1.0.1', datum: '2026-01-02', vorige: triples, huidige: triples });
        expect(aantallen).toEqual({ toegevoegd: 0, gewijzigd: 0, verwijderd: 0 });
        expect(tekst).toBe('## [1.0.1] - 2026-01-02\n\nGeen inhoudelijke wijzigingen aan de codelijst.\n');
    });

    it('describes the first release', () =>
        expect(
            sectie({ label: '1.0.0', datum: '2026-01-01', vorige: null, huidige: triples }).tekst,
        ).toMatchFileSnapshot('__snapshots__/changelog-eerste-release.md'));

    it('describes added, changed and removed concepts', () => {
        const weg = conceptMetVerwijzing(triples);
        const label = enigeWaarde(triples, `${SKOS}prefLabel`);
        let nieuw = zonderConcept(triples, weg);
        nieuw = gewijzigd(nieuw, label, 'Gewijzigd label');
        nieuw = metNieuwConcept(nieuw, label.subject, `${label.subject.value}-nieuw`, 'Nieuw concept');

        const { tekst, aantallen } = sectie({
            label: 'Volgende versie',
            vorige: triples,
            vorigeLabel: '1.0.0',
            huidige: nieuw,
        });
        expect(aantallen).toMatchObject({ toegevoegd: 1, verwijderd: 1 });
        expect(aantallen.gewijzigd).toBeGreaterThanOrEqual(1);
        return expect(tekst).toMatchFileSnapshot('__snapshots__/changelog-wijzigingen.md');
    });

    it('describes a new property and an added value', () => {
        const label = enigeWaarde(triples, `${SKOS}prefLabel`);
        const nieuw = [
            ...triples,
            rdf.quad(
                label.subject,
                rdf.namedNode('https://data.lzs.omgeving.vlaanderen.be/ns/vocab#nieuweProperty'),
                rdf.literal('x'),
            ),
            rdf.quad(label.subject, rdf.namedNode(`${SKOS}altLabel`), rdf.literal('Ander label', 'nl')),
        ];
        const { tekst, aantallen } = sectie({ label: '1.1.0', datum: '2026-02-01', vorige: triples, huidige: nieuw });
        expect(aantallen).toEqual({ toegevoegd: 0, gewijzigd: 1, verwijderd: 0 });
        return expect(tekst).toMatchFileSnapshot('__snapshots__/changelog-property.md');
    });
});
