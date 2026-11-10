'use strict';
// Hulpfuncties die git-commando's uit git.js combineren. Paden zijn relatief t.o.v. de huidige map (src/).
import { tag, show, mergeBase } from './git.js';

/**
 * Release-tags '<artifactId>-x.y.z', hoogste versie eerst.
 * @param {string} artifactId
 * @returns {Promise<string[]>}
 */
export function releaseTags(artifactId) {
    return tag('--list', `${artifactId}-*`, '--sort=-v:refname')
        .then(uitvoer => uitvoer.split('\n').filter(Boolean));
}

/**
 * Of een revisie in de geschiedenis van HEAD ligt.
 * @param {string} revisie
 * @returns {Promise<boolean>}
 */
export function isVoorouderVanHead(revisie) {
    // 'merge-base --is-ancestor' geeft exit code 1 als de revisie geen voorouder is
    return mergeBase('--is-ancestor', revisie, 'HEAD').then(() => true, () => false);
}

/**
 * Hoogste release-tag '<artifactId>-x.y.z' die een voorouder is van HEAD.
 * @param {string} artifactId
 * @returns {Promise<string>}
 * @throws {Error} als er geen zo'n tag is (bv. omdat de tags lokaal ontbreken)
 */
export function laatsteReleaseTag(artifactId) {
    return releaseTags(artifactId)
        .then(tags => Promise.all(tags.map(isVoorouderVanHead))
            .then(voorouders => tags.find((_, i) => voorouders[i])))
        .then(gevonden => {
            if (!gevonden) {
                throw new Error(`No release tag '${artifactId}-*' found in the history of HEAD. `
                    + `Are the tags missing locally? Try 'git fetch --tags'.`);
            }
            return gevonden;
        });
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
    return show(`${revisie}:${pad.startsWith('./') ? pad : './' + pad}`)
        .catch(() => {
            throw new Error(`${pad} does not exist in ${revisie}.`);
        });
}
