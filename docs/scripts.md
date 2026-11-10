# Node.js-scripts

De scripts in `src/` zijn bewust kort gehouden. Ze lezen de configuratie in via
`src/utils/variables.js` en roepen daarna een functie aan uit
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).
De logica zelf zit in die package. Wil je weten hoe een export precies opgebouwd wordt, dan kijk je
daar.

Alle scripts zijn ES modules en draaien vanuit de map `src/`. De npm scripts in `package.json` doen
daarom eerst een `cd src`:

```json
"create_skos":     "cd src && node 01_codelijst_skos_from_csv.js",
"create_metadata": "cd src && node 02_metadata.js"
```

Start je een script met de hand, doe dat dan ook vanuit `src/`. Anders kloppen de relatieve paden uit
`config.yml` niet.

De nummering geeft de volgorde aan: `01` en `02` horen bij de build, `99` is een manuele stap achteraf.

## `utils/variables.js`

Geen script, maar de lijm tussen de configuratie en de generator. Bij het importeren gebeurt het
volgende:

1. `source/config.yml` wordt ingelezen.
2. De prefixen uit `config.yml` en de JSON-LD context uit `source/context.json` worden samengevoegd.
   Het `concept`-prefix dient tegelijk als `@base`, zodat relatieve IRI's onder
   `https://data.omgeving.vlaanderen.be/id/concept/luchtzuiveringssysteem/` vallen.
3. De SHACL-shapes uit het applicatieprofiel worden ingeladen als RDF-dataset.
4. Alle output-paden worden samengesteld uit `skos.path`, `skos.name` en de extensies in `config.yml`.

Daarnaast staan hier twee **JSON-LD frames**. Een frame bepaalt hoe de platte RDF-graaf terug in een
boomstructuur gegoten wordt:

- `frame_skos_prefixes` wordt gebruikt voor de `.jsonld`-export. IRI's worden er verkort met de
  prefixen (`lzs-type:s2` in plaats van de volledige URL).
- `frame_skos_no_prefixes` wordt gebruikt voor de `.json`-, `.csv`- en `.parquet`-export, met volledige IRI's.

In beide frames staat bij elke property die naar een andere resource verwijst `"@embed": "@never"`.
Zo blijft een verwijzing een verwijzing, en wordt het doelconcept niet genest in het concept dat ernaar
verwijst. Voeg je een nieuwe property toe die naar een IRI verwijst, zet die dan in beide frames.

De geëxporteerde objecten (`skosOptions`, `skosSource`, `metadataSource`, `odcsSource`, ...) zijn
exact de argumenten die de scripts doorgeven aan de generator.

## `01_codelijst_skos_from_csv.js`

```bash
pnpm run create_skos
```

Roept `generate_skos(skosOptions, skosSource)` aan. Dat doet het volgende:

1. **CSV inlezen.** Alle bestanden uit `source.codelijst_csv` worden ingelezen en samengevoegd. Lege
   cellen vallen weg en waarden met een `|` worden opgesplitst in een lijst.
2. **Omzetten naar JSON-LD.** De rijen komen in een `@graph`, met de samengevoegde context en prefixen
   als `@context`.
3. **N3-reasoning.** De JSON-LD wordt omgezet naar RDF, waarna de regels uit `skos.rules` erop
   toegepast worden: de SKOS- en Dublin Core-regels uit de package, en
   `n3/luchtzuivering-rules.n3` uit dit project. Het resultaat is de volledige graaf, inclusief alle
   afgeleide triples, gesorteerd als N-Triples.
4. **SHACL-validatie.** De graaf wordt gevalideerd tegen de AP-constraints. Faalt de validatie, dan
   wordt er niets geschreven en stopt het script met exit code 1. Het rapport komt in
   `validation/validation_result.json`. Zo kan een build nooit stilletjes ongeldige data opleveren.
5. **Exporteren.** De graaf wordt weggeschreven als Turtle, N-Triples, JSON-LD, JSON, CSV en Parquet.

De output komt terecht in `src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/`.
Wat er in die bestanden staat, lees je in [Projectstructuur](projectstructuur.md#gegenereerde-bestanden).

Dit script heeft geen netwerktoegang nodig en levert bij dezelfde input altijd dezelfde output op.
Daar steunt de controle in Jenkins op.

## `02_metadata.js`

```bash
pnpm run create_metadata
```

Maakt de metadata die het jar-bestand beschrijft. Het script voert na elkaar twee functies uit:

**`create_metadata`** bouwt de DCAT-beschrijving:

1. Het leest `groupId`, `artifactId` en `version` uit `pom.xml`. De versie zonder `-SNAPSHOT` is de
   versie die gereleased zal worden.
2. Het vraagt aan Artifactory (`repo.omgeving.vlaanderen.be`) welke versies van dit artifact al
   gereleased zijn, en houdt enkel die vanaf `metadata.start_version` over.
3. Daarmee bouwt het twee grafen op: één `dcat:Dataset` voor de versie die nu gebouwd wordt, en een
   `dcat:Catalog` met alle versies. Titels, beschrijvingen, licentie, thema's en distributies komen uit
   het `metadata`-blok van `config.yml`.
4. Beide worden gevalideerd tegen de DCAT-AP-shapes die in de package zitten, en weggeschreven naar
   `temp/` als Turtle en JSON-LD.

**`create_odcs`** maakt daarna een data contract volgens de
[Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/v3.0.2/) (v3.0.2)
voor de Parquet-distributie. Het leest daarvoor:

- de kolommen en types uit het gegenereerde `.parquet`-bestand,
- het RDF-predicaat per kolom uit `context.json`,
- een naam en omschrijving per kolom uit de SHACL-shapes (`sh:name`, `sh:description`).

Het resultaat is `temp/.../dataset/codelijst-luchtzuiveringssysteem/dataset.odcs.yaml`. Een
`-SNAPSHOT`-versie krijgt status `draft`, een release status `active`.

De volgorde is belangrijk: `create_metadata` maakt `temp/` eerst helemaal leeg. Het data contract moet
dus pas daarna geschreven worden. Omdat `create_odcs` het Parquet-bestand leest, moet ook
`create_skos` al gedraaid hebben.

Dit script heeft **netwerktoegang tot Artifactory** nodig. Zonder die toegang faalt het, maar dat heeft
geen invloed op de SKOS-bestanden.

## `99_deploy_latest.js`

Geen onderdeel van de build. Dit script zet de laatst gereleasede versie in een Virtuoso triple store,
zodat de codelijst via SPARQL en via dereferenceerbare URI's opvraagbaar wordt. Het:

1. zoekt in Artifactory het meest recente gereleasede jar-bestand,
2. pakt er alle `.ttl`-bestanden uit naar `temp/`,
3. voegt ze samen tot één N-Triples-bestand,
4. verwijdert de named graph `https://data.omgeving.vlaanderen.be/id/graph/codelijst-luchtzuiveringssysteem`
   op de doelserver en laadt het nieuwe bestand erin. De naam van die graph wordt afgeleid uit
   `groupId` en `artifactId` in `pom.xml`.

De doelomgeving staat hard in het script (`const omgeving = 'pr'`). De servernaam wordt opgebouwd uit
`deploy.virtuoso` in `config.yml` en die omgeving.

Het script verwacht een lokaal bestand `src/utils/setenv.js` dat een functie `set_env(omgeving)` exporteert.
Die functie zet de credentials voor de triple store als environment variables. Dat bestand bevat
geheimen, staat in `.gitignore` en hoort nooit in git. Zonder dat bestand start het script niet.

Draai dit script enkel als je weet wat je doet: het overschrijft de graaf op een gedeelde server.
