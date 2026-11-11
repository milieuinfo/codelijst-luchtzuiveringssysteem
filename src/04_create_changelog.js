'use strict';
// Maakt CHANGELOG.md (in de root van de repository) met de inhoudelijke wijzigingen aan de codelijst
// per release, door de N-Triples van opeenvolgende releases te vergelijken.
//
// Gebruik (vanuit src/):
//   node 04_create_changelog.js            sectie voor de huidige bestanden toevoegen of vervangen
//   node 04_create_changelog.js --full     de volledige changelog opnieuw opbouwen uit alle release-tags
//   --version <x.y.z>   versie van de nieuwe sectie; standaard de omgevingsvariabele VERSION
//                       (zoals Jenkins die zet bij een release)
//   --stdout            de changelog naar stdout schrijven i.p.v. naar CHANGELOG.md
//
// Zonder --full worden de huidige gegenereerde bestanden vergeleken met de laatste release-tag in de
// geschiedenis van HEAD. Een bestaande sectie voor dezelfde versie wordt vervangen, de rest van het
// bestand blijft ongemoeid. Met --full worden de release-tags gebruikt, met de huidige bestanden bovenaan.
//
// Zonder versie (geen release) komen de huidige bestanden in de sectie 'Volgende versie', zonder
// datum: zo kan je de wijzigingen nalezen vóór ze gepubliceerd worden. Met een versie (bij een release)
// komen ze in een sectie voor die versie en verdwijnt de sectie 'Volgende versie'.
//
// Per release een samenvatting en per conceptschema één tabel, met per rij een emoji:
//   🆕 nieuw concept (het subject is nieuw)                🗑️ verwijderd concept (het subject komt nergens meer voor)
//   ✏️ / ➕ / ➖ een waarde van een bestaand concept is gewijzigd / toegevoegd / verwijderd (één rij per property)
// Afgeleide triples (zie AFGELEID) worden weggelaten
// zolang de triple waaruit ze volgen er ook staat: ze zouden enkel herhalen wat al vermeld is.

import fs from 'node:fs';
import { vereisteReleaseTags, datumVanRevisie } from './utils/git-utils.js';
import { toNT as nt, tripleKey as sleutel, groupBy as groepeer } from './utils/rdf.js';
import { artifactId, kort, versie, leesHuidig, leesReleases } from './utils/releases.js';
import { style, symbol, print, plural } from './utils/console.js';
import { escapeMarkdown, table } from './utils/markdown.js';

const CHANGELOG_PAD = '../CHANGELOG.md';
const MAX_LENGTE = 120;
const NAAR_STDOUT = process.argv.includes('--stdout');
const VOLGENDE = 'Volgende versie';

// Met --stdout gaat de changelog naar stdout; de meldingen van het script dan naar stderr
if (NAAR_STDOUT) console.log = console.error;

// Sorteert '_2' vóór '_10'
const vergelijkTekst = (a, b) => a.localeCompare(b, 'nl', { numeric: true });

const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const VOCAB = 'https://data.lzs.omgeving.vlaanderen.be/ns/vocab#';

const HEADER = `# Changelog

Inhoudelijke wijzigingen aan de codelijst luchtzuiveringssysteem, per release en per conceptschema.

🆕 nieuw · ✏️ waarde gewijzigd · ➕ waarde toegevoegd · ➖ waarde verwijderd · 🗑️ verwijderd

Afgeleide relaties (zoals \`skos:narrower\`, \`skos:hasTopConcept\` en \`skos:note\`) zijn weggelaten:
ze volgen uit de wijzigingen die wel vermeld zijn.

Dit bestand wordt gegenereerd met \`pnpm run create_changelog\` (zie \`docs/scripts.md\`).
Pas het niet met de hand aan: \`pnpm run create_changelog_full\` bouwt het volledig opnieuw op.
`;

