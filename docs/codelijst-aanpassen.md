# Een codelijst aanpassen

Een praktisch stappenplan voor de meest voorkomende wijzigingen. De achtergrond bij de bestanden vind
je in [Projectstructuur](projectstructuur.md).

## Welke bestanden voor welke wijziging?

| Wat wil je doen? | Wat pas je aan | Uitleg |
| --- | --- | --- |
| Label, definitie of code van een concept wijzigen | CSV | [Concept toevoegen of wijzigen](#een-concept-toevoegen-of-wijzigen) |
| Concept toevoegen | CSV | [Concept toevoegen of wijzigen](#een-concept-toevoegen-of-wijzigen) |
| Concept verwijderen of zijn `_id` wijzigen | CSV, en afnemers verwittigen | [Concept toevoegen of wijzigen](#een-concept-toevoegen-of-wijzigen) |
| Parameter koppelen aan een systeemtype | CSV (kolom `relevantLZS` van de parameter) | `relevantProperty` op het systeemtype wordt automatisch afgeleid |
| Concept in een nieuwe namespace | CSV, `config.yml`, beide `prefix.json` | [Nieuw prefix](#een-nieuw-prefix-gebruiken) |
| Nieuw concept scheme | CSV, `config.yml` | [Nieuw concept scheme](#een-nieuw-concept-scheme-toevoegen) |
| Nieuwe kolom of property | CSV, `context.json`, `variables.js`, eventueel vocabularium, shapes en gepubliceerde context | [Nieuwe kolom](#een-nieuwe-kolom-property-toevoegen) |
| Relatie automatisch laten afleiden | `src/n3/luchtzuivering-rules.n3` | [Afleidingsregel](#een-afleidingsregel-toevoegen) |
| Validatieregels (verplichte velden, ...) aanpassen | AP-constraints (`…-ap-constraints.ttl`) | [Projectstructuur](projectstructuur.md#srcmainresourcesdataidontology) |
| Titel of beschrijving van de dataset of distributies | `config.yml`, blok `metadata` | [Node.js-scripts](scripts.md#02_metadatajs) |
| Nieuwe versie uitbrengen | niets in de code, release starten in Jenkins | [Build en release](build-en-release.md#de-primary-branch-main) |

Voor alle wijzigingen behalve de laatste twee geldt dezelfde afsluiter: `pnpm run create_skos`
draaien en de gegenereerde bestanden mee committen.

## Voorbereiding

```bash
git switch -c ARMOS-123-nieuwe-parameter
pnpm install --frozen-lockfile
```

Draai `pnpm run create_skos` één keer vóór je iets aanpast. Zie je in `git status` dan al wijzigingen
onder `src/main/resources/`, dan klopt je lokale setup niet (meestal een verouderde `node_modules`).
Los dat eerst op, anders zitten er straks wijzigingen in je commit die niets met jouw aanpassing te
maken hebben.

## Een concept toevoegen of wijzigen

Dit is veruit de meest voorkomende wijziging, en daarvoor pas je enkel de CSV aan.

1. Open `src/source/codelijst-source.csv`. Een spreadsheet-programma gaat, maar let er dan op dat het
   bestand als UTF-8 CSV met komma's bewaard wordt, en dat er geen kolommen of aanhalingstekens bij
   komen. Een teksteditor of de CSV-weergave van je IDE is veiliger.
2. Voeg een rij toe in het blok van het juiste concept scheme. Kijk naar een bestaand concept in
   hetzelfde scheme en neem dezelfde kolommen over. Minimaal heb je nodig:
   - `_id`, bijvoorbeeld `lzs-status:in_onderhoud`
   - `_type`: `skos:Concept` (of `ssn:Property` voor een parameter)
   - `inScheme`, bijvoorbeeld `conceptscheme:systeemstatus`
   - `prefLabel`
   - `topConceptOf` als het een top concept is, of anders `broader`
3. Verwijzingen naar andere concepten vul je in met hun CURIE. Meerdere waarden scheid je met `|`.
4. Genereer opnieuw:

   ```bash
   pnpm run create_skos
   ```

5. Faalt het script op de SHACL-validatie, open dan het validatierapport in
   `validation/validation_result.json` (die map staat in `.gitignore`). Daarin staat welke resource
   niet voldoet en aan welke shape. Meestal ontbreekt een `prefLabel` of `inScheme`, of is er een
   typfout in een CURIE.
6. Kijk de wijzigingen na. `git diff` op het `.nt`-bestand toont exact welke triples er bijgekomen of
   verdwenen zijn:

   ```bash
   git diff -- '*.nt'
   ```

7. Commit de CSV **samen met** alle gegenereerde bestanden.

Een concept wijzigen of verwijderen gaat op dezelfde manier. Hou er wel rekening mee dat afnemers
naar de IRI van een concept kunnen verwijzen. Een bestaande `_id` aanpassen of verwijderen is dus
een breaking change voor wie dat concept gebruikt.

## Een nieuw prefix gebruiken

Komt een concept in een nieuwe namespace terecht, voeg het prefix dan toe onder `prefixes:` in
`src/source/config.yml`. Zonder dat prefix wordt een CURIE zoals `nieuw-prefix:x` niet omgezet naar
een volledige IRI. Werk ook `src/source/prefix.json` en de kopie in
`src/main/resources/be/vlaanderen/omgeving/lzs/data/id/graph/prefix.json` bij, zodat die lijsten in
lijn blijven.

## Een nieuw concept scheme toevoegen

1. Voeg een rij toe met `_type` = `skos:ConceptScheme`, een `_id` onder het prefix `conceptscheme`
   en een `prefLabel`.
2. Kies een prefix voor de concepten en voeg dat toe aan `config.yml` (zie hierboven).
3. Voeg de concepten toe, met `inScheme` en `topConceptOf` naar het nieuwe scheme.

`hasTopConcept` op het concept scheme hoef je niet in te vullen. Die relatie wordt automatisch
afgeleid uit `topConceptOf`.

## Een nieuwe kolom (property) toevoegen

Dit vraagt het meeste werk, omdat een kolom op verschillende plaatsen gekend moet zijn.

1. **CSV** — voeg de kolom achteraan toe in de header en vul de waarden in.
2. **`src/source/context.json`** — koppel de kolomnaam aan een predicaat. Verwijst de waarde naar een
   andere resource, voeg dan `"@type": "@id"` toe. Gaat het om tekst, dan meestal `"@language": "nl"`.
   Kan er meer dan één waarde zijn, overweeg dan `"@container": "@set"`, zodat de JSON-output altijd
   een lijst bevat.

   ```json
   "relevantSensor": {
     "@id": "https://data.lzs.omgeving.vlaanderen.be/ns/vocab#relevantSensor",
     "@type": "@id"
   }
   ```

3. **`src/utils/variables.js`** — verwijst de property naar een andere resource, voeg ze dan toe aan
   **beide** frames (`frame_skos_prefixes` en `frame_skos_no_prefixes`) met `"@embed": "@never"` en
   `"@omitDefault": true`. Anders wordt het doelconcept genest in de JSON-LD- en JSON-output.
4. **Vocabularium** — gaat het om een nieuwe eigen property onder `lzs-vocab:`, beschrijf ze dan in
   `src/main/resources/be/vlaanderen/omgeving/data/id/ontology/luchtzuiveringssysteem/luchtzuiveringssysteem.ttl`
   met een `rdfs:label`.
5. **SHACL-shapes** (optioneel) — moet de property verplicht zijn of aan een bepaalde klasse voldoen,
   voeg dan een property shape toe aan de AP-constraints. Met `sh:name` en `sh:description` krijgt de
   kolom ook een omschrijving in het ODCS data contract.
6. **Gepubliceerde context** — werk ook
   `src/main/resources/be/vlaanderen/omgeving/lzs/data/id/graph/context.json` bij als afnemers de
   nieuwe term moeten kunnen gebruiken.
7. Genereer opnieuw en controleer de output. Een nieuwe kolom verschijnt ook in de `.csv`- en
   `.parquet`-export.

## Een afleidingsregel toevoegen

Wil je een relatie automatisch laten afleiden in plaats van ze in de CSV in te vullen, voeg dan een
regel toe aan `src/n3/luchtzuivering-rules.n3`. De bestaande regel is een goed voorbeeld:

```n3
{ ?x par:relevantLZS ?y. ?x skos:inScheme <https://data.omgeving.vlaanderen.be/id/conceptscheme/lzs/parameter>. }
  => { ?y par:relevantProperty ?x } .
```

In mensentaal: verwijst een parameter met `relevantLZS` naar een systeemtype, dan verwijst dat
systeemtype met `relevantProperty` terug naar de parameter.

Een nieuw regelbestand moet je ook toevoegen onder `skos.rules` in `config.yml`. Het pad begint met een
`/` en is relatief ten opzichte van `src/`.

## Checklist vóór je commit

- [ ] `pnpm run create_skos` draait zonder fouten
- [ ] de gegenereerde bestanden zitten mee in de commit
- [ ] geen onbedoelde wijzigingen in andere bestanden (opmaak, line endings)
- [ ] commit message in het Nederlands, liefst met ticketnummer (`ARMOS-123 Nieuwe systeemstatus in onderhoud`)
