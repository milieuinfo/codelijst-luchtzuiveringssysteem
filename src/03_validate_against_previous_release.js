'use strict';
// Vergelijkt de gegenereerde codelijst met die van de vorige release (git tag).
//
// 1. De huidige N-Triples worden gevalideerd tegen de SHACL-shapes van het AP.
// 2. Elke triple uit de vorige release die nu ontbreekt, wordt ingedeeld als:
//    - verwijderd concept:  het subject komt nergens meer voor            -> fout
//    - verwijderde waarde:  subject + predicaat verloren een waarde,
//                           zonder dat er een nieuwe waarde bij kwam      -> fout
//    - gewijzigde waarde:   subject + predicaat kregen een andere waarde  -> waarschuwing
//    Verwijderingen die in source/toegestane-verwijderingen.txt staan, zijn toegestaan.
//
// Gebruik (vanuit src/):  node 03_validate_against_previous_release.js [--tag <git-tag>] [--history]
// Zonder --tag (of omgevingsvariabele VORIGE_RELEASE_TAG) wordt de hoogste release-tag
// genomen die een voorouder is van HEAD.
// Exit code 1 bij een SHACL-fout of een niet-toegestane verwijdering.
//
// Met --history wordt elke release vergeleken met de vorige (0.0.1 -> 0.0.2 -> ... -> huidige
// bestanden). Per oudere stap worden de eerste 5 items van elke lijst getoond, met --verbose alles. Verwijderingen in oude releases worden enkel gerapporteerd; de exit code hangt, net
// als zonder --history, enkel af van de SHACL-validatie en de laatste stap (laatste tag -> nu).

import fs from 'node:fs';
import path from 'node:path';
import rdf from '@zazuko/env-node';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import { skosSource } from './utils/variables.js';
import { laatsteReleaseTag, vereisteReleaseTags } from './utils/git-utils.js';
import { parseNTriples, toNT as nt, tripleKey as sleutel, groupBy as groepeer } from './utils/rdf.js';
import { ntPad, artifactId, prefixes, kort, versie, leesHuidig, leesRevisie, leesReleases } from './utils/releases.js';
import { style, symbol, print, plural } from './utils/console.js';
import { isMainModule } from './utils/script.js';

const TOEGESTAAN_PAD = './source/toegestane-verwijderingen.txt';

function bepaalTag() {
    const i = process.argv.indexOf('--tag');
    if (i !== -1 && process.argv[i + 1]) return Promise.resolve(process.argv[i + 1]);
    if (process.env.VORIGE_RELEASE_TAG) return Promise.resolve(process.env.VORIGE_RELEASE_TAG);
    return laatsteReleaseTag(artifactId);
}

function expandeer(token, regelnr) {
    if (token.startsWith('<') && token.endsWith('>')) return token;
    const i = token.indexOf(':');
    if (i > 0 && prefixes[token.slice(0, i)]) return `<${prefixes[token.slice(0, i)]}${token.slice(i + 1)}>`;
    throw new Error(`${TOEGESTAAN_PAD}:${regelnr}: '${token}' is not an IRI or known CURIE.`);
}

export function leesRegel(tekst, regelnr) {
    const regel = { regelnr, tekst, gebruikt: 0 };
    if (tekst.endsWith('.')) {
        return parseNTriples(tekst + '\n')
            .catch(() => [])
            .then((triples) => {
                if (triples.length !== 1) throw new Error(`${TOEGESTAAN_PAD}:${regelnr}: not a valid N-Triples line.`);
                return { ...regel, triple: sleutel(triples[0]) };
            });
    }
    return Promise.resolve(tekst.split(/\s+/)).then((tokens) => {
        if (tokens.length > 2)
            throw new Error(
                `${TOEGESTAAN_PAD}:${regelnr}: expected a subject, ` +
                    `a subject and predicate, or a complete N-Triples line ending in ' .'.`,
            );
        return {
            ...regel,
            subject: expandeer(tokens[0], regelnr),
            ...(tokens[1] && { predicaat: expandeer(tokens[1], regelnr) }),
        };
    });
}

