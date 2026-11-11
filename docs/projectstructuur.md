# Projectstructuur

Het belangrijkste onderscheid in dit project: wat je zelf onderhoudt (de **bronnen**) en wat de
scripts daaruit afleiden (de **gegenereerde bestanden**). Wie dat verschil kent, weet meteen waar een
wijziging moet gebeuren.

## Opzoektabel

Wat is een bestand, wie maakt het, wie gebruikt het en waar belandt het? De paden onder
`src/main/resources/` zijn ingekort. Ze beginnen allemaal met `be/vlaanderen/omgeving/`.

| Bestand of map | Soort | Geschreven door | Gelezen door | In git | In jar |
| --- | --- | --- | --- | :---: | :---: |
| `src/source/codelijst-source.csv` | ★ bron | jij | `create_skos` | ja | nee |
| `src/source/config.yml` | ★ bron | jij | alle scripts | ja | nee |
| `src/source/context.json` | ★ bron | jij | `create_skos`, `create_metadata`, `create_odcs` | ja | nee |
| `src/source/prefix.json` | ★ bron (referentie) | jij | geen enkel script | ja | nee |
| `src/source/toegestane-verwijderingen.txt` | ★ bron | jij | `validate_release` | ja | nee |
| `src/n3/luchtzuivering-rules.n3` | ★ bron | jij | `create_skos` | ja | nee |
| `src/utils/variables.js` | ★ bron (code) | jij | `01_…`, `02_…`, `03_…` en `04_…` | ja | nee |
| `src/utils/git.js` | ★ bron (code) | jij | `utils/git-utils.js` | ja | nee |
| `src/utils/git-utils.js` | ★ bron (code) | jij | `03_…`, `04_…` | ja | nee |
| `src/utils/releases.js` | ★ bron (code) | jij | `03_…`, `04_…` | ja | nee |
| `src/utils/rdf.js` | ★ bron (code) | jij | `03_…`, `04_…` | ja | nee |
| `src/utils/console.js` | ★ bron (code) | jij | `03_…`, `04_…` | ja | nee |
| `src/utils/markdown.js` | ★ bron (code) | jij | `04_…` | ja | nee |
| `src/main/resources/…/data/id/ontology/luchtzuiveringssysteem/luchtzuiveringssysteem.ttl` | ★ bron | jij | geen enkel script, enkel afnemers | ja | ja |
| `src/main/resources/…/data/id/ontology/luchtzuiveringssysteem-ap-constraints/…-ap-constraints.ttl` | ★ bron | jij | `create_skos` (SHACL), `create_odcs` | ja | ja |
| `src/main/resources/…/lzs/data/id/graph/context.json` en `prefix.json` | ★ bron (gepubliceerde kopie) | jij | geen enkel script, enkel afnemers | ja | ja |
| `src/main/resources/…/data/id/conceptscheme/luchtzuiveringssysteem/*` | ⚙ gegenereerd | `create_skos` | afnemers (de `.parquet` ook door `create_odcs`) | ja | ja |
| `temp/…/dataset/…/dataset.{ttl,jsonld}` | ⚙ gegenereerd | `create_metadata` | afnemers | nee | ja |
| `temp/…/dataset/…/dataset.odcs.yaml` | ⚙ gegenereerd | `create_odcs` | afnemers | nee | ja |
| `temp/…/catalog/…/catalog.{ttl,jsonld}` | ⚙ gegenereerd | `create_metadata` | afnemers | nee | ja |
| `validation/` | ⚙ gegenereerd | SHACL-validatie (`create_skos`, `validate_release`), enkel bij een fout | jij, om de fout te vinden | nee | nee |
| `CHANGELOG.md` | ⚙ gegenereerd | `create_changelog`, `create_changelog_full` | afnemers | ja | nee |
| `pom.xml` | ★ bron | jij, de versie door de release-plugin | Maven, `create_metadata`, `create_odcs` | ja | — |
| `package.json` | ★ bron | jij | pnpm | ja | nee |
| `pnpm-lock.yaml` | ⚙ gegenereerd | pnpm | pnpm | ja | nee |
| `Jenkinsfile.groovy` | ★ bron | jij | Jenkins | ja | nee |
| `node_modules/` | ⚙ gegenereerd | pnpm | de scripts (generator, standaard N3-regels, DCAT-shapes) | nee | nee |
| `target/` | ⚙ gegenereerd | Maven | — | nee | is de jar |

Twee dingen vallen op:

- **Bronnen en gegenereerde bestanden staan door elkaar in `src/main/resources/`.** Alles daaronder
  gaat in het jar-bestand, maar niet alles daaronder wordt gegenereerd. Enkel de map
  `data/id/conceptscheme/` is output van een script. `data/id/ontology/` en `lzs/data/id/graph/`
  onderhoud je met de hand. Twijfel je, kijk dan in deze tabel.
