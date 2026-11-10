# Build en release

## Maven

Het project is een gewoon Maven-project met packaging `jar`, op basis van de interne parent
`be.milieuinfo:acd-parent`. Java-code is er niet. Maven dient om de Node.js-scripts te draaien en
het resultaat als artifact te publiceren.

De [`frontend-maven-plugin`](https://github.com/eirslett/frontend-maven-plugin) doet tijdens de build
het volgende:

| Execution | Wat er gebeurt |
| --- | --- |
| `install node and pnpm` | Installeert de Node.js- en pnpm-versie uit `pom.xml` in `target/`, via de Artifactory-mirror |
| `pnpm install` | `pnpm install --frozen-lockfile`: installeert exact wat in `pnpm-lock.yaml` staat |
| `create skos` | `pnpm run create_skos` |
| `create metadata` | `pnpm run create_metadata` |

Al deze stappen hangen standaard aan de fase `generate-resources`. Daarna kopieert Maven twee
resource-mappen naar `target/classes/`:

- `src/main/resources/` — de SKOS-export, de ontologie en de gepubliceerde context
- `temp/` — de DCAT-metadata en het ODCS data contract

Het jar-bestand bevat dus alle bestanden onder hun pad `be/vlaanderen/omgeving/...`. Daarnaast wordt er
een `-sources.jar` gemaakt. Op die classifier steunt de generator om de lijst van gereleasede versies
op te halen.

Lokaal een volledige build draaien:

```bash
mvn verify
```

Daarvoor heb je toegang nodig tot de interne Maven- en Artifactory-repositories.

## Jenkins

De pipeline staat in `Jenkinsfile.groovy` en gebruikt de gedeelde library `Cumulus`. De stappen:

### Controle gegenereerde SKOS

Dit is de stap waar je het vaakst tegenaan zal lopen. Jenkins draait
`mvn generate-resources`, wat de SKOS-bestanden opnieuw genereert uit `src/source/`, en controleert
daarna met `git status` of er iets veranderd is onder `src/main/resources/`.

Is dat zo, dan faalt de build met de melding dat de gegenereerde bestanden afwijken van de gecommitte
versie. Dat betekent bijna altijd een van deze twee dingen:

- je hebt de CSV of de configuratie aangepast, maar `pnpm run create_skos` niet gedraaid of het
  resultaat niet mee gecommit;
- je hebt lokaal een andere versie van de generator gebruikt dan wat in `pnpm-lock.yaml` staat,
  bijvoorbeeld door een oude `node_modules`.

De oplossing: `pnpm install --frozen-lockfile`, `pnpm run create_skos`, en het resultaat committen.

Deze controle gebeurt vóór er een release-tag gemaakt wordt. Zo bevat elke tag gegarandeerd
SKOS-bestanden die overeenkomen met de bron.

### Vergelijking met vorige release

Daarna haalt Jenkins de git-tags op en draait `03_validate_against_previous_release.js` met de Node.js uit
`target/`. De build faalt als de SKOS niet meer voldoet aan de AP-constraints, of als er t.o.v. de
vorige release-tag concepten of waarden verdwenen zijn die niet in
`src/source/toegestane-verwijderingen.txt` staan. Gewijzigde waarden geven enkel een waarschuwing in
de log. Meer uitleg vind je in [Node.js-scripts](scripts.md#03_validate_against_previous_releasejs).

Ook deze controle gebeurt vóór `release:prepare` de nieuwe tag maakt.

### Andere branches

Op een feature branch draait Jenkins een Trivy-scan en `mvn verify`. Wil je toch een snapshot
publiceren, start de build dan met de parameter `DEPLOY` aan, dan wordt het `mvn deploy`.

### De primary branch (`main`)

Op `main` wordt elke build met `mvn deploy` als snapshot gepubliceerd, gevolgd door een Sonar-scan.

Een **release** start je manueel in Jenkins met de release-parameters. De pipeline:

1. bepaalt de nieuwe versie (`versions.bump`) en controleert dat de tag nog niet bestaat,
2. draait `release:prepare`: de versie in `pom.xml` wordt aangepast, er wordt een tag gemaakt, en de
   versie wordt opgehoogd naar de volgende `-SNAPSHOT`,
3. draait `release:perform`, dat de release-versie bouwt en naar Artifactory publiceert.

De commits die de release-plugin daarbij maakt, beginnen met `[Maven skip ci]`. Zo start er geen
nieuwe build op. Pas de versie in `pom.xml` dus nooit met de hand aan.

## Versies

- De versie in `pom.xml` is altijd een `-SNAPSHOT` van de volgende release, bijvoorbeeld `0.2.2-SNAPSHOT`.
- `02_metadata.js` beschrijft in `dataset.ttl` de versie zonder `-SNAPSHOT`, dus de release die eraan komt.
- `catalog.ttl` bevat alle gereleasede versies vanaf `metadata.start_version` uit `config.yml`, plus die
  komende release.
- Het ODCS data contract bestaat voor versies vanaf `dcat.odcs_start_version`.

## Publicatie naar de triple store

Een release komt niet automatisch in Virtuoso terecht. Dat gebeurt met het manuele script
`99_deploy_latest.js`, dat de laatste release uit Artifactory haalt en in de named graph laadt. Meer
uitleg vind je in [Node.js-scripts](scripts.md#99_deploy_latestjs).