// Elke regel is een subject, een subject + predicaat (IRI of CURIE), of een volledige N-Triples-regel
function leesToegestaan() {
    return Promise.resolve()
        .then(() => (fs.existsSync(TOEGESTAAN_PAD) ? fs.readFileSync(TOEGESTAAN_PAD, 'utf8') : ''))
        .then((inhoud) =>
            inhoud
                .split('\n')
                .map((lijn, index) => ({ tekst: lijn.trim(), regelnr: index + 1 }))
                .filter(({ tekst }) => tekst && !tekst.startsWith('#')),
        )
        .then((lijnen) => Promise.all(lijnen.map(({ tekst, regelnr }) => leesRegel(tekst, regelnr))));
}

// Een toegestaan subject dekt ook de triples die ernaar verwijzen (bv. hasTopConcept, narrower)
function toegestaanDoor(q, regels) {
    const s = nt(q.subject),
        p = nt(q.predicate),
        o = nt(q.object),
        t = sleutel(q);
    return regels.find((r) => {
        if (r.triple) return r.triple === t;
        if (r.predicaat) return r.subject === s && r.predicaat === p;
        return r.subject === s || r.subject === o;
    });
}

// Splitst de verwijderde triples in toegestane en nog te beoordelen; telt per regel het gebruik
function splitsToegestaan(verwijderd, regels) {
    const toegestaan = [];
    const teBeoordelen = [];
    for (const q of verwijderd) {
        const regel = toegestaanDoor(q, regels);
        if (regel) {
            regel.gebruikt++;
            toegestaan.push(q);
        } else {
            teBeoordelen.push(q);
        }
    }
    return { toegestaan, teBeoordelen };
}

// Het verdwenen concept waartoe een triple behoort: het subject zelf, of het concept waarnaar ze verwijst
function verdwenenConcept(q, verdwenenSubjects) {
    if (verdwenenSubjects.has(nt(q.subject))) return q.subject;
    if (verdwenenSubjects.has(nt(q.object))) return q.object;
    return null;
}

// Deelt de niet-toegestane verwijderingen in: verwijderd concept, gewijzigde of verwijderde waarde
function deelIn(teBeoordelen, verdwenenSubjects, toegevoegdPerSP) {
    const verwijderdeConcepten = new Map();
    const verwijderdeWaarden = [];
    const gewijzigd = new Map();
    for (const q of teBeoordelen) {
        const sp = `${nt(q.subject)} ${nt(q.predicate)}`;
        const concept = verdwenenConcept(q, verdwenenSubjects);
        if (concept) {
            const c = nt(concept);
            if (!verwijderdeConcepten.has(c))
                verwijderdeConcepten.set(c, { subject: concept, triples: [], verwijzingen: 0 });
            verwijderdeConcepten.get(c).triples.push(q);
            if (concept === q.object) verwijderdeConcepten.get(c).verwijzingen++;
        } else if (toegevoegdPerSP.has(sp)) {
            if (!gewijzigd.has(sp))
                gewijzigd.set(sp, { q, oud: [], nieuw: toegevoegdPerSP.get(sp).map((n) => n.object) });
            gewijzigd.get(sp).oud.push(q.object);
        } else {
            verwijderdeWaarden.push(q);
        }
    }
    return { verwijderdeConcepten, verwijderdeWaarden, gewijzigd };
}

// Deelt de verwijderde triples in; zie de uitleg bovenaan
export function vergelijk({ tag, huidig, vorige, regels }) {
    const huidigeSleutels = new Set(huidig.map(sleutel));
    const vorigeSleutels = new Set(vorige.map(sleutel));
    const huidigeSubjects = new Set(huidig.map((q) => nt(q.subject)));
    const verwijderd = vorige.filter((q) => !huidigeSleutels.has(sleutel(q)));
    const toegevoegd = huidig.filter((q) => !vorigeSleutels.has(sleutel(q)));
    const toegevoegdPerSP = groepeer(toegevoegd, (q) => `${nt(q.subject)} ${nt(q.predicate)}`);

    const { toegestaan, teBeoordelen } = splitsToegestaan(verwijderd, regels);

    // Een verwijzing naar een verwijderd concept hoort bij de verwijdering van dat concept
    const verdwenenSubjects = new Set(vorige.map((q) => nt(q.subject)).filter((s) => !huidigeSubjects.has(s)));
    const { verwijderdeConcepten, verwijderdeWaarden, gewijzigd } = deelIn(
        teBeoordelen,
        verdwenenSubjects,
        toegevoegdPerSP,
    );

    return {
        tag,
        regels,
        toegestaan,
        verwijderdeConcepten,
        verwijderdeWaarden,
        gewijzigd,
        aantallen: {
            vorige: vorige.length,
            huidig: huidig.length,
            toegevoegd: toegevoegd.length,
            verwijderd: verwijderd.length,
        },
    };
}