- **Wat in `src/source/` staat, gaat niet mee in het jar-bestand.** Maven neemt enkel
  `src/main/resources/` en `temp/` op als resource-mappen. Afnemers krijgen de CSV-bron dus niet te
  zien, wel het resultaat ervan.

## Overzicht

```
codelijst-luchtzuiveringssysteem/
├── package.json, pnpm-lock.yaml     Node.js-dependencies en de npm scripts
├── pom.xml                          Maven-build: installeert Node/pnpm en draait de scripts
├── Jenkinsfile.groovy               CI/CD-pipeline
├── CHANGELOG.md                     ⚙ wijzigingen per release (create_changelog)
├── src/
│   ├── 01_codelijst_skos_from_csv.js    script: CSV → SKOS
│   ├── 02_metadata.js                   script: DCAT-metadata + ODCS data contract
│   ├── 03_validate_against_previous_release.js  script: SHACL + controle op verwijderingen t.o.v. vorige release
│   ├── 04_create_changelog.js           script: CHANGELOG.md uit de verschillen tussen releases
│   ├── 99_deploy_latest.js              script: laatste release naar Virtuoso (manueel)
│   ├── utils/variables.js               configuratie voor de scripts, JSON-LD frames
│   ├── utils/git.js                     git-bibliotheek: één functie per git-commando
│   ├── utils/git-utils.js               git-hulpfuncties (release-tags, datum, bestand uit een tag)
│   ├── utils/releases.js                releases van de codelijst lezen (gedeeld door 03 en 04)
│   ├── utils/rdf.js                     N-Triples parsen en termen schrijven
│   ├── utils/markdown.js                Markdown: escapen, uitgelijnde tabellen
│   ├── utils/console.js                 console-uitvoer met kleuren, vet en symbolen
│   ├── source/                          ★ brondata
│   │   ├── codelijst-source.csv
│   │   ├── config.yml
│   │   ├── context.json
│   │   ├── prefix.json
│   │   └── toegestane-verwijderingen.txt
│   ├── n3/luchtzuivering-rules.n3       ★ projectspecifieke afleidingsregels
│   └── main/resources/be/vlaanderen/omgeving/
│       ├── data/id/ontology/            ★ vocabularium en SHACL-shapes
│       ├── data/id/conceptscheme/       ⚙ gegenereerde SKOS-bestanden (gecommit)
│       └── lzs/data/id/graph/           ★ gepubliceerde kopie van context en prefixen
├── temp/                            ⚙ gegenereerde metadata (niet gecommit)
├── validation/                      ⚙ SHACL-validatierapport, enkel na een fout (niet gecommit)
├── node_modules/                    ⚙ dependencies, incl. de generator (niet gecommit)
└── target/                          ⚙ Maven-output (niet gecommit)
```

★ = bron, met de hand onderhouden ⚙ = gegenereerd

## Bronnen

### `src/source/codelijst-source.csv`

Dit is de codelijst zelf. Elke rij is één resource: een concept scheme, een concept, een parameter,
een grootheid of een eenheid. Elke kolom is een eigenschap van die resource.

De eerste kolommen zijn de belangrijkste:

| Kolom | Betekenis |
| --- | --- |
| `_id` | De IRI van de resource, meestal als CURIE, bijvoorbeeld `lzs-type:s2` |
| `_type` | De RDF-klasse: `skos:ConceptScheme`, `skos:Concept`, `ssn:Property`, `qudt:Unit`, ... |
| `topConceptOf` | Het concept scheme waarvan dit een top concept is |
| `inScheme` | Het concept scheme waartoe het concept behoort |
| `prefLabel`, `altLabel` | Het label (in het Nederlands) |
| `notation` | Een code, bijvoorbeeld `S2` |
| `broader` | Het bovenliggende concept in een hiërarchie |

Daarna volgen domeinspecifieke kolommen zoals `relevantLZS` (voor welke systeemtypes een parameter
geldt), `relevantUnit`, `relevantQuantityKind`, `minValue`, `maxValue`, `operatie` en `technischefiche`.

Een paar conventies:

- **Meerdere waarden** in één cel scheid je met een `|`, bijvoorbeeld `lzs-type:s1|lzs-type:s2|lzs-type:s3`.
- **Lege cellen** worden genegeerd. Laat een cel dus gewoon leeg als een eigenschap niet van toepassing is.
- **Lege rijen** worden gebruikt om de lijst visueel in blokken te verdelen en hebben geen effect.
- Een **CURIE** zoals `lzs-param:drukvaloverhetsysteem` werkt alleen als het prefix (`lzs-param`) gedefinieerd
  is onder `prefixes:` in `config.yml`.

