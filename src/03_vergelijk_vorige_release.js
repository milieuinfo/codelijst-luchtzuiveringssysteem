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
// Gebruik (vanuit src/):  node 03_vergelijk_vorige_release.js [--tag <git-tag>]
// Zonder --tag (of omgevingsvariabele VORIGE_RELEASE_TAG) wordt de hoogste release-tag
// genomen die een voorouder is van HEAD.
// Exit code 1 bij een SHACL-fout of een niet-toegestane verwijdering.

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { Readable } from 'node:stream';
import rdf from '@zazuko/env-node';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import { skosOptions, skosSource, metadataOptions } from './utils/variables.js';

const TOEGESTAAN_PAD = './source/toegestane-verwijderingen.txt';
const prefixes = skosSource.prefixes;

function git(...args) {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
}

function bepaalTag() {
    const i = process.argv.indexOf('--tag');
    if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
    if (process.env.VORIGE_RELEASE_TAG) return process.env.VORIGE_RELEASE_TAG;

    const tags = git('tag', '--list', `${metadataOptions.artifactId}-*`, '--sort=-v:refname')
        .split('\n').filter(Boolean);
    for (const tag of tags) {
        try {
            git('merge-base', '--is-ancestor', tag, 'HEAD');
            return tag;
        } catch {
            // tag ligt niet in de geschiedenis van HEAD, volgende proberen
        }
    }
    throw new Error(`Geen release-tag '${metadataOptions.artifactId}-*' gevonden in de geschiedenis van HEAD. `
        + `Ontbreken de tags lokaal? Probeer 'git fetch --tags'.`);
}

async function parseNTriples(tekst) {
    const stream = rdf.formats.parsers.import('application/n-triples', Readable.from([tekst]));
    return [...await rdf.dataset().import(stream)];
}

// N-Triples-notatie van een term: dient als sleutel en om toegestane triples te vergelijken
function nt(term) {
    if (term.termType === 'NamedNode') return `<${term.value}>`;
    if (term.termType === 'BlankNode') return `_:${term.value}`;
    const waarde = JSON.stringify(term.value);
    if (term.language) return `${waarde}@${term.language}`;
    if (term.datatype.value === 'http://www.w3.org/2001/XMLSchema#string') return waarde;
    return `${waarde}^^<${term.datatype.value}>`;
}

// Leesbare notatie met prefixen, voor de uitvoer
function kort(term) {
    const iri = (value) => {
        let beste = null;
        for (const [prefix, ns] of Object.entries(prefixes)) {
            if (value.startsWith(ns) && (!beste || ns.length > beste[1].length)) beste = [prefix, ns];
        }
        return beste ? `${beste[0]}:${value.slice(beste[1].length)}` : `<${value}>`;
    };
    if (term.termType === 'NamedNode') return iri(term.value);
    if (term.termType !== 'Literal') return nt(term);
    const waarde = JSON.stringify(term.value);
    if (term.language) return `${waarde}@${term.language}`;
    if (term.datatype.value === 'http://www.w3.org/2001/XMLSchema#string') return waarde;
    return `${waarde}^^${iri(term.datatype.value)}`;
}

function expandeer(token, regelnr) {
    if (token.startsWith('<') && token.endsWith('>')) return token;
    const i = token.indexOf(':');
    if (i > 0 && prefixes[token.slice(0, i)]) return `<${prefixes[token.slice(0, i)]}${token.slice(i + 1)}>`;
    throw new Error(`${TOEGESTAAN_PAD}:${regelnr}: '${token}' is geen IRI of gekende CURIE.`);
}

// Elke regel is een subject, een subject + predicaat (IRI of CURIE), of een volledige N-Triples-regel
async function leesToegestaan() {
    if (!fs.existsSync(TOEGESTAAN_PAD)) return [];
    const regels = [];
    const lijnen = fs.readFileSync(TOEGESTAAN_PAD, 'utf8').split('\n');
    for (const [index, lijn] of lijnen.entries()) {
        const tekst = lijn.trim();
        if (!tekst || tekst.startsWith('#')) continue;
        const regel = { regelnr: index + 1, tekst, gebruikt: 0 };
        if (tekst.endsWith('.')) {
            const triples = await parseNTriples(tekst + '\n').catch(() => []);
            if (triples.length !== 1) throw new Error(`${TOEGESTAAN_PAD}:${regel.regelnr}: geen geldige N-Triples-regel.`);
            regel.triple = sleutel(triples[0]);
        } else {
            const tokens = tekst.split(/\s+/);
            if (tokens.length > 2) throw new Error(`${TOEGESTAAN_PAD}:${regel.regelnr}: verwacht een subject, `
                + `een subject en predicaat, of een volledige N-Triples-regel die eindigt op ' .'.`);
            regel.subject = expandeer(tokens[0], regel.regelnr);
            if (tokens[1]) regel.predicaat = expandeer(tokens[1], regel.regelnr);
        }
        regels.push(regel);
    }
    return regels;
}

function sleutel(q) {
    return `${nt(q.subject)} ${nt(q.predicate)} ${nt(q.object)} .`;
}

// Een toegestaan subject dekt ook de triples die ernaar verwijzen (bv. hasTopConcept, narrower)
function toegestaanDoor(q, regels) {
    const s = nt(q.subject), p = nt(q.predicate), o = nt(q.object), t = sleutel(q);
    return regels.find(r => {
        if (r.triple) return r.triple === t;
        if (r.predicaat) return r.subject === s && r.predicaat === p;
        return r.subject === s || r.subject === o;
    });
}