// Afgeleide predicaten (uit de N3-regels) en de triples waaruit ze volgen.
// `invers`: de bron heeft subject en object omgewisseld. Zonder bronnen: altijd afgeleid.
const AFGELEID = {
    [`${SKOS}broaderTransitive`]: [],
    [`${SKOS}narrowerTransitive`]: [],
    [`${SKOS}semanticRelation`]: [],
    [`${SKOS}mappingRelation`]: [],
    [`${SKOS}hasTopConcept`]: [{ predicaat: `${SKOS}topConceptOf`, invers: true }],
    [`${SKOS}narrower`]: [{ predicaat: `${SKOS}broader`, invers: true }],
    [`${SKOS}inScheme`]: [{ predicaat: `${SKOS}topConceptOf` }],
    [`${SKOS}note`]: ['definition', 'scopeNote', 'changeNote', 'editorialNote', 'example', 'historyNote']
        .map(p => ({ predicaat: `${SKOS}${p}` })),
    [`${VOCAB}relevantProperty`]: [{ predicaat: `${VOCAB}relevantLZS`, invers: true }]
};

function argument(naam) {
    const i = process.argv.indexOf(naam);
    return i !== -1 ? process.argv[i + 1] : undefined;
}

// Of een triple afgeleid is van een andere triple uit dezelfde graaf
function isAfgeleid(q, sleutels) {
    const bronnen = AFGELEID[q.predicate.value];
    if (!bronnen) return false;
    if (!bronnen.length) return true;
    return bronnen.some(({ predicaat, invers }) => {
        const [s, o] = invers ? [q.object, q.subject] : [q.subject, q.object];
        return sleutels.has(`${nt(s)} <${predicaat}> ${nt(o)} .`);
    });
}

// Hulpfuncties om een graaf te bevragen
function graaf(triples) {
    const perSubject = groepeer(triples, q => nt(q.subject));
    const waarden = (subject, predicaat) => (perSubject.get(nt(subject)) ?? [])
        .filter(q => q.predicate.value === predicaat)
        .map(q => q.object);
    return {
        triples,
        sleutels: new Set(triples.map(sleutel)),
        subjects: new Set(perSubject.keys()),
        perSubject,
        waarden,
        // prefLabel, bij voorkeur in het Nederlands
        label: (subject) => {
            const labels = waarden(subject, `${SKOS}prefLabel`);
            return (labels.find(l => l.language === 'nl') ?? labels[0])?.value;
        },
        isSchema: (subject) => waarden(subject, RDF_TYPE).some(t => t.value === `${SKOS}ConceptScheme`),
        isConcept: (subject) => waarden(subject, RDF_TYPE).some(t => t.value === `${SKOS}Concept`),
        schema: (subject) => [...waarden(subject, `${SKOS}inScheme`), ...waarden(subject, `${SKOS}topConceptOf`)][0]
    };
}

// Vergelijkt twee versies van de codelijst; zie de uitleg bovenaan
function vergelijk(vorige, huidige) {
    const oud = graaf(vorige);
    const nieuw = graaf(huidige);
    const toegevoegdeSubjects = [...nieuw.subjects].filter(s => !oud.subjects.has(s));
    const verwijderdeSubjects = [...oud.subjects].filter(s => !nieuw.subjects.has(s));
    const nieuwOfWeg = new Set([...toegevoegdeSubjects, ...verwijderdeSubjects]);

    // Waarden die bij een bestaand subject wegvielen of bijkwamen, per subject en predicaat
    const wijzigingen = new Map();
    const noteer = (q, soort) => {
        const s = nt(q.subject);
        if (!wijzigingen.has(s)) wijzigingen.set(s, { subject: q.subject, predicaten: new Map() });
        const predicaten = wijzigingen.get(s).predicaten;
        const p = q.predicate.value;
        if (!predicaten.has(p)) predicaten.set(p, { predicaat: q.predicate, oud: [], nieuw: [] });
        predicaten.get(p)[soort].push(q.object);
    };
    for (const q of vorige) {
        if (!nieuw.sleutels.has(sleutel(q)) && !nieuwOfWeg.has(nt(q.subject)) && !isAfgeleid(q, oud.sleutels)) noteer(q, 'oud');
    }
    for (const q of huidige) {
        if (!oud.sleutels.has(sleutel(q)) && !nieuwOfWeg.has(nt(q.subject)) && !isAfgeleid(q, nieuw.sleutels)) noteer(q, 'nieuw');
    }

    const subject = (g, s) => g.perSubject.get(s)[0].subject;
    return {
        oud, nieuw,
        toegevoegd: toegevoegdeSubjects.map(s => ({ subject: subject(nieuw, s), graaf: nieuw })),
        verwijderd: verwijderdeSubjects.map(s => ({ subject: subject(oud, s), graaf: oud })),
        gewijzigd: [...wijzigingen.values()].map(w => ({ ...w, graaf: nieuw }))
    };
}