De concept schemes in het bestand, met het prefix dat hun concepten gebruiken:

| Concept scheme | Prefix van de concepten |
| --- | --- |
| `conceptscheme:systeemtype` | `lzs-type` |
| `conceptscheme:parameter` | `lzs-param` (van het type `ssn:Property`) |
| `conceptscheme:parameter-norm` | `lzs-param-norm` |
| `conceptscheme:norm-bandbreedte` | `lzs-bandbreedte` |
| `conceptscheme:medium` | `lzs-medium` |
| `conceptscheme:systeemstatus` | `lzs-status` |
| `conceptscheme:stalbezetting` | `lzs-stalbezetting` |
| `conceptscheme:systeemopstelling` | `lzs-systeemopstelling` |
| `conceptscheme:dataleverancierstatus` | `lzs-dl-status` |
| `conceptscheme:secundaire-alarmen` | `lzs-sec` |
| `conceptscheme-alg:vlarem-klasse` | `vlarem-klasse` |

Daarnaast bevat het bestand een aantal QUDT-grootheden (`qudt:QuantityKind`) en -eenheden (`qudt:Unit`)
die buiten een concept scheme vallen. Ze staan erin om er een Nederlandstalig label en de
toepasselijke eenheid (`applicableUnit`) aan te koppelen.

### `src/source/context.json`

De JSON-LD context. Die bepaalt hoe een kolomnaam uit de CSV vertaald wordt naar een RDF-predicaat.
Zo wordt `prefLabel` gekoppeld aan `skos:prefLabel` met taal `nl`, en wordt `relevantLZS` gekoppeld aan
`lzs-vocab:relevantLZS` met `"@type": "@id"`, zodat de waarde als IRI geïnterpreteerd wordt en niet als
tekst. Een kolom zonder entry in de context levert geen bruikbare triple op.

De context wordt gebruikt bij de omzetting van CSV naar RDF, maar ook in de omgekeerde richting: bij
het schrijven van de JSON-, CSV- en Parquet-bestanden bepaalt hij de kolomnamen.

### `src/source/config.yml`

De centrale configuratie. De belangrijkste blokken:

- `skos` — welke N3-regels toegepast worden, de prefixen `concept` en `collectie`, het outputpad en
  de extensies van de outputbestanden.
- `source` — waar de CSV-bestanden en de context staan. `codelijst_csv` is een lijst, dus je kan de
  brondata later over meerdere CSV-bestanden verdelen.
- `ap` — waar de SHACL-shapes staan waartegen gevalideerd wordt.
- `dcat` en `metadata` — paden, titels, beschrijvingen, licentie, thema's en distributies voor de
  DCAT-metadata. `metadata.start_version` bepaalt vanaf welke versie oudere releases in de catalogus
  opgenomen worden, `dcat.odcs_start_version` vanaf welke versie er een ODCS data contract bij hoort.
- `prefixes` — alle prefixen die in de CSV en in de Turtle-output gebruikt worden.
- `deploy.virtuoso` — de naam van de Virtuoso-server voor `99_deploy_latest.js`.

Alle paden in `config.yml` zijn relatief ten opzichte van de map `src/`, want de scripts draaien
vanuit die map.

### `src/source/prefix.json`

Een lijst van prefixen in JSON-formaat. De scripts lezen dit bestand **niet** in: de prefixen die
echt gebruikt worden, staan onder `prefixes:` in `config.yml`. Dit bestand is een referentiekopie
naast de gepubliceerde versie in `lzs/data/id/graph/prefix.json`. Voeg je een prefix toe aan
`config.yml`, werk het dan ook hier bij, zodat beide lijsten niet uit elkaar groeien.

### Waarom bestaan `context.json` en `prefix.json` twee keer?

Ze hebben elk een andere rol:

| | `src/source/` | `src/main/resources/…/lzs/data/id/graph/` |
| --- | --- | --- |
| Rol | werkversie voor de build | gepubliceerde versie voor afnemers |
| `context.json` | wordt ingelezen door de scripts | gaat mee in het jar-bestand, wordt door geen enkel script gelezen |
| `prefix.json` | referentie, wordt nergens ingelezen | gaat mee in het jar-bestand, wordt door geen enkel script gelezen |
| Bijgewerkt | bij elke nieuwe kolom of nieuw prefix | met de hand, wanneer afnemers de wijziging nodig hebben |

Er is geen script dat de twee synchroon houdt. Momenteel loopt de gepubliceerde versie wat achter op
`src/source/`: een paar recente termen en prefixen ontbreken er nog. Een wijziging aan de werkversie
heeft dus geen enkel effect op de gepubliceerde kopie, tot iemand die bewust bijwerkt.

### `src/n3/luchtzuivering-rules.n3`