function groepeer(lijst, sleutelFn) {
    const map = new Map();
    for (const item of lijst) {
        const k = sleutelFn(item);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(item);
    }
    return map;
}

const tag = bepaalTag();
const ntPad = skosOptions.ntriplesPath;
console.log(`Vergelijking van ${ntPad} met release ${tag}`);

// 1. SHACL-validatie van de huidige gegenereerde bestanden
const huidig = await parseNTriples(fs.readFileSync(ntPad, 'utf8'));
const report = await validate(skosSource.shapesDataset, rdf.dataset(huidig));
let fouten = report.conforms ? 0 : 1;
if (!report.conforms) console.error('FOUT: SHACL-validatie faalt, zie ../validation/validation_result.json');

// 2. Vergelijking met de vorige release ('<tag>:./pad' is relatief t.o.v. de huidige map)
let vorigeTekst;
try {
    vorigeTekst = git('show', `${tag}:${ntPad.startsWith('./') ? ntPad : './' + ntPad}`) + '\n';
} catch {
    throw new Error(`${ntPad} bestaat niet in ${tag}.`);
}
const vorige = await parseNTriples(vorigeTekst);

const huidigeSleutels = new Set(huidig.map(sleutel));
const vorigeSleutels = new Set(vorige.map(sleutel));
const huidigeSubjects = new Set(huidig.map(q => nt(q.subject)));
const verwijderd = vorige.filter(q => !huidigeSleutels.has(sleutel(q)));
const toegevoegd = huidig.filter(q => !vorigeSleutels.has(sleutel(q)));
const toegevoegdPerSP = groepeer(toegevoegd, q => `${nt(q.subject)} ${nt(q.predicate)}`);

console.log(`Triples: ${vorige.length} in ${tag}, ${huidig.length} nu (+${toegevoegd.length}, -${verwijderd.length})`);

const regels = await leesToegestaan();
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

// Een verwijzing naar een verwijderd concept hoort bij de verwijdering van dat concept
const verdwenenSubjects = new Set(vorige.map(q => nt(q.subject)).filter(s => !huidigeSubjects.has(s)));
const verwijderdeConcepten = new Map();
const verwijderdeWaarden = [];
const gewijzigd = new Map();
for (const q of teBeoordelen) {
    const s = nt(q.subject), sp = `${s} ${nt(q.predicate)}`;
    const concept = verdwenenSubjects.has(s) ? q.subject
        : verdwenenSubjects.has(nt(q.object)) ? q.object : null;
    if (concept) {
        const c = nt(concept);
        if (!verwijderdeConcepten.has(c)) verwijderdeConcepten.set(c, { subject: concept, triples: [], verwijzingen: 0 });
        verwijderdeConcepten.get(c).triples.push(q);
        if (concept === q.object) verwijderdeConcepten.get(c).verwijzingen++;
    } else if (toegevoegdPerSP.has(sp)) {
        if (!gewijzigd.has(sp)) gewijzigd.set(sp, { q, oud: [], nieuw: toegevoegdPerSP.get(sp).map(n => n.object) });
        gewijzigd.get(sp).oud.push(q.object);
    } else {
        verwijderdeWaarden.push(q);
    }
}

if (verwijderdeConcepten.size) {
    fouten += verwijderdeConcepten.size;
    console.error(`\nFOUT: ${verwijderdeConcepten.size} concept(en) verwijderd:`);
    for (const { subject, triples, verwijzingen } of verwijderdeConcepten.values()) {
        const label = triples.find(t => t.subject.equals(subject)
            && t.predicate.value === 'http://www.w3.org/2004/02/skos/core#prefLabel');
        console.error(`  ${kort(subject)}${label ? ` (${label.object.value})` : ''}: `
            + `${triples.length - verwijzingen} triple(s), ${verwijzingen} verwijzing(en) vanuit andere concepten`);
    }
}

if (verwijderdeWaarden.length) {
    fouten += verwijderdeWaarden.length;
    console.error(`\nFOUT: ${verwijderdeWaarden.length} waarde(n) verwijderd:`);
    for (const q of verwijderdeWaarden) console.error(`  ${kort(q.subject)} ${kort(q.predicate)} ${kort(q.object)}`);
}

if (gewijzigd.size) {
    console.warn(`\nWAARSCHUWING: ${gewijzigd.size} eigenschap(pen) met een gewijzigde waarde:`);
    for (const { q, oud, nieuw } of gewijzigd.values()) {
        console.warn(`  ${kort(q.subject)} ${kort(q.predicate)}: ${oud.map(kort).join(', ')} -> ${nieuw.map(kort).join(', ')}`);
    }
}

if (toegestaan.length) {
    console.log(`\n${toegestaan.length} verwijderde triple(s) toegestaan via ${TOEGESTAAN_PAD}.`);
}

const ongebruikt = regels.filter(r => !r.gebruikt);
if (ongebruikt.length) {
    console.warn(`\nWAARSCHUWING: regels in ${TOEGESTAAN_PAD} zonder effect t.o.v. ${tag} (mogen weg na de release):`);
    for (const r of ongebruikt) console.warn(`  regel ${r.regelnr}: ${r.tekst}`);
}

if (fouten) {
    console.error(`\nVergelijking met ${tag} mislukt.`);
    if (verwijderdeConcepten.size || verwijderdeWaarden.length) {
        console.error(`Is de verwijdering bewust? Voeg ze toe aan ${TOEGESTAAN_PAD}; dit is een breaking change voor afnemers.`);
    }
    process.exitCode = 1;
} else {
    console.log(`\nVergelijking met ${tag} geslaagd: er ging geen informatie verloren.`);
}