// Tekst op één regel, ingekort, met de tekens die Markdown anders interpreteert ge-escaped
function markdownTekst(tekst) {
    let regel = tekst.replace(/\s+/g, ' ').trim();
    if (regel.length > MAX_LENGTE) regel = `${regel.slice(0, MAX_LENGTE - 1)}…`;
    return escapeMarkdown(regel);
}

// Markdown voor een waarde: literals tussen aanhalingstekens, IRI's als code
function waarde(term) {
    if (term.termType !== 'Literal') return `\`${kort(term)}\``;
    const tekst = markdownTekst(term.value);
    const taal = term.language && term.language !== 'nl' ? ` (${term.language})` : '';
    const type = !term.language && !term.datatype.value.endsWith('#string') ? ` (\`${kort(term.datatype)}\`)` : '';
    return `"${tekst}"${taal}${type}`;
}

const waarden = (termen) => termen.map(waarde).join(', ');

// Soorten wijzigingen; de legende staat ook in HEADER
const SOORT = {
    nieuw: { emoji: '🆕', tekst: 'nieuw' },
    gewijzigd: { emoji: '✏️', tekst: 'waarde gewijzigd' },
    toegevoegd: { emoji: '➕', tekst: 'waarde toegevoegd' },
    verwijderd: { emoji: '➖', tekst: 'waarde verwijderd' },
    weg: { emoji: '🗑️', tekst: 'verwijderd' }
};

// Het conceptschema waaronder een subject valt: een conceptschema valt onder zichzelf
function schemaVan(subject, g) {
    return g.isSchema(subject) ? subject : g.schema(subject) ?? null;
}

// Soort en tekst van de wijziging van één property van een bestaand concept
function propertyWijziging(predicaat, oud, nieuw) {
    const p = `\`${kort(predicaat)}\``;
    if (oud.length && nieuw.length) return ['gewijzigd', `${p}: ${waarden(oud)} → ${waarden(nieuw)}`];
    if (nieuw.length) return ['toegevoegd', `${p}: ${waarden(nieuw)}`];
    return ['verwijderd', `${p}: ${waarden(oud)}`];
}

// Tabelrijen voor één release, met per rij het conceptschema (voor de groepering) en de sortering
function rijen({ toegevoegd, gewijzigd, verwijderd }) {
    const rij = (soort, subject, g, wijziging, toonConcept = true) => ({
        soort, subject, graaf: g, schema: schemaVan(subject, g),
        cellen: [
            SOORT[soort].emoji,
            toonConcept ? `\`${kort(subject)}\`` : '',
            toonConcept && g.label(subject) ? markdownTekst(g.label(subject)) : '',
            wijziging
        ]
    });
    const soortConcept = (subject, g) => g.isSchema(subject) ? 'conceptschema' : 'concept';

    return [
        ...toegevoegd.map(({ subject, graaf: g }) => [rij('nieuw', subject, g, `nieuw ${soortConcept(subject, g)}`)]),
        ...gewijzigd.map(({ subject, predicaten, graaf: g }) => [...predicaten.values()]
            .sort((a, b) => vergelijkTekst(kort(a.predicaat), kort(b.predicaat)))
            .map(({ predicaat, oud, nieuw }, i) => {
                const [soort, wijziging] = propertyWijziging(predicaat, oud, nieuw);
                // Het concept enkel in de eerste rij, zodat de rijen van één concept samen leesbaar zijn
                return rij(soort, subject, g, wijziging, i === 0);
            })),
        ...verwijderd.map(({ subject, graaf: g }) => [rij('weg', subject, g, `${soortConcept(subject, g)} verwijderd`)])
    ];
}