// '1 concept' of '3 concepts'
const meervoud = (n, enkelvoud, meervoudsvorm) => plural(n, enkelvoud, meervoudsvorm);

// Zoals meervoud, met het getal in het vet
const aantal = (n, enkelvoud, meervoudsvorm) => plural(n, enkelvoud, meervoudsvorm, style.bold);

// Aantal fouten (niet-toegestane verwijderingen) in een resultaat van vergelijk()
function telFouten({ verwijderdeConcepten, verwijderdeWaarden }) {
    return verwijderdeConcepten.size + verwijderdeWaarden.length;
}

// '952 → 1322   +372  -2'
function triplesTekst({ vorige, huidig, toegevoegd, verwijderd }) {
    const plus = style.green(`+${toegevoegd}`);
    const min = style.red(`-${verwijderd}`);
    return `${vorige} ${style.gray(symbol.arrow)} ${huidig}   ${plus}  ${min}`;
}

// Schrijft de eerste `max` items van een lijst uit, met '… N more' voor de rest
function detailLijst(items, schrijf, max) {
    items.slice(0, max).forEach(schrijf);
    if (items.length > max) print.detail(style.gray(`… ${items.length - max} more`));
}

// Schrijft de bevindingen van één vergelijking uit; geeft het aantal fouten terug.
// `max` beperkt het aantal items per lijst (standaard alles).
function rapporteerBevindingen(
    { tag, regels, toegestaan, verwijderdeConcepten, verwijderdeWaarden, gewijzigd },
    max = Infinity,
) {
    if (verwijderdeConcepten.size) {
        print.error(`${aantal(verwijderdeConcepten.size, 'concept', 'concepts')} removed`);
        detailLijst(
            [...verwijderdeConcepten.values()],
            ({ subject, triples, verwijzingen }) => {
                const label = triples.find(
                    (t) =>
                        t.subject.equals(subject) &&
                        t.predicate.value === 'http://www.w3.org/2004/02/skos/core#prefLabel',
                );
                const labelTekst = label ? ' ' + style.italic(label.object.value) : '';
                const eigen = meervoud(triples.length - verwijzingen, 'triple', 'triples');
                const verwijzend = meervoud(verwijzingen, 'reference', 'references');
                print.detail(
                    `${style.red(symbol.bullet)} ${style.bold(kort(subject))}${labelTekst} ` +
                        style.gray(`(${eigen}, ${verwijzend} from other concepts)`),
                );
            },
            max,
        );
    }

    if (verwijderdeWaarden.length) {
        print.error(`${aantal(verwijderdeWaarden.length, 'value', 'values')} removed`);
        detailLijst(
            verwijderdeWaarden,
            (q) => {
                print.detail(
                    `${style.red(symbol.bullet)} ${style.bold(kort(q.subject))} ${style.gray(kort(q.predicate))} ${style.red(kort(q.object))}`,
                );
            },
            max,
        );
    }

    if (gewijzigd.size) {
        print.warning(`${aantal(gewijzigd.size, 'property', 'properties')} with a changed value`);
        detailLijst(
            [...gewijzigd.values()],
            ({ q, oud, nieuw }) => {
                print.detail(
                    `${style.yellow(symbol.bullet)} ${style.bold(kort(q.subject))} ${style.gray(kort(q.predicate))}`,
                );
                print.detail(
                    `${style.red(oud.map(kort).join(', '))} ${style.gray(symbol.arrow)} ${style.green(nieuw.map(kort).join(', '))}`,
                    2,
                );
            },
            max,
        );
    }

    if (toegestaan.length) {
        print.info(
            `${aantal(toegestaan.length, 'removed triple', 'removed triples')} allowed by ${style.cyan(TOEGESTAAN_PAD)}`,
        );
    }

    const ongebruikt = regels.filter((r) => !r.gebruikt);
    if (ongebruikt.length) {
        print.warning(
            `${aantal(ongebruikt.length, 'line', 'lines')} in ${TOEGESTAAN_PAD} without effect against ${tag} (can be removed after the release)`,
        );
        for (const r of ongebruikt) {
            const lijn = style.gray(`line ${r.regelnr}:`);
            print.detail(`${style.yellow(symbol.bullet)} ${lijn} ${r.tekst}`);
        }
    }

    return telFouten({ verwijderdeConcepten, verwijderdeWaarden });
}

