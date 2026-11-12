# Build en release

## Maven

Het project is een gewoon Maven-project met packaging `jar`, op basis van de interne parent
`be.milieuinfo:acd-parent`. Java-code is er niet. Maven dient om de Node.js-scripts te draaien en
het resultaat als artifact te publiceren.

De [`frontend-maven-plugin`](https://github.com/eirslett/frontend-maven-plugin) doet tijdens de build
het volgende:

| Execution               | Wat er gebeurt                                                                               |
|-------------------------|----------------------------------------------------------------------------------------------|
| `install node and pnpm` | Installeert de Node.js- en pnpm-versie uit `pom.xml` in `target/`, via de Artifactory-mirror |
| `pnpm install`          | `pnpm install --frozen-lockfile`: installeert exact wat in `pnpm-lock.yaml` staat            |
| `create skos`           | `pnpm run create_skos_only` (zonder changelog, die heeft git-tags nodig)                     |
| `create metadata`       | `pnpm run create_metadata`                                                                   |

Al deze stappen hangen standaard aan de fase `generate-resources`. Daarnaast zijn er drie executions
zonder fase, die enkel Jenkins expliciet aanroept: `code-quality` (`pnpm run check`: lint, opmaak en
tests), `validate-previous-release` en `create-changelog`.

Na de stappen in `generate-resources` kopieert Maven twee resource-mappen naar `target/classes/`:

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

### Codekwaliteit

Daarna draait Jenkins `pnpm run check` (Maven-execution `code-quality`): ESLint op de JavaScript en
de Markdown, de Prettier-controle op de JavaScript en de Vitest-tests in `test/`. De build faalt bij
een ESLint-fout, een bestand dat niet volgens Prettier geformatteerd is of een falende test. Lokaal
los je dat op met `pnpm run format` en `pnpm run lint:fix`; wat overblijft, pas je met de hand aan.

De tests zijn er vooral om dependencies veilig te kunnen updaten:

- de codelijst wordt opnieuw gegenereerd en byte voor byte vergeleken met de gecommitte bestanden;
- de SHACL-validatie, de ingelezen `config.yml` en het ODCS data contract worden vergeleken met de
  verwachte uitvoer in `test/__snapshots__/`;
- de vergelijking met de vorige release (`03_…`) wordt getest op de echte codelijst met bewuste
  wijzigingen (een verwijderd concept, een verwijderde of gewijzigde waarde);
- de changelog (`04_…`) wordt getest op een kleine, vaste codelijst: die snapshots veranderen dus niet
  bij een wijziging aan de echte codelijst;
- een test bewaakt dat `@zazuko/env-node` dezelfde versie heeft als in de generator: die aanvaardt
  enkel datasets van zijn eigen versie.

Faalt een snapshot na een update, dan is de uitvoer veranderd: zoek uit waarom. Is de wijziging
bewust (bv. een aangepaste `config.yml`), werk de snapshots dan bij met `pnpm run test -u` en
bekijk de diff.

`pnpm run test` maakt ook een coverage-rapport in `coverage/`. Sonar leest `coverage/lcov.info` in
(zie `sonar-project.properties`, dat ook `test/`, de configuratiebestanden en `99_deploy_latest.js`
buiten de coverage houdt); de HTML-versie staat in `coverage/lcov-report/index.html`.

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
Die scan (`sonar.scanMaven` uit de Cumulus-library) draait de `sonar-scanner` CLI, niet de Maven-plugin:
instellingen in `pom.xml` worden dus niet gelezen. Extra instellingen staan in `sonar-project.properties`
in de root; wat `scanMaven` zelf met `-D` meegeeft (zoals `sonar.exclusions`) heeft voorrang. Daar staat
nu enkel dat regel S7785 (top-level await) genegeerd wordt: de scripts gebruiken bewust Promise chains.

Een **release** start je manueel in Jenkins met de release-parameters. De pipeline:

1. bepaalt de nieuwe versie (`versions.bump`) en controleert dat de tag nog niet bestaat,
2. bouwt `CHANGELOG.md` opnieuw op en commit en pusht het naar `main` (zie [Changelog](#changelog)),
3. draait `release:prepare`: de versie in `pom.xml` wordt aangepast en gecommit, er wordt een tag
   gemaakt, en de versie wordt opgehoogd naar de volgende `-SNAPSHOT` (een tweede commit). Beide commits
   en de tag worden gepusht,
4. draait `release:perform`, dat de tag uitcheckt, de release-versie bouwt en naar Artifactory publiceert.

De commits die de release-plugin daarbij maakt, beginnen met `[Maven skip ci]`. Zo start er geen
nieuwe build op. Pas de versie in `pom.xml` dus nooit met de hand aan.

### Changelog

Bij een release werkt Jenkins `CHANGELOG.md` zelf bij, in de stage *Changelog* vlak vóór
`release:prepare`. Die draait via Maven (`frontend:pnpm@create-changelog`) `pnpm run create_changelog_full`:
de volledige changelog wordt opnieuw opgebouwd uit alle release-tags, met bovenaan de huidige bestanden
als sectie voor de nieuwe versie. Die versie haalt het script uit de omgevingsvariabele `VERSION`, die
Jenkins in de stage *Setup* zet.

Het resultaat wordt gecommit en gepusht met `git.commitAndPush` uit de Cumulus-library. Die commit krijgt
de trailer `Cumulus-Skip-Ci: true`, zodat er geen nieuwe build opstart. Is er niets gewijzigd, dan wordt
er niets gecommit. `release:prepare` maakt zijn commit en tag daarna bovenop de changelog-commit, dus de
changelog zit in de release-tag.

Lokaal hoef je de changelog vóór een release dus niet meer bij te werken. Wil je vooraf zien wat erin
komt, draai dan `create_changelog` zonder versie: de nog niet gepubliceerde wijzigingen komen in de
sectie *Volgende versie*. Die mag je committen; bij de release bouwt Jenkins de changelog opnieuw op met
`VERSION`, zodat *Volgende versie* de nieuwe versie wordt en de release-tag geen sectie *Volgende versie*
bevat.

```bash
pnpm run create_changelog                                 # sectie 'Volgende versie' in CHANGELOG.md
pnpm run create_changelog_full --version 0.3.0 --stdout   # zoals Jenkins het doet, voor versie 0.3.0
```

Meer uitleg vind je in [Node.js-scripts](scripts.md#04_create_changelogjs).

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