// Per conceptschema een titel en een tabel. Binnen een schema: eerst het schema zelf, dan nieuw,
// gewijzigd, verwijderd; per soort op IRI. De rijen van één gewijzigd concept blijven bij elkaar.
function tabellenPerSchema(rijGroepen) {
    // 0 het schema zelf, 1 nieuw, 2 gewijzigd (gewijzigd, toegevoegd en verwijderd samen), 3 verwijderd
    const rang = (r) => r.schema?.equals(r.subject) ? 0 : { nieuw: 1, weg: 3 }[r.soort] ?? 2;
    const groepen = groepeer(rijGroepen, ([eerste]) => eerste.schema ? nt(eerste.schema) : '');
    return [...groepen.values()]
        .map(groep => {
            const { schema, graaf: g } = groep[0][0];
            const titel = schema
                ? `${markdownTekst(g.label(schema) ?? kort(schema))} (\`${kort(schema)}\`)`
                : 'Zonder conceptschema';
            const gesorteerd = groep.toSorted(([a], [b]) => rang(a) - rang(b) || vergelijkTekst(kort(a.subject), kort(b.subject)));
            return { schema, titel, tabel: table(['', 'Concept', 'Label', 'Wijziging'], gesorteerd.flat().map(r => r.cellen)) };
        })
        // Zonder conceptschema achteraan
        .sort((a, b) => Number(!a.schema) - Number(!b.schema) || vergelijkTekst(a.titel, b.titel))
        .flatMap(({ titel, tabel }) => [`### ${titel}`, '', tabel, '']);
}

// '🆕 5 nieuw · ✏️ 2 gewijzigd · 🗑️ 1 verwijderd' (aantallen concepten)
function samenvatting({ toegevoegd, gewijzigd, verwijderd }) {
    return [
        [toegevoegd, SOORT.nieuw.emoji, 'nieuw'],
        [gewijzigd, SOORT.gewijzigd.emoji, 'gewijzigd'],
        [verwijderd, SOORT.weg.emoji, 'verwijderd']
    ]
        .filter(([n]) => n)
        .map(([n, emoji, tekst]) => `${emoji} ${n} ${tekst}`)
        .join(' · ');
}

