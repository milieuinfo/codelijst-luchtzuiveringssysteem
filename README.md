# Codelijst luchtzuiveringssysteem

Codelijsten rond **luchtzuiveringssystemen voor stallen**, opgezet voor de monitoring van
ammoniakemissie in het ARMOS-project. Sensordata over die systemen worden aangeleverd en beoordeeld aan
de hand van deze lijsten: welk type systeem het is, welke parameters er gemeten worden, binnen welke
normen en bandbreedtes die moeten blijven, en wanneer er een alarm volgt.

De codelijst is een [SKOS](https://www.w3.org/TR/skos-reference/)-vocabularium. Elk concept heeft een
vaste IRI onder `https://data.omgeving.vlaanderen.be/id/` (in de tabel hieronder ingekort tot `…`), een Nederlands label en waar nodig een
definitie en verwijzingen naar andere concepten.

Wat er per versie veranderd is, lees je in de **[changelog](CHANGELOG.md)**.

## Conceptschema's

| Conceptschema                               | Inhoud                                                                                                                                                              |
|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `…/conceptscheme/lzs/systeemtype`           | Types luchtzuiveringssystemen, zoals biologische en chemische luchtwassystemen (S1, S2), biobedden (S3) en Lely Sphere                                              |
| `…/conceptscheme/lzs/systeemopstelling`     | Enkelvoudige of gecombineerde opstelling van systemen                                                                                                               |
| `…/conceptscheme/lzs/parameter`             | De eigenschappen die gemeten worden (waswaterdebiet, zuurtegraad, geleidbaarheid, drukval, ...), met hun grootheid en eenheid en de systeemtypes waarvoor ze gelden |
| `…/conceptscheme/lzs/parameter-norm`        | Normen per parameter en systeemtype, met minimum- en maximumwaarden                                                                                                 |
| `…/conceptscheme/lzs/norm-bandbreedte`      | Toegestane afwijkingen en bandbreedtes per parameter en systeemtype                                                                                                 |
| `…/conceptscheme/lzs/secundaire-alarmen`    | Dagbeoordelingsregels en alarmdrempels voor de secundaire alarmlogica                                                                                               |
| `…/conceptscheme/lzs/systeemstatus`         | Status van een systeem: operationeel, storing, in onderhoud, ...                                                                                                    |
| `…/conceptscheme/lzs/stalbezetting`         | Of de stal in gebruik of leeg is                                                                                                                                    |
| `…/conceptscheme/lzs/medium`                | Waarop een meting slaat: lucht, waswater, spuiwater, stal, ...                                                                                                      |
| `…/conceptscheme/lzs/dataleverancierstatus` | Status van aangeleverde data: (niet) gevalideerd, geweigerd, ingetrokken                                                                                            |
| `…/conceptscheme/vlarem-klasse`             | Indelingsklassen volgens VLAREM                                                                                                                                     |

Grootheden en eenheden verwijzen naar [QUDT](https://qudt.org/) (`quantitykind:`, `unit:`).
Eigen properties, zoals `relevantLZS` en `relevantProperty`, staan in een klein vocabularium onder
`https://data.lzs.omgeving.vlaanderen.be/ns/vocab#`.

## De codelijst gebruiken

Elke release wordt gepubliceerd als Maven-artifact op de Artifactory van Omgeving (`repo.omgeving.vlaanderen.be`):

```xml

<dependency>
    <groupId>be.vlaanderen.omgeving.data.id.graph</groupId>
    <artifactId>codelijst-luchtzuiveringssysteem</artifactId>
    <version><!-- zie CHANGELOG.md --></version>
</dependency>
```

Het jar-bestand bevat dezelfde codelijst in verschillende formaten, onder
`be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/`:

| Bestand                          | Formaat                                                          |
|----------------------------------|------------------------------------------------------------------|
| `luchtzuiveringssysteem.ttl`     | Turtle                                                           |
| `luchtzuiveringssysteem.nt`      | N-Triples, gesorteerd, één triple per regel                      |
| `luchtzuiveringssysteem.jsonld`  | JSON-LD, met verkorte IRI's (prefixen)                           |
| `luchtzuiveringssysteem.json`    | JSON, met volledige IRI's                                        |
| `luchtzuiveringssysteem.csv`     | CSV, één rij per resource (concept, conceptschema, eenheid, ...) |
| `luchtzuiveringssysteem.parquet` | Parquet, beschreven door een data contract (ODCS, zie hieronder) |

Daarnaast zitten in het jar-bestand (paden onder `be/vlaanderen/omgeving/`):

- de DCAT-beschrijving van de dataset en de catalogus van alle versies (`data/id/dataset/…`, `data/id/catalog/…`),
- het ODCS data contract van het Parquet-bestand (`data/id/dataset/codelijst-luchtzuiveringssysteem/dataset.odcs.yaml`),
- het vocabularium met de eigen properties (`data/id/ontology/luchtzuiveringssysteem/`),
- de SHACL-shapes waaraan de codelijst voldoet (`data/id/ontology/luchtzuiveringssysteem-ap-constraints/`),
- een JSON-LD context en prefixlijst (`lzs/data/id/graph/`).

De gegenereerde bestanden van de laatste versie staan ook in deze repository, in
[
`src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/`](src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/).
Een vaste versie vind je onder de git-tag `codelijst-luchtzuiveringssysteem-x.y.z`.

## Versies en compatibiliteit

- Elke release heeft een versienummer `x.y.z` en een git-tag `codelijst-luchtzuiveringssysteem-x.y.z`.
- De [changelog](CHANGELOG.md) toont per versie welke concepten er bijkwamen, gewijzigd zijn of
  verwijderd werden.
- Concepten en waarden verdwijnen niet zomaar: bij elke build wordt gecontroleerd dat er t.o.v. de
  vorige release niets weggevallen is. Een verwijdering is altijd een bewuste keuze en staat in de
  changelog met 🗑️ of ➖.
- Elke release voldoet aan de SHACL-shapes van het applicatieprofiel.

## Licentie

Zie [LICENSE](LICENSE).

## Onderhoud

Wil je de codelijst aanpassen of de build begrijpen, lees dan de [documentatie voor beheerders](docs/README.md).
