# Documentatie codelijst-luchtzuiveringssysteem

Deze documentatie is voor wie de codelijst **onderhoudt**. Wat de codelijst is en hoe je ze gebruikt,
lees je in de [README](../README.md) in de root.

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

 gegenereerde .nt + git-tags       ──►  pnpm run validate_release ──►  ✔ / ✖  (SHACL + niets verdwenen t.o.v. vorige release)

 gegenereerde .nt + git-tags       ──►  pnpm run create_changelog ──►  CHANGELOG.md  (wijzigingen per release)

 src/main/resources + temp/        ──►  mvn deploy / release      ──►  jar in repo.omgeving.vlaanderen.be
```

Het eigenlijke werk gebeurt in de npm-package
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).
Dit project levert enkel de brondata, de configuratie en een paar korte scripts die die package
aanroepen.

## Inhoud

| Document                                              | Waarover                                                                                                |
|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Projectstructuur](projectstructuur.md)               | Opzoektabel per bestand: bron of gegenereerd, wie het schrijft en leest, of het in git en in de jar zit |
| [Een codelijst aanpassen](codelijst-aanpassen.md)     | Welke bestanden je aanpast voor welke wijziging, met een stappenplan per geval                          |
| [Node.js-scripts](scripts.md)                         | Wat elk script in `src/` doet en hoe ze samenhangen                                                     |
| [Build en release](build-en-release.md)               | Maven, de Jenkins-pipeline, versies en het jar-bestand                                                  |
| [Gekende inconsistenties](gekende-inconsistenties.md) | Opgemerkte fouten in de codelijst en de metadata die nog rechtgezet moeten worden                       |

## Snel aan de slag

Je hebt Node.js en pnpm nodig (de versies staan in `pom.xml` en in `packageManager` van
`package.json`). Gebruik geen `npm install`.

```bash
pnpm install --frozen-lockfile
pnpm run create_skos
pnpm run validate_release
```

Daarna zie je in `git status` meteen welke gegenereerde bestanden veranderd zijn. Die commit je samen
met je wijziging aan de bron. Waarom dat belangrijk is, lees je in [Build en release](build-en-release.md).

> **Let op:** heb je het project vroeger al eens met `npm install` opgezet, verwijder dan eerst
> `node_modules/`. Een oude `node_modules` bevat mogelijk nog een verouderde versie van de generator,
> en dan krijg je andere output dan Jenkins.

## Commando's

Alle commando's draai je vanuit de root van de repository.

| Commando                         | Wat het doet                                                                                                                                                         | Nodig                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| `pnpm run create_skos`           | Zet `src/source/codelijst-source.csv` om naar de SKOS-bestanden in `src/main/resources/…/conceptscheme/luchtzuiveringssysteem/`, met N3-reasoning en SHACL-validatie | —                          |
| `pnpm run create_metadata`       | Maakt de DCAT-metadata en het ODCS data contract in `temp/`                                                                                                          | netwerk naar Artifactory   |
| `pnpm run validate_release`      | Valideert de gegenereerde bestanden met SHACL en faalt als er t.o.v. de vorige release-tag concepten of waarden verdwenen zijn                                       | git-tags                   |
| `pnpm run validate_history`      | Zelfde controle, plus een rapport van elke release t.o.v. de vorige (`0.0.1 → … → current`)                                                                          | git-tags                   |
| `pnpm run create_changelog`      | Zet de wijzigingen t.o.v. de vorige release-tag in de sectie *Volgende versie* van `CHANGELOG.md` (met `--version` in een sectie voor die versie)                    | git-tags                   |
| `pnpm run create_changelog_full` | Bouwt `CHANGELOG.md` opnieuw op uit alle release-tags, met de huidige bestanden als *Volgende versie* (met `--version` als die versie: zo doet Jenkins het)          | git-tags                   |
| `mvn verify`                     | Volledige build: installeert Node/pnpm in `target/`, draait `create_skos` en `create_metadata`, bouwt de jar                                                         | interne Maven-repositories |

Opties:

```bash
pnpm run validate_release --tag codelijst-luchtzuiveringssysteem-0.2.0   # andere vorige release
pnpm run validate_history --verbose                                      # alle details per release
pnpm run create_changelog --version 0.3.0                                # sectie voor 0.3.0 i.p.v. 'Volgende versie'
NO_COLOR=1 pnpm run validate_release                                     # zonder kleuren
```

Ontbreken de tags lokaal, haal ze dan op met `git fetch --tags`.

`src/99_deploy_latest.js` (laatste release naar de triple store) is een manuele stap met credentials die
niet in git staan. Lees eerst [Node.js-scripts](scripts.md#99_deploy_latestjs) voor je het gebruikt.

## Een wijziging aan de codelijst

1. `pnpm run create_skos` draaien vóór je iets aanpast: er mag dan niets veranderen in `src/main/resources/`.
2. De bron aanpassen, meestal enkel `src/source/codelijst-source.csv`.
3. `pnpm run create_skos` opnieuw draaien en het effect bekijken met `git diff -- '*.nt'`.
4. `pnpm run validate_release` draaien. Verwijder je bewust iets, zet het dan in
   `src/source/toegestane-verwijderingen.txt` en vermeld het in de PR: het is een breaking change.
5. De bronwijziging **en** de gegenereerde bestanden samen committen. Jenkins genereert alles opnieuw
   en faalt als het afwijkt van wat gecommit is.

Welke bestanden je aanpast voor welke wijziging, lees je in [Een codelijst aanpassen](codelijst-aanpassen.md).

Releases maak je niet zelf: Jenkins zet de versie en maakt de tag `codelijst-luchtzuiveringssysteem-x.y.z`.
Ook `CHANGELOG.md` werkt Jenkins dan bij; zie [Build en release](build-en-release.md#changelog).

## Afspraken

- Opmaak volgt [`.editorconfig`](../.editorconfig). Zorg dat je editor dat bestand respecteert.
- Gegenereerde bestanden pas je nooit met de hand aan.
- Credentials (`.env`, `setenv*.js`) staan in `.gitignore` en horen niet in git, ook niet in deze docs.
- Richtlijnen voor AI coding agents staan in [`AGENTS.md`](../AGENTS.md).