// Markdown-sectie voor één release; `vorige` is null voor de eerste release.
// Zonder datum is het de volgende versie: de wijzigingen t.o.v. release `vorigeLabel`.
function sectie({ label, datum, vorige, vorigeLabel, huidige }) {
    const regels = datum
        ? [`## [${label}] - ${datum}`, '']
        : [`## [${label}]`, '', `Nog niet gepubliceerd: wijzigingen t.o.v. release ${vorigeLabel}.`, ''];

    if (!huidige) {
        regels.push('Deze release bevat geen gegenereerde codelijst.', '');
        return { tekst: regels.join('\n'), aantallen: null };
    }

    if (!vorige) {
        const g = graaf(huidige);
        const subjects = [...g.perSubject.values()].map(lijst => lijst[0].subject);
        const schemas = subjects.filter(g.isSchema).sort((a, b) => vergelijkTekst(kort(a), kort(b)));
        const concepten = subjects.filter(g.isConcept);
        regels.push(
            `Eerste release, met ${plural(concepten.length, 'concept', 'concepten')} `
                + `in ${plural(schemas.length, 'conceptschema', 'conceptschema\'s')}:`,
            '',
            table(['', 'Conceptschema', 'Label'],
                schemas.map(s => [SOORT.nieuw.emoji, `\`${kort(s)}\``, markdownTekst(g.label(s) ?? '')])),
            ''
        );
        return { tekst: regels.join('\n'), aantallen: { toegevoegd: concepten.length, gewijzigd: 0, verwijderd: 0 } };
    }

    const verschil = vergelijk(vorige, huidige);
    const aantallen = {
        toegevoegd: verschil.toegevoegd.length, gewijzigd: verschil.gewijzigd.length, verwijderd: verschil.verwijderd.length
    };
    if (!aantallen.toegevoegd && !aantallen.gewijzigd && !aantallen.verwijderd) {
        regels.push('Geen inhoudelijke wijzigingen aan de codelijst.', '');
    } else {
        regels.push(samenvatting(aantallen), '', ...tabellenPerSchema(rijen(verschil)));
    }
    return { tekst: regels.join('\n'), aantallen };
}

// '+3 ~1 -0'
function aantallenTekst(aantallen) {
    if (!aantallen) return style.gray('no code list');
    const { toegevoegd, gewijzigd, verwijderd } = aantallen;
    const plus = style.green(`+${toegevoegd}`);
    const tilde = style.yellow(`~${gewijzigd}`);
    const min = style.red(`-${verwijderd}`);
    return `${plus}  ${tilde}  ${min}`;
}

function schrijf(inhoud) {
    if (NAAR_STDOUT) {
        process.stdout.write(inhoud);
        return;
    }
    fs.writeFileSync(CHANGELOG_PAD, inhoud);
    print.blank();
    print.success(`Written to ${style.cyan('CHANGELOG.md')}`);
}

// Tekst met precies één regeleinde op het einde (zonder regex: /\n*$/ is traag door backtracking)
function metEenRegeleinde(tekst) {
    let einde = tekst.length;
    while (einde > 0 && tekst[einde - 1] === '\n') einde--;
    return `${tekst.slice(0, einde)}\n`;
}