// Schrijft het resultaat van de vergelijking met de vorige release uit; geeft het aantal fouten terug
function rapporteer(resultaat) {
    print.title('Comparison with the previous release');
    print.keyValue({ Triples: triplesTekst(resultaat.aantallen) });
    print.blank();

    const fouten = rapporteerBevindingen(resultaat);

    if (!fouten) {
        print.success('No concepts or values removed');
    } else {
        print.blank();
        print.detail(`${style.yellow('Is the removal intentional?')} Add it to ${style.cyan(TOEGESTAAN_PAD)}.`, 0);
        print.detail(style.gray('This is a breaking change for consumers: mention it in the PR.'), 0);
    }
    return fouten;
}

// In --history: aantal items per lijst bij oudere stappen; --verbose toont alles
const MAX_DETAILS = 5;
const VERBOSE = process.argv.includes('--verbose');

// SHACL-validatie van de huidige gegenereerde bestanden
function valideerHuidig() {
    print.title('SHACL validation');
    return leesHuidig().then((huidig) =>
        validate(skosSource.shapesDataset, rdf.dataset(huidig)).then((report) => {
            if (report.conforms) {
                print.success('The code list conforms to the AP constraints');
            } else {
                print.error('The code list does not conform to the AP constraints');
                print.detail(`See ${style.cyan('../validation/validation_result.json')}`);
            }
            return { huidig, shaclFouten: report.conforms ? 0 : 1 };
        }),
    );
}

// Standaard: de huidige bestanden t.o.v. de vorige release
function valideerTegenVorigeRelease() {
    return (
        Promise.resolve()
            .then(bepaalTag)
            .then((tag) => {
                print.title('Validation against the previous release');
                print.keyValue({ File: style.cyan(path.basename(ntPad)), Release: style.bold(tag) });
                return { tag };
            })
            // 1. SHACL-validatie van de huidige gegenereerde bestanden
            .then((ctx) => valideerHuidig().then((resultaat) => ({ ...ctx, ...resultaat })))
            // 2. Vergelijking met de vorige release
            .then((ctx) => leesRevisie(ctx.tag).then((vorige) => ({ ...ctx, vorige })))
            .then((ctx) => leesToegestaan().then((regels) => ({ ...ctx, regels })))
            .then((ctx) => ({ ...ctx, fouten: ctx.shaclFouten + rapporteer(vergelijk(ctx)) }))
            .then(({ tag, fouten }) => {
                print.blank();
                if (fouten) {
                    print.error(`Validation against ${tag} failed`);
                    process.exitCode = 1;
                } else {
                    print.success(style.green.bold(`Validation against ${tag} passed: no information was lost`));
                }
            })
    );
}

// 'error' bij verwijderingen, 'warning' bij enkel gewijzigde waarden, anders 'success'
function stapStatus(fouten, resultaat) {
    if (fouten) return 'error';
    if (resultaat.gewijzigd.size) return 'warning';
    return 'success';
}