Projectspecifieke afleidingsregels in Notation3. Er staat momenteel één regel in: als een parameter
een `relevantLZS` heeft naar een systeemtype, dan krijgt dat systeemtype omgekeerd een
`relevantProperty` naar die parameter. Je hoeft die relatie dus maar aan één kant in de CSV in te vullen.

Naast deze regels past de generator ook standaardregels toe uit de package zelf (`skos-rules.n3` en
`dcterms-rules.n3`). Die vullen onder andere automatisch `narrower` aan als je `broader` invult,
`hasTopConcept` als je `topConceptOf` invult, en de transitieve varianten (`broaderTransitive`,
`narrowerTransitive`, `semanticRelation`).

### `src/main/resources/.../data/id/ontology/`

Twee Turtle-bestanden die mee in het jar-bestand gaan:

- `luchtzuiveringssysteem/luchtzuiveringssysteem.ttl` — een klein vocabularium met de eigen
  properties onder `lzs-vocab:` (zoals `relevantLZS`, `relevantProperty`, `technischefiche`).
- `luchtzuiveringssysteem-ap-constraints/luchtzuiveringssysteem-ap-constraints.ttl` — het
  applicatieprofiel als SHACL-shapes. Het legt vast waaraan concept schemes, collecties en concepten
  moeten voldoen, bijvoorbeeld dat elk concept een `prefLabel` en een `inScheme` heeft. Elke generatie
  wordt hiertegen gevalideerd. Voldoet de data niet, dan wordt er niets weggeschreven en faalt het script.

### `src/main/resources/.../lzs/data/id/graph/`

`context.json` en `prefix.json` zoals ze in het jar-bestand gepubliceerd worden, zodat afnemers dezelfde
context kunnen gebruiken. Ze worden niet automatisch gesynchroniseerd met `src/source/`. Zie
[hierboven](#waarom-bestaan-contextjson-en-prefixjson-twee-keer) voor het verschil tussen beide versies.

## Gegenereerde bestanden

### SKOS-export (gecommit)

`pnpm run create_skos` schrijft zes bestanden naar
`src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/`:

| Bestand | Formaat | Opmerking |
| --- | --- | --- |
| `luchtzuiveringssysteem.ttl` | Turtle | Met alle prefixen uit `config.yml`, het meest leesbaar |
| `luchtzuiveringssysteem.nt` | N-Triples | Eén triple per regel, gesorteerd. Handig voor diffs |
| `luchtzuiveringssysteem.jsonld` | JSON-LD | Geframed, met verkorte IRI's via de context |
| `luchtzuiveringssysteem.json` | JSON | Plat, met volledige IRI's |
| `luchtzuiveringssysteem.csv` | CSV | Eén rij per resource, ontbrekende waarden als `null` |
| `luchtzuiveringssysteem.parquet` | Parquet | Dezelfde tabel als de CSV, in kolomformaat |

Deze bestanden staan bewust in git. Zo staan ze in elke release-tag op hun vaste pad, en zie je bij
een review meteen welk effect een wijziging aan de CSV heeft op de output. De `.nt` en de `.ttl` zijn
daarvoor het handigst.

Gegenereerd betekent ook: **nooit met de hand aanpassen**. Jenkins genereert ze bij elke build
opnieuw en faalt als het resultaat afwijkt van wat in git staat.

### Metadata in `temp/` (niet gecommit)

`pnpm run create_metadata` schrijft naar `temp/`, een map die in `.gitignore` staat:

```
temp/be/vlaanderen/omgeving/data/id/
├── dataset/codelijst-luchtzuiveringssysteem/
│   ├── dataset.ttl          DCAT-beschrijving van de versie die nu gebouwd wordt
│   ├── dataset.jsonld
│   └── dataset.odcs.yaml    ODCS data contract voor de Parquet-distributie
└── catalog/codelijst-luchtzuiveringssysteem/
    ├── catalog.ttl          DCAT-catalogus met alle gereleasede versies
    └── catalog.jsonld
```

Maven neemt `temp/` mee als resource-map, waardoor deze bestanden toch in het jar-bestand belanden.
Ze hoeven niet in git, omdat ze afhangen van wat er op dat moment in Artifactory staat.

### `validation/` (niet gecommit)

Enkel als een SHACL-validatie faalt, schrijft de generator hier het validatierapport weg, als
`validation_result.json` en `validation_result.parquet`. Bij een geslaagde run wordt de map niet
opgeruimd. Een rapport dat je hier ziet staan, kan dus van een eerdere, mislukte run zijn. Kijk naar
de datum van het bestand.

### `target/`

De gewone Maven-output: `target/classes/` (alles wat in het jar-bestand komt), de jar-bestanden zelf, en
in `target/node/` de lokale Node.js- en pnpm-installatie die de `frontend-maven-plugin` aanmaakt.
