'use strict';
// Gedeelde logica voor de scripts die releases van de codelijst vergelijken
// (03_validate_against_previous_release.js en 04_create_changelog.js).
// Enkel de N-Triples tellen: de andere formaten zijn serialisaties van dezelfde graaf.
import fs from 'node:fs';
import { skosOptions, skosSource, metadataOptions } from './variables.js';
import { bestandInRevisie, versieVanTag } from './git-utils.js';
import { parseNTriples, shorten } from './rdf.js';

/** Pad van het gegenereerde N-Triples-bestand, relatief t.o.v. src/. */
export const ntPad = skosOptions.ntriplesPath;

/** ArtifactId uit pom.xml; de release-tags heten '<artifactId>-x.y.z'. */
export const artifactId = metadataOptions.artifactId;

/** Prefixen uit config.yml. */
export const prefixes = skosSource.prefixes;

/** Leesbare notatie van een term, met de prefixen uit config.yml. */
export const kort = (term) => shorten(term, prefixes);

/** '0.2.1' i.p.v. 'codelijst-luchtzuiveringssysteem-0.2.1'. */
export const versie = (releaseTag) => versieVanTag(artifactId, releaseTag);

/**
 * De triples van de huidige gegenereerde bestanden.
 * @returns {Promise<import('@rdfjs/types').Quad[]>}
 */
export function leesHuidig() {
    return Promise.resolve()
        .then(() => fs.readFileSync(ntPad, 'utf8'))
        .then(parseNTriples);
}

/**
 * De triples van een release-tag (of andere revisie).
 * @param {string} revisie
 * @returns {Promise<import('@rdfjs/types').Quad[]>}
 * @throws {Error} als het bestand in die revisie ontbreekt
 */
export function leesRevisie(revisie) {
    return bestandInRevisie(revisie, ntPad).then(parseNTriples);
}

/**
 * Leest de triples van elke release; `triples` is null als het bestand in die tag ontbreekt.
 * @param {string[]} tags
 * @returns {Promise<{ tag: string, label: string, triples: import('@rdfjs/types').Quad[]|null }[]>}
 */
export function leesReleases(tags) {
    return Promise.all(tags.map(tag => leesRevisie(tag)
        .then(triples => ({ tag, label: versie(tag), triples }), () => ({ tag, label: versie(tag), triples: null }))));
}