// Schrijft één stap van de geschiedenis uit; geeft een samenvatting terug
function rapporteerStap(van, naar, resultaat) {
    const fouten = telFouten(resultaat);
    const stap = `${van.label} ${symbol.arrow} ${naar.label}`;
    const status = stapStatus(fouten, resultaat);
    if (status === 'success' && !resultaat.toegestaan.length && !resultaat.regels.some((r) => !r.gebruikt)) {
        print.success(`${style.bold(stap.padEnd(20))} ${triplesTekst(resultaat.aantallen)}`);
    } else {
        print.title(stap);
        print.keyValue({ Triples: triplesTekst(resultaat.aantallen) });
        // De laatste stap toont alles, zoals zonder --history; oudere stappen enkel de eerste items
        rapporteerBevindingen(resultaat, naar.tag === 'HEAD' || VERBOSE ? Infinity : MAX_DETAILS);
    }
    return { stap, status, fouten };
}

// Met --history: elke release t.o.v. de vorige, en de laatste release t.o.v. de huidige bestanden
function valideerGeschiedenis() {
    return Promise.resolve()
        .then(() => vereisteReleaseTags(artifactId))
        .then((tags) => {
            print.title('Validation of the release history');
            print.keyValue({
                File: style.cyan(path.basename(ntPad)),
                Releases: `${style.bold(tags.length)} tags: ${versie(tags[0])} ${style.gray(symbol.arrow)} ${versie(tags.at(-1))} ${style.gray(symbol.arrow)} current`,
            });
            return tags;
        })
        .then((tags) =>
            valideerHuidig().then(({ huidig, shaclFouten }) =>
                Promise.all([leesReleases(tags), leesToegestaan()]).then(([releases, regels]) => ({
                    huidig,
                    shaclFouten,
                    releases,
                    regels,
                })),
            ),
        )
        .then(({ huidig, shaclFouten, releases, regels }) => {
            const ontbrekend = releases.filter((r) => !r.triples);
            if (ontbrekend.length) {
                print.blank();
                print.warning(
                    `${aantal(ontbrekend.length, 'release', 'releases')} without ${path.basename(ntPad)}, skipped: ${ontbrekend.map((r) => r.label).join(', ')}`,
                );
            }

            // Enkel de laatste stap (laatste release -> huidige bestanden) gebruikt de toegestane verwijderingen
            const reeks = [...releases.filter((r) => r.triples), { tag: 'HEAD', label: 'current', triples: huidig }];
            print.title('Release history');
            const stappen = reeks.slice(1).map((naar, i) => {
                const van = reeks[i];
                const laatste = i === reeks.length - 2;
                return rapporteerStap(
                    van,
                    naar,
                    vergelijk({
                        tag: van.tag,
                        huidig: naar.triples,
                        vorige: van.triples,
                        regels: laatste ? regels : [],
                    }),
                );
            });

            print.title('Summary');
            const metStatus = (status) => stappen.filter((s) => s.status === status);
            const opsomming = (lijst) => style.gray(lijst.map((s) => s.stap).join(', '));
            print.success(`${aantal(metStatus('success').length, 'step', 'steps')} without removals or changes`);
            if (metStatus('warning').length) {
                print.warning(
                    `${aantal(metStatus('warning').length, 'step', 'steps')} with changed values only: ${opsomming(metStatus('warning'))}`,
                );
            }
            if (metStatus('error').length) {
                print.error(
                    `${aantal(metStatus('error').length, 'step', 'steps')} with removals: ${opsomming(metStatus('error'))}`,
                );
            }

            // De exit code hangt enkel af van SHACL en de laatste stap, zoals zonder --history
            const laatste = stappen.at(-1);
            const fouten = shaclFouten + laatste.fouten;
            print.blank();
            print.detail(
                style.gray('Removals in older releases are reported only; they do not affect the exit code.'),
                0,
            );
            if (fouten) {
                print.error(`Validation of ${laatste.stap} failed`);
                process.exitCode = 1;
            } else {
                print.success(style.green.bold(`Validation of ${laatste.stap} passed: no information was lost`));
            }
        });
}

// Enkel als script gestart; bij een import (bv. in de tests) gebeurt er niets
if (isMainModule(import.meta.url)) {
    Promise.resolve()
        .then(() => (process.argv.includes('--history') ? valideerGeschiedenis() : valideerTegenVorigeRelease()))
        .catch((err) => {
            print.error(err.message);
            process.exitCode = 1;
        });
}
