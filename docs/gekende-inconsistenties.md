# Gekende inconsistenties

Fouten en tegenstrijdigheden die opgemerkt zijn, maar nog niet rechtgezet. Per punt: wat er mis is,
waar het staat, wat de impact is voor afnemers, en wat er beslist moet worden.

Een rechtzetting in de codelijst zelf (`src/source/codelijst-source.csv`) volgt de gewone werkwijze uit
[Een codelijst aanpassen](codelijst-aanpassen.md) en komt in de volgende release in
[`CHANGELOG.md`](../CHANGELOG.md). Haal een punt hier weg zodra het rechtgezet is.

| # | Wat                          | Waar                      | Wijzigt de codelijst? |
|---|------------------------------|---------------------------|:---------------------:|
| 1 | Twee verschillende licenties | `LICENSE` en `config.yml` |          nee          |

## 1. Twee verschillende licenties

- [`LICENSE`](../LICENSE) in de root is **CC0 1.0 Universal**.
- De DCAT-metadata (`metadata.all.license` in `src/source/config.yml`) vermeldt de **Modellicentie voor gratis hergebruik**
  (`http://data.vlaanderen.be/id/licentie/modellicentie-gratis-hergebruik/v1.0`).
  Die komt in `dataset.ttl` en `catalog.ttl` in het jar-bestand.

**Impact.** Afnemers krijgen twee tegenstrijdige antwoorden op de vraag onder welke licentie ze de
codelijst mogen gebruiken. De [README](../README.md) verwijst voorlopig enkel naar `LICENSE`.

**Te beslissen.** Welke licentie geldt voor de codelijst. Mogelijk is `LICENSE` bedoeld voor de code in
de repository en de modellicentie voor de data; dan zeggen we dat beter expliciet in de README.

## Daarnaast

Een kleinere ongelijkheid in de labels van de conceptschema's, die geen fout is maar wel opvalt:
*VLAREM indelingsklassen* heeft het woord *conceptschema* niet, de andere wel.
