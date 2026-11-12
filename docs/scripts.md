# Node.js-scripts

De scripts in `src/` zijn bewust kort gehouden. Ze lezen de configuratie in via
`src/utils/variables.js` en roepen daarna een functie aan uit
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).
De logica zelf zit in die package. Wil je weten hoe een export precies opgebouwd wordt, dan kijk je
daar.

Alle scripts zijn ES modules en draaien vanuit de map `src/`. De npm scripts in `package.json` doen
daarom eerst een `cd src`:

```json
"create_skos_only": "cd src && node 01_codelijst_skos_from_csv.js",
"create_metadata":  "cd src && node 02_metadata.js"
```

`create_skos` is `create_skos_only` gevolgd door `create_changelog`: na het genereren staan de
wijzigingen meteen in de sectie *Volgende versie* van `CHANGELOG.md` (zie
[`04_create_changelog.js`](#04_create_changelogjs)). Maven draait enkel `create_skos_only`: de build
heeft geen git-tags nodig en mag `CHANGELOG.md` niet aanpassen.

Start je een script met de hand, doe dat dan ook vanuit `src/`. Anders kloppen de relatieve paden uit
`config.yml` niet.

De nummering geeft de volgorde aan: `01` en `02` horen bij de build, `03` is een controle die Jenkins
nadien draait (en die je ook lokaal kan draaien), `04` hoort bij een release, `99` is een manuele stap achteraf.

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
pnpm run create_skos        # en daarna create_changelog
pnpm run create_skos_only   # zonder changelog (zo doet Maven het)
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

## `03_validate_against_previous_release.js`

```bash
pnpm run validate_release
pnpm run validate_release --tag codelijst-luchtzuiveringssysteem-0.2.0   # andere baseline
pnpm run validate_history                                                # alle releases, tag per tag
```

Vergelijkt de gegenereerde codelijst met die van de vorige release. Zo kan er bij een release geen
informatie verdwijnen zonder dat iemand het bewust beslist heeft. Het script:

1. **Bepaalt de vorige release.** Dat is de hoogste tag `codelijst-luchtzuiveringssysteem-x.y.z` die in
   de geschiedenis van `HEAD` ligt. Met `--tag` of de omgevingsvariabele `VORIGE_RELEASE_TAG` kies je
   zelf een tag. Zonder lokale tags faalt het script; haal ze dan op met `git fetch --tags`.
2. **Valideert de huidige `.nt` met SHACL** tegen de AP-constraints, net als `create_skos`. Bij een
   fout komt het rapport in `validation/`.
3. **Vergelijkt de `.nt` met die uit de tag** (`git show <tag>:...`). Enkel de RDF-graaf telt: de andere
   formaten zijn serialisaties van dezelfde graaf. Elke triple uit de tag die nu ontbreekt, valt in
   een van deze groepen:

   | Groep              | Wanneer                                                                                                           | Resultaat    |
   |--------------------|-------------------------------------------------------------------------------------------------------------------|--------------|
   | Verwijderd concept | Het subject komt nergens meer voor. Verwijzingen ernaar vanuit andere concepten (bv. `hasTopConcept`) tellen mee. | fout         |
   | Verwijderde waarde | Een subject + predicaat verloor een waarde, zonder dat er een nieuwe waarde bij kwam                              | fout         |
   | Gewijzigde waarde  | Een subject + predicaat kreeg een andere waarde (bv. `"0,8"` → `"0.8"`)                                           | waarschuwing |

   Toegevoegde triples zijn altijd goed.

Bij een SHACL-fout of een verwijdering die niet toegestaan is, stopt het script met exit code 1.

### Bewuste verwijderingen

Wil je echt iets verwijderen, zet het dan in `src/source/toegestane-verwijderingen.txt`. Eén regel per
verwijdering, met IRI's als `<...>` of als CURIE uit `config.yml`:

```text
lzs-status:gereinigd                          alle triples van dit concept, en verwijzingen ernaar
lzs-param-norm:_1 lzs-vocab:technischefiche   alle waarden van dit predicaat bij dit concept
<https://...> <https://...> "waarde"@nl .     precies deze triple (N-Triples)
```

Een verwijdering blijft een breaking change voor afnemers: vermeld ze in de PR. Na de release zit de
verwijdering in de nieuwe tag. Het script meldt dan dat die regels geen effect meer hebben, en je
mag ze weghalen.

### Volledige geschiedenis: `validate_history`

`pnpm run validate_history` (het script met `--history`) loopt alle releases af, telkens t.o.v. de
vorige: `0.0.1 → 0.0.2 → … → 0.2.1 → current`. Zo zie je in welke release er ooit informatie
verdwenen is.

- Enkel release-tags die in de geschiedenis van `HEAD` liggen, tellen mee. Een tag zonder `.nt`-bestand
  wordt overgeslagen, met een waarschuwing.
- Een stap zonder verwijderingen of wijzigingen is één regel (`✔ 0.2.0 → 0.2.1  952 → 952  +0  -0`).
  Bij de andere stappen staan de bevindingen eronder, met per lijst de eerste 5 items. Met
  `pnpm run validate_history --verbose` zie je alles.
- Op het einde volgt een samenvatting: hoeveel stappen in orde waren, enkel wijzigingen hadden of
  verwijderingen bevatten.
- Verwijderingen in oudere releases worden **enkel gerapporteerd**. Ze zijn al gepubliceerd en
  `toegestane-verwijderingen.txt` geldt er niet voor. De exit code hangt, net als bij
  `validate_release`, enkel af van de SHACL-validatie en de laatste stap (laatste tag → huidige bestanden).

Dit is een manuele controle; Jenkins draait enkel `validate_release`.

### Hulpbestanden

`03_…` en `04_…` delen hun hulpbestanden:

| Bestand              | Inhoud                                                                                                                                             |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `utils/releases.js`  | Specifiek voor dit project: het pad van de `.nt`, de prefixen, de versie uit een tag, de triples van de huidige bestanden of van een release lezen |
| `utils/rdf.js`       | Generiek: N-Triples parsen, een term als N-Triples of verkort met prefixen schrijven, groeperen                                                    |
| `utils/markdown.js`  | Generiek: tekst escapen voor Markdown, tabellen met uitgelijnde kolommen (enkel `04_…`)                                                            |
| `utils/git-utils.js` | Release-tags in de geschiedenis van `HEAD`, de datum van een tag, een bestand uit een tag lezen                                                    |
| `utils/git.js`       | Generiek: één functie per git-commando                                                                                                             |
| `utils/console.js`   | Generiek: kleuren, symbolen, meldingen en `plural`                                                                                                 |

De scripts roepen git niet zelf aan. `utils/git.js` is een kleine git-bibliotheek met één functie per
git-commando (`show`, `tag`, `mergeBase`, `log`, ...), met dezelfde argumenten als op de command line.
Wat die commando's combineert, staat in `utils/git-utils.js`.

De uitvoer gebruikt kleuren en symbolen (✔ ✖ ⚠ ℹ) uit `utils/console.js`. Kleuren staan enkel aan in
een terminal. Met `NO_COLOR=1` zet je ze uit, met `FORCE_COLOR=1` dwing je ze af (bv. in een CI-log die
ANSI-kleuren toont).

Dit script heeft geen netwerktoegang nodig, wel de git-tags.

## `04_create_changelog.js`

```bash
pnpm run create_changelog                      # sectie 'Volgende versie' toevoegen of vervangen
pnpm run create_changelog --version 0.3.0      # sectie voor versie 0.3.0 i.p.v. 'Volgende versie'
pnpm run create_changelog_full                 # volledige changelog opnieuw opbouwen uit alle tags, met 'Volgende versie'
pnpm run create_changelog_full --version 0.3.0 # idem, met de huidige bestanden als versie 0.3.0 (zoals Jenkins)
pnpm run create_changelog --stdout             # naar stdout i.p.v. naar CHANGELOG.md
```

Schrijft `CHANGELOG.md` in de root van de repository: per release de inhoudelijke wijzigingen aan de
codelijst. Net als `03_…` vergelijkt het script de `.nt` van twee versies, maar het rapporteert ook wat
er bijkwam, en dat in een vorm die afnemers kunnen lezen.

Per release staat er een samenvatting (`🆕 5 nieuw · ✏️ 2 gewijzigd · 🗑️ 1 verwijderd`, in aantallen
concepten) en per conceptschema één tabel. Elke rij begint met een emoji:

|    | Wanneer                                                                     |
|----|-----------------------------------------------------------------------------|
| 🆕 | Nieuw concept of conceptschema: de IRI is nieuw                             |
| ✏️ | Een property van een bestaand concept kreeg een andere waarde (oud → nieuw) |
| ➕ | Een property van een bestaand concept kreeg er een waarde bij               |
| ➖ | Een property van een bestaand concept verloor een waarde                    |
| 🗑️ | Verwijderd concept of conceptschema: de IRI komt nergens meer voor          |

Een gewijzigd concept krijgt één rij per property; het concept en het label staan enkel in de eerste
rij. Binnen een tabel staat eerst het conceptschema zelf (als het nieuw of verwijderd is), dan de nieuwe,
de gewijzigde en de verwijderde concepten. Concepten zonder conceptschema (bv. QUDT-eenheden) staan in
een laatste tabel *Zonder conceptschema*. De legende staat bovenaan in `CHANGELOG.md`.

Vóór de tabellen per conceptschema staat een tabel *Properties* als er properties voor het eerst (🆕)
of niet meer (🗑️) gebruikt worden, met het aantal waarden en concepten. Zo zie je een nieuwe kolom in
de CSV ook als die enkel bij nieuwe concepten ingevuld is: van een nieuw concept toont de changelog de
waarden niet. Afgeleide predicaten blijven ook hier weg.

Afgeleide triples (`skos:narrower`, `skos:hasTopConcept`, `skos:note`, de `*Transitive`-varianten,
`relevantProperty`, ...) worden weggelaten zolang de triple waaruit ze volgen er ook staat. Ze zouden
enkel herhalen wat al vermeld is. Welke predicaten dat zijn, staat in `AFGELEID` in het script; voeg je een
N3-regel toe, vul die lijst dan aan.

De tabellen zijn opgevuld met spaties, zodat de kolommen ook in de bron van het bestand uitgelijnd staan (`utils/markdown.js`, dat een emoji als twee tekens
breed telt, zoals een editor met een monospace-font). Lange teksten worden daarom ingekort tot 120 tekens: anders wordt elke rij van de
tabel zo breed als de langste waarde.

**Twee manieren:**

- **`create_changelog`** vergelijkt de huidige gegenereerde bestanden met de laatste release-tag in de
  geschiedenis van `HEAD`. Zonder versie komt het resultaat in de sectie *Volgende versie*, zonder
  datum en met de vermelding t.o.v. welke release. Zo kan de analist zijn wijzigingen nalezen vóór ze
  gepubliceerd worden. Met een versie (`--version`, of de omgevingsvariabele `VERSION` die Jenkins zet
  bij een release) krijgt de sectie die versie en de datum van vandaag, en verdwijnt een bestaande
  sectie *Volgende versie*. Bestaat er al een sectie met hetzelfde label, dan wordt ze vervangen; de
  rest van het bestand blijft ongemoeid. Je kan het dus herhaaldelijk draaien. Is de versie al
  gereleased (er bestaat een tag voor), dan faalt het script.
- **`create_changelog_full`** bouwt het hele bestand opnieuw op uit de release-tags: elke release t.o.v.
  de vorige, met de datum van de tag. De eerste release krijgt een korte samenvatting. Een tag zonder
  `.nt` krijgt een lege sectie en wordt overgeslagen bij de vergelijking. Bovenaan komen de huidige
  bestanden: zonder versie als *Volgende versie*, met een versie (`--version` of `VERSION`) waarvoor nog
  geen tag bestaat als sectie voor die versie, met de datum van vandaag. Heeft die versie al een tag,
  dan tellen de huidige bestanden niet mee. Jenkins gebruikt dit bij een release (met `VERSION`), dus de
  changelog in een release bevat nooit een sectie *Volgende versie*; zie
  [Build en release](build-en-release.md#changelog).

Omdat beide manieren dezelfde vergelijking maken, levert `create_changelog` vlak vóór een release
dezelfde sectie op als `create_changelog_full` na die release (op de kop na: *Volgende versie* wordt
de versie met datum).

`CHANGELOG.md` is gegenereerd: pas het niet met de hand aan, want `create_changelog_full` overschrijft
alles. Het bestand wordt gecommit, maar zit niet in het jar-bestand.

Dit script heeft geen netwerktoegang nodig, wel de git-tags.

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
geheimen, staat in `.gitignore` en hoort nooit in git. Het script importeert het dynamisch: ontbreekt
het, dan stopt het met een melding die naar deze sectie verwijst.

Draai dit script enkel als je weet wat je doet: het overschrijft de graaf op een gedeelde server.
