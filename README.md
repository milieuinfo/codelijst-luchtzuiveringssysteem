# codelijst-luchtzuiveringssysteem

Codelijsten (SKOS) rond **luchtzuiveringssystemen voor stallen**, gebruikt voor de monitoring van
ammoniakemissie in het ARMOS-project: types luchtzuiveringssystemen, parameters, normen en
bandbreedtes, systeemstatussen, secundaire alarmen, ...

De codelijst wordt bijgehouden in één CSV-bestand. Daaruit genereert de build een SKOS-vocabularium
(Turtle, N-Triples, JSON-LD, JSON, CSV en Parquet), valideert het tegen een SHACL-applicatieprofiel en
publiceert het als Maven-artifact op `repo.omgeving.vlaanderen.be`. De generatielogica zit in
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).

## Snel aan de slag

Je hebt Node.js en pnpm nodig (de versies staan in `pom.xml` en in `packageManager` van `package.json`).
Gebruik geen `npm install`.

```bash
pnpm install --frozen-lockfile
pnpm run create_skos
pnpm run validate_release
```

## Commando's

Alle commando's draai je vanuit de root van de repository.

| Commando | Wat het doet | Nodig |
| --- | --- | --- |
| `pnpm run create_skos` | Zet `src/source/codelijst-source.csv` om naar de SKOS-bestanden in `src/main/resources/…/conceptscheme/luchtzuiveringssysteem/`, met N3-reasoning en SHACL-validatie | — |
| `pnpm run create_metadata` | Maakt de DCAT-metadata en het ODCS data contract in `temp/` | netwerk naar Artifactory |
| `pnpm run validate_release` | Valideert de gegenereerde bestanden met SHACL en faalt als er t.o.v. de vorige release-tag concepten of waarden verdwenen zijn | git-tags |
| `pnpm run validate_history` | Zelfde controle, plus een rapport van elke release t.o.v. de vorige (`0.0.1 → … → current`) | git-tags |
| `mvn verify` | Volledige build: installeert Node/pnpm in `target/`, draait `create_skos` en `create_metadata`, bouwt de jar | interne Maven-repositories |

Opties voor de validatie:

```bash
pnpm run validate_release --tag codelijst-luchtzuiveringssysteem-0.2.0   # andere vorige release
pnpm run validate_history --verbose                                      # alle details per release
NO_COLOR=1 pnpm run validate_release                                     # zonder kleuren
```

Ontbreken de tags lokaal, haal ze dan op met `git fetch --tags`.

`src/99_deploy_latest.js` (laatste release naar de triple store) is een manuele stap met credentials die
niet in git staan. Lees eerst [Node.js-scripts](docs/scripts.md#99_deploy_latestjs) voor je het gebruikt.

## Een wijziging aan de codelijst

1. `pnpm run create_skos` draaien vóór je iets aanpast: er mag dan niets veranderen in `src/main/resources/`.
2. De bron aanpassen, meestal enkel `src/source/codelijst-source.csv`.
3. `pnpm run create_skos` opnieuw draaien en het effect bekijken met `git diff -- '*.nt'`.
4. `pnpm run validate_release` draaien. Verwijder je bewust iets, zet het dan in
   `src/source/toegestane-verwijderingen.txt` en vermeld het in de PR: het is een breaking change.
5. De bronwijziging **en** de gegenereerde bestanden samen committen. Jenkins genereert alles opnieuw
   en faalt als het afwijkt van wat gecommit is.

Welke bestanden je aanpast voor welke wijziging, lees je in
[Een codelijst aanpassen](docs/codelijst-aanpassen.md).

## Documentatie

| Document | Waarover |
| --- | --- |
| [docs/README.md](docs/README.md) | Overzicht en hoe alles samenhangt |
| [Projectstructuur](docs/projectstructuur.md) | Per bestand: bron of gegenereerd, wie het schrijft en leest, of het in git en in de jar zit |
| [Een codelijst aanpassen](docs/codelijst-aanpassen.md) | Welke bestanden voor welke wijziging, met een stappenplan |
| [Node.js-scripts](docs/scripts.md) | Wat elk script doet, inclusief de validatie t.o.v. vorige releases |
| [Build en release](docs/build-en-release.md) | Maven, de Jenkins-pipeline, versies en releases |
| [AGENTS.md](AGENTS.md) | Richtlijnen en conventies voor AI coding agents (in het Engels) |

Releases maak je niet zelf: Jenkins zet de versie en maakt de tag `codelijst-luchtzuiveringssysteem-x.y.z`.
