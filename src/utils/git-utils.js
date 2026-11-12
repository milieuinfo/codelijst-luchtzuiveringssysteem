'use strict';
// Hulpfuncties die git-commando's uit git.js combineren. Paden zijn relatief t.o.v. de huidige map (src/).
import { tag, show, mergeBase, log } from './git.js';

/**
 * Release-tags '<artifactId>-x.y.z', hoogste versie eerst.
 * @param {string} artifactId
 * @returns {Promise<string[]>}
 */
export function releaseTags(artifactId) {
    return tag('--list', `${artifactId}-*`, '--sort=-v:refname').then((uitvoer) => uitvoer.split('\n').filter(Boolean));
}

/**
 * Of een revisie in de geschiedenis van HEAD ligt.
 * @param {string} revisie
 * @returns {Promise<boolean>}
 */
export function isVoorouderVanHead(revisie) {
    // 'merge-base --is-ancestor' geeft exit code 1 als de revisie geen voorouder is
    return mergeBase('--is-ancestor', revisie, 'HEAD').then(
        () => true,
        () => false,
    );
}

/**
 * Release-tags '<artifactId>-x.y.z' die een voorouder zijn van HEAD, oudste versie eerst.
 * @param {string} artifactId
 * @returns {Promise<string[]>}
 */
export function releaseTagsInGeschiedenis(artifactId) {
    return releaseTags(artifactId).then((tags) =>
        Promise.all(tags.map(isVoorouderVanHead)).then((voorouders) => tags.filter((_, i) => voorouders[i]).reverse()),
    );
}

/**
 * Zoals releaseTagsInGeschiedenis, maar faalt als er geen enkele release-tag gevonden wordt.
 * @param {string} artifactId
 * @returns {Promise<string[]>} oudste versie eerst, nooit leeg
 * @throws {Error} als er geen zo'n tag is (bv. omdat de tags lokaal ontbreken)
 */
export function vereisteReleaseTags(artifactId) {
    return releaseTagsInGeschiedenis(artifactId).then((tags) => {
        if (!tags.length) {
            throw new Error(
                `No release tag '${artifactId}-*' found in the history of HEAD. ` +
                    `Are the tags missing locally? Try 'git fetch --tags'.`,
            );
        }
        return tags;
    });
}

/**
 * Hoogste release-tag '<artifactId>-x.y.z' die een voorouder is van HEAD.
 * @param {string} artifactId
 * @returns {Promise<string>}
 * @throws {Error} als er geen zo'n tag is (bv. omdat de tags lokaal ontbreken)
 */
export function laatsteReleaseTag(artifactId) {
    return vereisteReleaseTags(artifactId).then((tags) => tags.at(-1));
}

/**
 * Versie uit een release-tag: '0.2.1' i.p.v. '<artifactId>-0.2.1'.
 * @param {string} artifactId
 * @param {string} releaseTag
 * @returns {string}
 */
export function versieVanTag(artifactId, releaseTag) {
    return releaseTag.startsWith(`${artifactId}-`) ? releaseTag.slice(artifactId.length + 1) : releaseTag;
}

/**
 * Commitdatum van een revisie als 'JJJJ-MM-DD'.
 * @param {string} revisie
 * @returns {Promise<string>}
 */
export function datumVanRevisie(revisie) {
    return log('-1', '--format=%cs', revisie).then((uitvoer) => uitvoer.trim());
}

/**
 * Inhoud van een bestand zoals het in een tag (of andere revisie) staat.
 * @param {string} revisie
 * @param {string} pad - relatief t.o.v. de huidige map
 * @returns {Promise<string>}
 * @throws {Error} als het bestand niet bestaat in die revisie
 */
export function bestandInRevisie(revisie, pad) {
    // '<revisie>:./pad' is relatief t.o.v. de huidige map
    return show(`${revisie}:${pad.startsWith('./') ? pad : './' + pad}`).catch(() => {
        throw new Error(`${pad} does not exist in ${revisie}.`);
    });
}
