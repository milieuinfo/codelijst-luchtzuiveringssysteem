# Documentatie codelijst-luchtzuiveringssysteem

Dit project beheert de codelijsten rond **luchtzuiveringssystemen voor stallen**, opgezet voor de
monitoring van ammoniakemissie in het ARMOS-project. Denk aan de types luchtzuiveringssystemen, de
parameters die gemeten worden, de normen en bandbreedtes per parameter, de systeemstatussen en de
secundaire alarmen.

Die lijsten worden niet als database bijgehouden, maar als **één CSV-bestand**. Een build zet dat
CSV-bestand om naar een SKOS-vocabularium in RDF, valideert het resultaat en publiceert het als Maven
artifact. Zo heb je bij elke release een vaste, geversioneerde set bestanden die andere toepassingen
kunnen gebruiken.

## In het kort

```
 src/source/codelijst-source.csv  ─┐
 src/source/context.json           │   pnpm run create_skos
 src/source/config.yml             ├──────────────────────────►  src/main/resources/.../conceptscheme/luchtzuiveringssysteem/
 src/n3/luchtzuivering-rules.n3    │   (CSV → JSON-LD → N3-reasoning      luchtzuiveringssysteem.ttl / .nt / .jsonld
 ontology/...-ap-constraints.ttl  ─┘    → SHACL-validatie → export)         luchtzuiveringssysteem.json / .csv / .parquet

 pom.xml + Artifactory             ──►  pnpm run create_metadata  ──►  temp/  (DCAT-metadata + ODCS data contract)

 src/main/resources + temp/        ──►  mvn deploy / release      ──►  jar in repo.omgeving.vlaanderen.be
```

Het eigenlijke werk gebeurt in de npm-package
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).
Dit project levert enkel de brondata, de configuratie en een paar korte scripts die die package
aanroepen.

## Inhoud

| Document | Waarover |
| --- | --- |
| [Projectstructuur](projectstructuur.md) | Opzoektabel per bestand: bron of gegenereerd, wie het schrijft en leest, of het in git en in de jar zit |
| [Een codelijst aanpassen](codelijst-aanpassen.md) | Welke bestanden je aanpast voor welke wijziging, met een stappenplan per geval |
| [Node.js-scripts](scripts.md) | Wat elk script in `src/` doet en hoe ze samenhangen |
| [Build en release](build-en-release.md) | Maven, de Jenkins-pipeline, versies en het jar-bestand |

## Snel aan de slag

Je hebt Node.js en pnpm nodig (de versies staan in `pom.xml` en in `packageManager` van
`package.json`).

```bash
pnpm install --frozen-lockfile
pnpm run create_skos
```

Daarna zie je in `git status` meteen welke gegenereerde bestanden veranderd zijn. Die commit je samen
met je wijziging aan de bron. Waarom dat belangrijk is, lees je in [Build en release](build-en-release.md).

> **Let op:** heb je het project vroeger al eens met `npm install` opgezet, verwijder dan eerst
> `node_modules/`. Een oude `node_modules` bevat mogelijk nog een verouderde versie van de generator,
> en dan krijg je andere output dan Jenkins.

## Afspraken

- Opmaak volgt [`.editorconfig`](../.editorconfig). Zorg dat je editor dat bestand respecteert.
- Gegenereerde bestanden pas je nooit met de hand aan.
- Credentials (`.env`, `setenv*.js`) staan in `.gitignore` en horen niet in git, ook niet in deze docs.
- Richtlijnen voor AI coding agents staan in [`AGENTS.md`](../AGENTS.md).
