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
// Gebruik (vanuit src/):  node 03_validate_against_previous_release.js [--tag <git-tag>]
// Zonder --tag (of omgevingsvariabele VORIGE_RELEASE_TAG) wordt de hoogste release-tag
// genomen die een voorouder is van HEAD.
// Exit code 1 bij een SHACL-fout of een niet-toegestane verwijdering.

import fs from 'node:fs';
import { Readable } from 'node:stream';
import rdf from '@zazuko/env-node';
import validate from '@milieuinfo/maven-metadata-generator-npm/src/utils/shacl_validation.js';
import { skosOptions, skosSource, metadataOptions } from './utils/variables.js';
import { laatsteReleaseTag, bestandInRevisie } from './utils/git-utils.js';

const TOEGESTAAN_PAD = './source/toegestane-verwijderingen.txt';
const prefixes = skosSource.prefixes;

function bepaalTag() {
    const i = process.argv.indexOf('--tag');
    if (i !== -1 && process.argv[i + 1]) return Promise.resolve(process.argv[i + 1]);
    if (process.env.VORIGE_RELEASE_TAG) return Promise.resolve(process.env.VORIGE_RELEASE_TAG);
    return laatsteReleaseTag(metadataOptions.artifactId);
}

function parseNTriples(tekst) {
    return Promise.resolve()
        .then(() => rdf.formats.parsers.import('application/n-triples', Readable.from([tekst])))
        .then(stream => rdf.dataset().import(stream))
        .then(dataset => [...dataset]);
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

function leesRegel(tekst, regelnr) {
    const regel = { regelnr, tekst, gebruikt: 0 };
    if (tekst.endsWith('.')) {
        return parseNTriples(tekst + '\n')
            .catch(() => [])
            .then(triples => {
                if (triples.length !== 1) throw new Error(`${TOEGESTAAN_PAD}:${regelnr}: geen geldige N-Triples-regel.`);
                return { ...regel, triple: sleutel(triples[0]) };
            });
    }
    return Promise.resolve(tekst.split(/\s+/)).then(tokens => {
        if (tokens.length > 2) throw new Error(`${TOEGESTAAN_PAD}:${regelnr}: verwacht een subject, `
            + `een subject en predicaat, of een volledige N-Triples-regel die eindigt op ' .'.`);
        return {
            ...regel,
            subject: expandeer(tokens[0], regelnr),
            ...(tokens[1] && { predicaat: expandeer(tokens[1], regelnr) })
        };
    });
}

// Elke regel is een subject, een subject + predicaat (IRI of CURIE), of een volledige N-Triples-regel
function leesToegestaan() {
    return Promise.resolve()
        .then(() => fs.existsSync(TOEGESTAAN_PAD) ? fs.readFileSync(TOEGESTAAN_PAD, 'utf8') : '')
        .then(inhoud => inhoud.split('\n')
            .map((lijn, index) => ({ tekst: lijn.trim(), regelnr: index + 1 }))
            .filter(({ tekst }) => tekst && !tekst.startsWith('#')))
        .then(lijnen => Promise.all(lijnen.map(({ tekst, regelnr }) => leesRegel(tekst, regelnr))));
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

// Deelt de verwijderde triples in; zie de uitleg bovenaan
function vergelijk({ tag, huidig, vorige, regels }) {
    const huidigeSleutels = new Set(huidig.map(sleutel));
    const vorigeSleutels = new Set(vorige.map(sleutel));
    const huidigeSubjects = new Set(huidig.map(q => nt(q.subject)));
    const verwijderd = vorige.filter(q => !huidigeSleutels.has(sleutel(q)));
    const toegevoegd = huidig.filter(q => !vorigeSleutels.has(sleutel(q)));
    const toegevoegdPerSP = groepeer(toegevoegd, q => `${nt(q.subject)} ${nt(q.predicate)}`);

    console.log(`Triples: ${vorige.length} in ${tag}, ${huidig.length} nu (+${toegevoegd.length}, -${verwijderd.length})`);

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

    return { tag, regels, toegestaan, verwijderdeConcepten, verwijderdeWaarden, gewijzigd };
}

// Schrijft het resultaat uit; geeft het aantal fouten terug
function rapporteer({ tag, regels, toegestaan, verwijderdeConcepten, verwijderdeWaarden, gewijzigd }) {
    let fouten = 0;

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

    if (fouten && (verwijderdeConcepten.size || verwijderdeWaarden.length)) {
        console.error(`\nIs de verwijdering bewust? Voeg ze toe aan ${TOEGESTAAN_PAD}; dit is een breaking change voor afnemers.`);
    }
    return fouten;
}

const ntPad = skosOptions.ntriplesPath;

Promise.resolve()
    .then(bepaalTag)
    .then(tag => {
        console.log(`Vergelijking van ${ntPad} met release ${tag}`);
        return { tag };
    })
    // 1. SHACL-validatie van de huidige gegenereerde bestanden
    .then(ctx => parseNTriples(fs.readFileSync(ntPad, 'utf8'))
        .then(huidig => validate(skosSource.shapesDataset, rdf.dataset(huidig))
            .then(report => {
                if (!report.conforms) console.error('FOUT: SHACL-validatie faalt, zie ../validation/validation_result.json');
                return { ...ctx, huidig, shaclFouten: report.conforms ? 0 : 1 };
            })))
    // 2. Vergelijking met de vorige release
    .then(ctx => bestandInRevisie(ctx.tag, ntPad)
        .then(parseNTriples)
        .then(vorige => ({ ...ctx, vorige })))
    .then(ctx => leesToegestaan().then(regels => ({ ...ctx, regels })))
    .then(ctx => ({ ...ctx, fouten: ctx.shaclFouten + rapporteer(vergelijk(ctx)) }))
    .then(({ tag, fouten }) => {
        if (fouten) {
            console.error(`\nVergelijking met ${tag} mislukt.`);
            process.exitCode = 1;
        } else {
            console.log(`\nVergelijking met ${tag} geslaagd: er ging geen informatie verloren.`);
        }
    })
    .catch(err => {
        console.error(`FOUT: ${err.message}`);
        process.exitCode = 1;
    });