// Secties uit een bestaande changelog: de tekst vóór de eerste sectie, en de secties zelf
function splitsChangelog(inhoud) {
    const delen = inhoud.split(/^(?=## \[)/m);
    const kop = delen[0].startsWith('## [') ? '' : delen.shift();
    return {
        kop,
        secties: delen.map(tekst => ({ label: tekst.match(/^## \[([^\]]+)\]/)[1], tekst: metEenRegeleinde(tekst) }))
    };
}

const vandaag = () => new Date().toISOString().slice(0, 10);

// Versie uit --version of VERSION (zoals Jenkins die zet bij een release); undefined als er niet gereleased wordt
const releaseVersie = () => argument('--version') ?? process.env.VERSION;

// Met --full: elke release t.o.v. de vorige, met bovenaan de huidige bestanden. Is er een versie
// meegegeven die nog geen tag heeft, dan als sectie voor die versie: zo bevat de changelog in de
// release-tag ook die release zelf. Zonder versie als 'Volgende versie'.
function maakVolledigeChangelog() {
    const nieuweVersie = releaseVersie();
    return Promise.resolve()
        .then(() => vereisteReleaseTags(artifactId))
        .then(tags => Promise.all([leesReleases(tags), Promise.all(tags.map(datumVanRevisie))]))
        .then(([releases, datums]) => releases.map((r, i) => ({ ...r, datum: datums[i] })))
        .then(releases => {
            const metHuidige = !releases.some(r => r.label === nieuweVersie);
            return Promise.all([releases, metHuidige, metHuidige ? leesHuidig() : null]);
        })
        .then(([releases, metHuidige, huidige]) => {
            print.title('Changelog of the release history');
            print.keyValue({ Releases: `${style.bold(releases.length)} tags: ${releases[0].label} ${style.gray(symbol.arrow)} ${releases.at(-1).label}` });
            if (metHuidige) {
                print.keyValue({ 'New version': `${style.bold(nieuweVersie ?? VOLGENDE)} ${style.gray('(current files)')}` });
            } else {
                print.info(`Version ${nieuweVersie} is already released; the current files are not added`);
            }
            print.blank();

            // Een release zonder codelijst wordt overgeslagen bij de vergelijking van de volgende
            let vorige = null;
            let vorigeLabel = null;
            const versies = metHuidige
                ? [...releases, { label: nieuweVersie ?? VOLGENDE, datum: nieuweVersie ? vandaag() : null, triples: huidige }]
                : releases;
            const secties = versies.map(({ label, datum, triples }) => {
                const resultaat = sectie({ label, datum, vorige, vorigeLabel, huidige: triples });
                print.detail(`${style.bold(label.padEnd(8))} ${style.gray(datum ?? '')}  ${aantallenTekst(resultaat.aantallen)}`, 0);
                if (triples) {
                    vorige = triples;
                    vorigeLabel = label;
                }
                return resultaat.tekst;
            });
            schrijf([HEADER, ...secties.toReversed()].join('\n'));
        });
}

// Zonder --full: de huidige bestanden t.o.v. de laatste release, als sectie voor de meegegeven versie,
// of zonder versie als 'Volgende versie'
function voegHuidigeVersieToe() {
    const nieuweVersie = releaseVersie();
    const label = nieuweVersie ?? VOLGENDE;
    return Promise.resolve()
        .then(() => vereisteReleaseTags(artifactId))
        .then(tags => {
            const tag = tags.at(-1);
            if (versie(tag) === label) {
                throw new Error(`Version ${label} is already released (tag ${tag}). `
                    + `Use --version for a new version, or --full to rebuild the changelog from the tags.`);
            }
            print.title('Changelog of the current version');
            print.keyValue({ Version: style.bold(label), 'Compared to': style.bold(tag) });
            return Promise.all([leesReleases([tag]), leesHuidig()]);
        })
        .then(([[release], huidige]) => sectie({
            label, datum: nieuweVersie ? vandaag() : null, vorige: release.triples, vorigeLabel: release.label, huidige
        }))
        .then(({ tekst, aantallen }) => {
            print.blank();
            print.detail(`${style.bold(label.padEnd(8))} ${aantallenTekst(aantallen)}  ${style.gray('(added, changed, removed concepts)')}`, 0);

            const bestaand = fs.existsSync(CHANGELOG_PAD) ? splitsChangelog(fs.readFileSync(CHANGELOG_PAD, 'utf8')) : null;
            if (!bestaand) {
                print.warning(`${CHANGELOG_PAD} does not exist yet; run 'pnpm run create_changelog_full' to include older releases`);
                schrijf([HEADER, tekst].join('\n'));
                return;
            }
            // Bij een release vervangt de sectie voor de versie de sectie 'Volgende versie'
            let secties = bestaand.secties;
            if (nieuweVersie && secties.some(s => s.label === VOLGENDE)) {
                print.info(`Removing the section '${VOLGENDE}'`);
                secties = secties.filter(s => s.label !== VOLGENDE);
            }
            const i = secties.findIndex(s => s.label === label);
            if (i !== -1) {
                print.info(`Replacing the existing section for ${label}`);
                secties[i] = { label, tekst };
            } else {
                secties.unshift({ label, tekst });
            }
            schrijf([metEenRegeleinde(bestaand.kop), ...secties.map(s => s.tekst)].join('\n'));
        });
}

Promise.resolve()
    .then(() => process.argv.includes('--full') ? maakVolledigeChangelog() : voegHuidigeVersieToe())
    .catch(err => {
        print.error(err.message);
        process.exitCode = 1;
    });
