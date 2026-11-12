# Changelog

Inhoudelijke wijzigingen aan de codelijst luchtzuiveringssysteem, per release en per conceptschema.

🆕 nieuw · ✏️ waarde gewijzigd · ➕ waarde toegevoegd · ➖ waarde verwijderd · 🗑️ verwijderd

Afgeleide relaties (zoals `skos:narrower`, `skos:hasTopConcept` en `skos:note`) zijn weggelaten:
ze volgen uit de wijzigingen die wel vermeld zijn.

Dit bestand wordt gegenereerd met `pnpm run create_changelog` (zie `docs/scripts.md`).
Pas het niet met de hand aan: `pnpm run create_changelog_full` bouwt het volledig opnieuw op.

## [0.2.2] - 2026-11-12

🆕 28 nieuw · ✏️ 12 gewijzigd

### Properties

|     | Property                            | Wijziging                                    |
| --- | ----------------------------------- | -------------------------------------------- |
| 🆕  | `lzs-vocab:relevantNormBandbreedte` | nieuwe property: 1 waarde bij 1 concept      |
| 🆕  | `lzs-vocab:relevantValue`           | nieuwe property: 8 waarden bij 6 concepten   |
| 🆕  | `schema:value`                      | nieuwe property: 27 waarden bij 27 concepten |

### Conceptschema dataleverancier status (`conceptscheme:dataleverancierstatus`)

|     | Concept                               | Label                                | Wijziging                                                                                         |
| --- | ------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:dataleverancierstatus` | Conceptschema dataleverancier status | `skos:prefLabel`: "conceptschema dataleverancier status" → "Conceptschema dataleverancier status" |

### Conceptschema luchtzuiveringssysteem (`conceptscheme:systeemtype`)

|     | Concept                     | Label                                | Wijziging                                                                                         |
| --- | --------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:systeemtype` | Conceptschema luchtzuiveringssysteem | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem" → "Conceptschema luchtzuiveringssysteem" |

### Conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:parameter`)

|     | Concept                   | Label                                           | Wijziging                                                                                                               |
| --- | ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:parameter` | Conceptschema luchtzuiveringssysteem eigenschap | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem eigenschap" → "Conceptschema luchtzuiveringssysteem eigenschap" |

### Conceptschema luchtzuiveringssysteem medium (`conceptscheme:medium`)

|     | Concept                | Label                                       | Wijziging                                                                                                       |
| --- | ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:medium` | Conceptschema luchtzuiveringssysteem medium | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem medium" → "Conceptschema luchtzuiveringssysteem medium" |

### Conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm-bandbreedte`)

|     | Concept                          | Label                                                      | Wijziging                                                                                                                         |
| --- | -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:norm-bandbreedte` | Conceptschema luchtzuiveringssysteem normbandbreedte       | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem normbandbreedte" → "Conceptschema luchtzuiveringssysteem normbandbreedte" |
| ✏️  | `lzs-bandbreedte:_19`            | Waswaterdebiet afwijking naar beneden \> 20% (lelysphere)  | `schema:maxValue`: "0,8" (`xsd:decimal`) → "0.8" (`xsd:decimal`)                                                                  |
| ✏️  | `lzs-bandbreedte:_20`            | Spuiwaterdebiet afwijking naar beneden \> 10% (lelysphere) | `schema:maxValue`: "0,9" (`xsd:decimal`) → "0.9" (`xsd:decimal`)                                                                  |

### Conceptschema luchtzuiveringssysteem opstellingen (`conceptscheme:systeemopstelling`)

|     | Concept                           | Label                                             | Wijziging                                                                                                                  |
| --- | --------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:systeemopstelling` | Conceptschema luchtzuiveringssysteem opstellingen | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem opstelingen" → "Conceptschema luchtzuiveringssysteem opstellingen" |

### Conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:parameter-norm`)

|     | Concept                        | Label                                                       | Wijziging                                                                                                                                                                                          |
| --- | ------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:parameter-norm` | Conceptschema luchtzuiveringssysteem parameter specificatie | `skos:definition`: "Het schema van indelingsklassen (1, 2, 3) zoals vastgelegd in de Vlaamse milieuregelgeving (VLAREM)." → "Normen per parameter en systeemtype, met minimum- en maximumwaarden." |
| ✏️  |                                |                                                             | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem parameter specificatie" → "Conceptschema luchtzuiveringssysteem parameter specificatie"                                                    |

### Conceptschema luchtzuiveringssysteem secundaire alarmen (`conceptscheme:secundaire-alarmen`)

|     | Concept                            | Label                                                                      | Wijziging           |
| --- | ---------------------------------- | -------------------------------------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:secundaire-alarmen` | Conceptschema luchtzuiveringssysteem secundaire alarmen                    | nieuw conceptschema |
| 🆕  | `lzs-sec:alarmdrempel_1`           | Alarmdrempel zuurtegraad waswater (7 dagen)                                | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_2`           | Alarmdrempel geleidbaarheid van het waswater (7 dagen)                     | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_2a`          | Alarmdrempel geleidbaarheid waswater \> 280 mS/cm Lely Sphere (3 dagen)    | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_3`           | Alarmdrempel waswaterdebiet (7 dagen)                                      | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_4`           | Alarmdrempel spuiwaterproductie (7 dagen)                                  | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_5`           | Alarmdrempel drukval over het systeem (7 dagen)                            | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_6`           | Alarmdrempel waswaterdebiet voorbevochtiging (7 dagen)                     | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_7`           | Alarmdrempel waswaterdebiet bevloeiing (7 dagen)                           | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_8`           | Alarmdrempel biobedspuiwaterproductie (7 dagen)                            | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_9`           | Alarmdrempel biobedspoelwaterproductie (7 dagen)                           | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_10`          | Alarmdrempel elektriciteitsverbruik waswaterpomp = 0 Lely Sphere (3 dagen) | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_11`          | Alarmdrempel systeemstatus = storing (15 dagen)                            | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_12`          | Alarmdrempel systeemstatus = onderhoud (2 dagen)                           | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_13`          | Alarmdrempel systeemstatus = in\_reiniging (2 dagen)                       | nieuw concept       |
| 🆕  | `lzs-sec:alarmdrempel_15`          | Alarmdrempel stalbezetting = leeg (15 dagen)                               | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_1`         | Dagbeoordelingsregel zuurtegraad waswater                                  | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_2`         | Dagbeoordelingsregel geleidbaarheid van het waswater                       | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_3`         | Dagbeoordelingsregel waswaterdebiet                                        | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_4`         | Dagbeoordelingsregel spuiwaterproductie                                    | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_5`         | Dagbeoordelingsregel drukval over het systeem                              | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_6`         | Dagbeoordelingsregel waswaterdebiet voorbevochtiging                       | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_7`         | Dagbeoordelingsregel waswaterdebiet bevloeiing                             | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_8`         | Dagbeoordelingsregel biobedspuiwaterproductie                              | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_9`         | Dagbeoordelingsregel biobedspoelwaterproductie                             | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_10`        | Dagbeoordelingsregel elektriciteitsverbruik van de waswaterpomp(en)        | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_11`        | Dagbeoordelingsregel systeemstatus                                         | nieuw concept       |
| 🆕  | `lzs-sec:dagbeoordeling_12`        | Dagbeoordelingsregel stalbezetting                                         | nieuw concept       |

### Conceptschema luchtzuiveringssysteem stalbezetting (`conceptscheme:stalbezetting`)

|     | Concept                       | Label                                              | Wijziging                                                                                                                     |
| --- | ----------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:stalbezetting` | Conceptschema luchtzuiveringssysteem stalbezetting | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem stalbezetting" → "Conceptschema luchtzuiveringssysteem stalbezetting" |

### Conceptschema luchtzuiveringssysteem status (`conceptscheme:systeemstatus`)

|     | Concept                       | Label                                       | Wijziging                                                                                                       |
| --- | ----------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ✏️  | `conceptscheme:systeemstatus` | Conceptschema luchtzuiveringssysteem status | `skos:prefLabel`: "conceptschema luchtzuiveringssysteem status" → "Conceptschema luchtzuiveringssysteem status" |

### VLAREM indelingsklassen (`conceptscheme-alg:vlarem-klasse`)

|     | Concept                           | Label                   | Wijziging                                                                                                                 |
| --- | --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ➕  | `conceptscheme-alg:vlarem-klasse` | VLAREM indelingsklassen | `skos:definition`: "Het schema van indelingsklassen (1, 2, 3) zoals vastgelegd in de Vlaamse milieuregelgeving (VLAREM)." |

## [0.2.1] - 2026-09-25

Geen inhoudelijke wijzigingen aan de codelijst.

## [0.2.0] - 2026-09-25

🆕 5 nieuw · ✏️ 2 gewijzigd

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:parameter`)

|     | Concept                   | Label         | Wijziging                                      |
| --- | ------------------------- | ------------- | ---------------------------------------------- |
| ➕  | `lzs-param:stalbezetting` | Stalbezetting | `lzs-vocab:relevantLZS`: `lzs-type:lelysphere` |
| ➕  | `lzs-param:systeemstatus` | SysteemStatus | `lzs-vocab:relevantLZS`: `lzs-type:lelysphere` |

### conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm-bandbreedte`)

|     | Concept               | Label                                                                | Wijziging     |
| --- | --------------------- | -------------------------------------------------------------------- | ------------- |
| 🆕  | `lzs-bandbreedte:_17` | Geleidbaarheid waswater \> 280mS/cm (lelysphere)                     | nieuw concept |
| 🆕  | `lzs-bandbreedte:_18` | Geleidbaarheid waswater afwijking naar boven \> 40mS/cm (lelysphere) | nieuw concept |
| 🆕  | `lzs-bandbreedte:_19` | Waswaterdebiet afwijking naar beneden \> 20% (lelysphere)            | nieuw concept |
| 🆕  | `lzs-bandbreedte:_20` | Spuiwaterdebiet afwijking naar beneden \> 10% (lelysphere)           | nieuw concept |
| 🆕  | `lzs-bandbreedte:_21` | Elektriciteitsverbruik van de waswaterpomp \< 1 kWh (lelysphere)     | nieuw concept |

## [0.1.8] - 2026-01-13

🆕 2 nieuw · 🗑️ 1 verwijderd

### conceptschema luchtzuiveringssysteem status (`conceptscheme:systeemstatus`)

|     | Concept                     | Label          | Wijziging          |
| --- | --------------------------- | -------------- | ------------------ |
| 🆕  | `lzs-status:buiten_gebruik` | Buiten gebruik | nieuw concept      |
| 🆕  | `lzs-status:in_reiniging`   | In reiniging   | nieuw concept      |
| 🗑️  | `lzs-status:gereinigd`      | Gereinigd      | concept verwijderd |

## [0.1.7] - 2025-12-11

🆕 8 nieuw · ✏️ 12 gewijzigd

### conceptschema dataleverancier status (`conceptscheme:dataleverancierstatus`)

|     | Concept                               | Label                                | Wijziging           |
| --- | ------------------------------------- | ------------------------------------ | ------------------- |
| 🆕  | `conceptscheme:dataleverancierstatus` | conceptschema dataleverancier status | nieuw conceptschema |
| 🆕  | `lzs-dl-status:gevalideerd`           | Gevalideerd                          | nieuw concept       |
| 🆕  | `lzs-dl-status:geweigerd`             | Geweigerd                            | nieuw concept       |
| 🆕  | `lzs-dl-status:ingetrokken`           | Ingetrokken                          | nieuw concept       |
| 🆕  | `lzs-dl-status:nietgevalideerd`       | Niet gevalideerd                     | nieuw concept       |

### conceptschema luchtzuiveringssysteem opstelingen (`conceptscheme:systeemopstelling`)

|     | Concept                              | Label                                            | Wijziging           |
| --- | ------------------------------------ | ------------------------------------------------ | ------------------- |
| 🆕  | `conceptscheme:systeemopstelling`    | conceptschema luchtzuiveringssysteem opstelingen | nieuw conceptschema |
| 🆕  | `lzs-systeemopstelling:enkelvoudig`  | Enkelvoudige opstelling                          | nieuw concept       |
| 🆕  | `lzs-systeemopstelling:gecombineerd` | Gecombineerde opstelling                         | nieuw concept       |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:parameter-norm`)

|     | Concept              | Label                                                              | Wijziging                              |
| --- | -------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| ➕  | `lzs-param-norm:_3`  | Waswaterdebiet S1 systeem                                          | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_4`  | Spuiwaterdebiet S1 systeem                                         | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_8`  | Waswaterdebiet S2 systeem                                          | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_9`  | Spuiwaterdebiet S2 systeem                                         | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_11` | Waswaterdebiet voorbevochtiging S3 systeem                         | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_12` | Waswaterdebiet bevloeiing S3 systeem                               | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_13` | Biobedspuiwaterproductie S3 systeem                                | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_14` | Biobedspoelwaterproductie S3 systeem                               | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_16` | Geleidbaarheid waswater Lely Sphere systeem                        | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_17` | Waswaterdebiet Lely Sphere systeem                                 | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_18` | Spuiwaterdebiet Lely Sphere systeem                                | `schema:minValue`: "0" (`xsd:decimal`) |
| ➕  | `lzs-param-norm:_19` | Elektriciteitsverbruik van de waswaterpomp(en) Lely Sphere systeem | `schema:minValue`: "0" (`xsd:decimal`) |

## [0.1.6] - 2025-11-21

🆕 8 nieuw · ✏️ 10 gewijzigd

### conceptschema luchtzuiveringssysteem (`conceptscheme:systeemtype`)

|     | Concept               | Label       | Wijziging     |
| --- | --------------------- | ----------- | ------------- |
| 🆕  | `lzs-type:lelysphere` | Lely Sphere | nieuw concept |

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:parameter`)

|     | Concept                                       | Label                                          | Wijziging                                      |
| --- | --------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 🆕  | `lzs-param:elektriciteitsverbruikwaterpompen` | Elektriciteitsverbruik van de waswaterpomp(en) | nieuw concept                                  |
| ➕  | `lzs-param:geleidbaarheidvanhetwaswater`      | Geleidbaarheid van het waswater                | `lzs-vocab:relevantLZS`: `lzs-type:lelysphere` |
| ➕  | `lzs-param:spuiwaterproductie`                | Spuiwaterproductie                             | `lzs-vocab:relevantLZS`: `lzs-type:lelysphere` |
| ➕  | `lzs-param:waswaterdebiet`                    | Waswaterdebiet over het waspakket              | `lzs-vocab:relevantLZS`: `lzs-type:lelysphere` |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:parameter-norm`)

|     | Concept              | Label                                                              | Wijziging                                                                     |
| --- | -------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 🆕  | `lzs-param-norm:_16` | Geleidbaarheid waswater Lely Sphere systeem                        | nieuw concept                                                                 |
| 🆕  | `lzs-param-norm:_17` | Waswaterdebiet Lely Sphere systeem                                 | nieuw concept                                                                 |
| 🆕  | `lzs-param-norm:_18` | Spuiwaterdebiet Lely Sphere systeem                                | nieuw concept                                                                 |
| 🆕  | `lzs-param-norm:_19` | Elektriciteitsverbruik van de waswaterpomp(en) Lely Sphere systeem | nieuw concept                                                                 |
| ➕  | `lzs-param-norm:_1`  | Zuurtegraad waswater S1 systeem                                    | `lzs-vocab:referentiewaardeType`: "maximum"                                   |
| ✏️  |                      |                                                                    | `lzs-vocab:technischefiche`: "false" (`xsd:boolean`) → "true" (`xsd:boolean`) |
| ➕  |                      |                                                                    | `schema:maxValue`: "8.5" (`xsd:decimal`)                                      |
| ➕  |                      |                                                                    | `schema:minValue`: "6" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_2`  | Geleidbaarheid waswater S1 systeem                                 | `schema:maxValue`: "30" (`xsd:decimal`)                                       |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_5`  | Drukval S1 systeem                                                 | `schema:maxValue`: "500" (`xsd:decimal`)                                      |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_6`  | Zuurtegraad waswater S2 systeem                                    | `schema:maxValue`: "14" (`xsd:decimal`)                                       |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_7`  | Geleidbaarheid waswater S2 systeem                                 | `schema:maxValue`: "500" (`xsd:decimal`)                                      |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_10` | Drukval S2 systeem                                                 | `schema:maxValue`: "500" (`xsd:decimal`)                                      |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |
| ➕  | `lzs-param-norm:_15` | Drukval S3 systeem                                                 | `schema:maxValue`: "500" (`xsd:decimal`)                                      |
| ➕  |                      |                                                                    | `schema:minValue`: "0" (`xsd:decimal`)                                        |

### Zonder conceptschema

|     | Concept               | Label | Wijziging     |
| --- | --------------------- | ----- | ------------- |
| 🆕  | `quantitykind:Energy` |       | nieuw concept |
| 🆕  | `unit:KiloW-HR`       |       | nieuw concept |

## [0.1.5] - 2025-11-12

✏️ 2 gewijzigd

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:parameter`)

|     | Concept                   | Label         | Wijziging                                                                           |
| --- | ------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| ✏️  | `lzs-param:stalbezetting` | Stalbezetting | `lzs-vocab:relevantCodeList`: `conceptscheme:lzsst` → `conceptscheme:stalbezetting` |
| ✏️  | `lzs-param:systeemstatus` | SysteemStatus | `lzs-vocab:relevantCodeList`: `conceptscheme:lzss` → `conceptscheme:systeemstatus`  |

## [0.1.4] - 2025-10-21

Geen inhoudelijke wijzigingen aan de codelijst.

## [0.1.3] - 2025-10-17

🆕 71 nieuw · ✏️ 6 gewijzigd · 🗑️ 68 verwijderd

### Properties

|     | Property  | Wijziging                                    |
| --- | --------- | -------------------------------------------- |
| 🆕  | `dc:type` | nieuwe property: 16 waarden bij 16 concepten |

### conceptschema luchtzuiveringssysteem (`conceptscheme:lzstype`)

|     | Concept                               | Label                                | Wijziging                |
| --- | ------------------------------------- | ------------------------------------ | ------------------------ |
| 🗑️  | `conceptscheme:lzstype`               | conceptschema luchtzuiveringssysteem | conceptschema verwijderd |
| 🗑️  | `concept:type/luchtwassysteem`        | Luchtwassysteem                      | concept verwijderd       |
| 🗑️  | `concept:type/luchtzuiveringssysteem` | Luchtzuiveringssysteem               | concept verwijderd       |
| 🗑️  | `concept:type/s1`                     | Biologisch luchtwassysteem           | concept verwijderd       |
| 🗑️  | `concept:type/s2`                     | Chemisch luchtwassysteem             | concept verwijderd       |
| 🗑️  | `concept:type/s3`                     | Biobed                               | concept verwijderd       |

### conceptschema luchtzuiveringssysteem (`conceptscheme:systeemtype`)

|     | Concept                           | Label                                | Wijziging           |
| --- | --------------------------------- | ------------------------------------ | ------------------- |
| 🆕  | `conceptscheme:systeemtype`       | conceptschema luchtzuiveringssysteem | nieuw conceptschema |
| 🆕  | `lzs-type:luchtwassysteem`        | Luchtwassysteem                      | nieuw concept       |
| 🆕  | `lzs-type:luchtzuiveringssysteem` | Luchtzuiveringssysteem               | nieuw concept       |
| 🆕  | `lzs-type:s1`                     | Biologisch luchtwassysteem           | nieuw concept       |
| 🆕  | `lzs-type:s2`                     | Chemisch luchtwassysteem             | nieuw concept       |
| 🆕  | `lzs-type:s3`                     | Biobed                               | nieuw concept       |

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:lzsp`)

|     | Concept                                             | Label                                                            | Wijziging                |
| --- | --------------------------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:lzsp`                                | conceptschema luchtzuiveringssysteem eigenschap                  | conceptschema verwijderd |
| 🗑️  | `concept:eigenschap/biobedspoelwaterproductie`      | Biobedspoelwaterproductie                                        | concept verwijderd       |
| 🗑️  | `concept:eigenschap/biobedspuiwaterproductie`       | Biobedspuiwaterproductie                                         | concept verwijderd       |
| 🗑️  | `concept:eigenschap/drukvaloverhetsysteem`          | Drukval over het systeem                                         | concept verwijderd       |
| 🗑️  | `concept:eigenschap/geleidbaarheidvanhetwaswater`   | Geleidbaarheid van het waswater                                  | concept verwijderd       |
| 🗑️  | `concept:eigenschap/spuiwaterproductie`             | Spuiwaterproductie                                               | concept verwijderd       |
| 🗑️  | `concept:eigenschap/stalbezetting`                  | Stalbezetting                                                    | concept verwijderd       |
| 🗑️  | `concept:eigenschap/systeemstatus`                  | SysteemStatus                                                    | concept verwijderd       |
| 🗑️  | `concept:eigenschap/waswaterdebiet`                 | Waswaterdebiet over het waspakket                                | concept verwijderd       |
| 🗑️  | `concept:eigenschap/waswaterdebietbevloeiing`       | Waswaterdebiet van de bevloeiing van het vulmateriaal            | concept verwijderd       |
| 🗑️  | `concept:eigenschap/waswaterdebietvoorbevochtiging` | Waswaterdebiet van de voorbevochtiging van de ingaande stallucht | concept verwijderd       |
| 🗑️  | `concept:eigenschap/zuurtegraadwaswater`            | Zuurtegraad van het waswater                                     | concept verwijderd       |

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:parameter`)

|     | Concept                                    | Label                                                            | Wijziging           |
| --- | ------------------------------------------ | ---------------------------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:parameter`                  | conceptschema luchtzuiveringssysteem eigenschap                  | nieuw conceptschema |
| 🆕  | `lzs-param:biobedspoelwaterproductie`      | Biobedspoelwaterproductie                                        | nieuw concept       |
| 🆕  | `lzs-param:biobedspuiwaterproductie`       | Biobedspuiwaterproductie                                         | nieuw concept       |
| 🆕  | `lzs-param:drukvaloverhetsysteem`          | Drukval over het systeem                                         | nieuw concept       |
| 🆕  | `lzs-param:geleidbaarheidvanhetwaswater`   | Geleidbaarheid van het waswater                                  | nieuw concept       |
| 🆕  | `lzs-param:spuiwaterproductie`             | Spuiwaterproductie                                               | nieuw concept       |
| 🆕  | `lzs-param:stalbezetting`                  | Stalbezetting                                                    | nieuw concept       |
| 🆕  | `lzs-param:systeemstatus`                  | SysteemStatus                                                    | nieuw concept       |
| 🆕  | `lzs-param:waswaterdebiet`                 | Waswaterdebiet over het waspakket                                | nieuw concept       |
| 🆕  | `lzs-param:waswaterdebietbevloeiing`       | Waswaterdebiet van de bevloeiing van het vulmateriaal            | nieuw concept       |
| 🆕  | `lzs-param:waswaterdebietvoorbevochtiging` | Waswaterdebiet van de voorbevochtiging van de ingaande stallucht | nieuw concept       |
| 🆕  | `lzs-param:zuurtegraadwaswater`            | Zuurtegraad van het waswater                                     | nieuw concept       |

### conceptschema luchtzuiveringssysteem medium (`conceptscheme:lzsm`)

|     | Concept                                            | Label                                       | Wijziging                |
| --- | -------------------------------------------------- | ------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:lzsm`                               | conceptschema luchtzuiveringssysteem medium | conceptschema verwijderd |
| 🗑️  | `concept:medium/hetelektronischmonitoringssysteem` | Het elektronisch monitoringssysteem         | concept verwijderd       |
| 🗑️  | `concept:medium/lucht`                             | Lucht                                       | concept verwijderd       |
| 🗑️  | `concept:medium/spuiwater`                         | Spuiwater                                   | concept verwijderd       |
| 🗑️  | `concept:medium/stal`                              | Stal                                        | concept verwijderd       |
| 🗑️  | `concept:medium/waswater`                          | Waswater                                    | concept verwijderd       |

### conceptschema luchtzuiveringssysteem medium (`conceptscheme:medium`)

|     | Concept                                        | Label                                       | Wijziging           |
| --- | ---------------------------------------------- | ------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:medium`                         | conceptschema luchtzuiveringssysteem medium | nieuw conceptschema |
| 🆕  | `lzs-medium:hetelektronischmonitoringssysteem` | Het elektronisch monitoringssysteem         | nieuw concept       |
| 🆕  | `lzs-medium:lucht`                             | Lucht                                       | nieuw concept       |
| 🆕  | `lzs-medium:spuiwater`                         | Spuiwater                                   | nieuw concept       |
| 🆕  | `lzs-medium:stal`                              | Stal                                        | nieuw concept       |
| 🆕  | `lzs-medium:waswater`                          | Waswater                                    | nieuw concept       |

### conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm_bandbreedte`)

|     | Concept                          | Label                                                                      | Wijziging                |
| --- | -------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:norm_bandbreedte` | conceptschema luchtzuiveringssysteem normbandbreedte                       | conceptschema verwijderd |
| 🗑️  | `concept:norm_bandbreedte/1`     | Zuurtegraad waswater \< 6 (S1 systeem)                                     | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/2`     | Zuurtegraad waswater \> 8,5 (S1 systeem)                                   | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/3`     | Geleidbaarheid waswater \> maximale waarde (S1 systeem)                    | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/4`     | Waswaterdebiet afwijking naar beneden \> 20% (S1 systeem)                  | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/5`     | Spuiwaterdebiet afwijking naar beneden \> 10% (S1 systeem)                 | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/6`     | Drukval afwijking naar beneden \> 40% (S1 systeem)                         | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/7`     | Drukval afwijking naar boven \> 40% (S1 systeem)                           | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/8`     | Zuurtegraad waswater afwijking naar boven \> 1 pH-eenheid (S2 systeem)     | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/9`     | Geleidbaarheid waswater \> maximale waarde (S2 systeem)                    | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/10`    | Waswaterdebiet afwijking naar beneden \> 20% (S2 systeem)                  | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/11`    | Spuiwaterdebiet afwijking naar beneden \> 10% (S2 systeem)                 | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/12`    | Drukval afwijking naar beneden \> 40% (S2 systeem)                         | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/13`    | Drukval afwijking naar boven \> 40% (S2 systeem)                           | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/14`    | Waswaterdebiet voorbevochtiging afwijking naar beneden \> 20% (S3 systeem) | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/15`    | Waswaterdebiet bevloeiing afwijking naar beneden \> 20% (S3 systeem)       | concept verwijderd       |
| 🗑️  | `concept:norm_bandbreedte/16`    | Drukval afwijking naar boven \> 50 Pa (S3 systeem)                         | concept verwijderd       |

### conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm-bandbreedte`)

|     | Concept                          | Label                                                                      | Wijziging           |
| --- | -------------------------------- | -------------------------------------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:norm-bandbreedte` | conceptschema luchtzuiveringssysteem normbandbreedte                       | nieuw conceptschema |
| 🆕  | `lzs-bandbreedte:_1`             | Zuurtegraad waswater \< 6 (S1 systeem)                                     | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_2`             | Zuurtegraad waswater \> 8,5 (S1 systeem)                                   | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_3`             | Geleidbaarheid waswater \> maximale waarde (S1 systeem)                    | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_4`             | Waswaterdebiet afwijking naar beneden \> 20% (S1 systeem)                  | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_5`             | Spuiwaterdebiet afwijking naar beneden \> 10% (S1 systeem)                 | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_6`             | Drukval afwijking naar beneden \> 40% (S1 systeem)                         | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_7`             | Drukval afwijking naar boven \> 40% (S1 systeem)                           | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_8`             | Zuurtegraad waswater afwijking naar boven \> 1 pH-eenheid (S2 systeem)     | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_9`             | Geleidbaarheid waswater \> maximale waarde (S2 systeem)                    | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_10`            | Waswaterdebiet afwijking naar beneden \> 20% (S2 systeem)                  | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_11`            | Spuiwaterdebiet afwijking naar beneden \> 10% (S2 systeem)                 | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_12`            | Drukval afwijking naar beneden \> 40% (S2 systeem)                         | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_13`            | Drukval afwijking naar boven \> 40% (S2 systeem)                           | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_14`            | Waswaterdebiet voorbevochtiging afwijking naar beneden \> 20% (S3 systeem) | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_15`            | Waswaterdebiet bevloeiing afwijking naar beneden \> 20% (S3 systeem)       | nieuw concept       |
| 🆕  | `lzs-bandbreedte:_16`            | Drukval afwijking naar boven \> 50 Pa (S3 systeem)                         | nieuw concept       |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:lzs-param-norm`)

|     | Concept                        | Label                                                       | Wijziging                |
| --- | ------------------------------ | ----------------------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:lzs-param-norm` | conceptschema luchtzuiveringssysteem parameter specificatie | conceptschema verwijderd |
| 🗑️  | `concept:parameter_norm/_1`    | Zuurtegraad waswater S1 systeem                             | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_2`    | Geleidbaarheid waswater S1 systeem                          | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_3`    | Waswaterdebiet S1 systeem                                   | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_4`    | Spuiwaterdebiet S1 systeem                                  | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_5`    | Drukval S1 systeem                                          | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_6`    | Zuurtegraad waswater S2 systeem                             | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_7`    | Geleidbaarheid waswater S2 systeem                          | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_8`    | Waswaterdebiet S2 systeem                                   | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_9`    | Spuiwaterdebiet S2 systeem                                  | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_10`   | Drukval S2 systeem                                          | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_11`   | Waswaterdebiet voorbevochtiging S3 systeem                  | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_12`   | Waswaterdebiet bevloeiing S3 systeem                        | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_13`   | Biobedspuiwaterproductie S3 systeem                         | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_14`   | Biobedspoelwaterproductie S3 systeem                        | concept verwijderd       |
| 🗑️  | `concept:parameter_norm/_15`   | Drukval S3 systeem                                          | concept verwijderd       |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:parameter-norm`)

|     | Concept                        | Label                                                       | Wijziging           |
| --- | ------------------------------ | ----------------------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:parameter-norm` | conceptschema luchtzuiveringssysteem parameter specificatie | nieuw conceptschema |
| 🆕  | `lzs-param-norm:_1`            | Zuurtegraad waswater S1 systeem                             | nieuw concept       |
| 🆕  | `lzs-param-norm:_2`            | Geleidbaarheid waswater S1 systeem                          | nieuw concept       |
| 🆕  | `lzs-param-norm:_3`            | Waswaterdebiet S1 systeem                                   | nieuw concept       |
| 🆕  | `lzs-param-norm:_4`            | Spuiwaterdebiet S1 systeem                                  | nieuw concept       |
| 🆕  | `lzs-param-norm:_5`            | Drukval S1 systeem                                          | nieuw concept       |
| 🆕  | `lzs-param-norm:_6`            | Zuurtegraad waswater S2 systeem                             | nieuw concept       |
| 🆕  | `lzs-param-norm:_7`            | Geleidbaarheid waswater S2 systeem                          | nieuw concept       |
| 🆕  | `lzs-param-norm:_8`            | Waswaterdebiet S2 systeem                                   | nieuw concept       |
| 🆕  | `lzs-param-norm:_9`            | Spuiwaterdebiet S2 systeem                                  | nieuw concept       |
| 🆕  | `lzs-param-norm:_10`           | Drukval S2 systeem                                          | nieuw concept       |
| 🆕  | `lzs-param-norm:_11`           | Waswaterdebiet voorbevochtiging S3 systeem                  | nieuw concept       |
| 🆕  | `lzs-param-norm:_12`           | Waswaterdebiet bevloeiing S3 systeem                        | nieuw concept       |
| 🆕  | `lzs-param-norm:_13`           | Biobedspuiwaterproductie S3 systeem                         | nieuw concept       |
| 🆕  | `lzs-param-norm:_14`           | Biobedspoelwaterproductie S3 systeem                        | nieuw concept       |
| 🆕  | `lzs-param-norm:_15`           | Drukval S3 systeem                                          | nieuw concept       |

### conceptschema luchtzuiveringssysteem stalbezetting (`conceptscheme:lzsst`)

|     | Concept                          | Label                                              | Wijziging                |
| --- | -------------------------------- | -------------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:lzsst`            | conceptschema luchtzuiveringssysteem stalbezetting | conceptschema verwijderd |
| 🗑️  | `concept:stalgebruik/in_gebruik` | Stal in gebruik, dieren aanwezig.                  | concept verwijderd       |
| 🗑️  | `concept:stalgebruik/leeg`       | Lege stal                                          | concept verwijderd       |

### conceptschema luchtzuiveringssysteem stalbezetting (`conceptscheme:stalbezetting`)

|     | Concept                        | Label                                              | Wijziging           |
| --- | ------------------------------ | -------------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:stalbezetting`  | conceptschema luchtzuiveringssysteem stalbezetting | nieuw conceptschema |
| 🆕  | `lzs-stalbezetting:in_gebruik` | Stal in gebruik, dieren aanwezig.                  | nieuw concept       |
| 🆕  | `lzs-stalbezetting:leeg`       | Lege stal                                          | nieuw concept       |

### conceptschema luchtzuiveringssysteem status (`conceptscheme:lzss`)

|     | Concept                       | Label                                       | Wijziging                |
| --- | ----------------------------- | ------------------------------------------- | ------------------------ |
| 🗑️  | `conceptscheme:lzss`          | conceptschema luchtzuiveringssysteem status | conceptschema verwijderd |
| 🗑️  | `concept:status/gereinigd`    | Gereinigd                                   | concept verwijderd       |
| 🗑️  | `concept:status/onderhoud`    | In onderhoud                                | concept verwijderd       |
| 🗑️  | `concept:status/operationeel` | Operationeel                                | concept verwijderd       |
| 🗑️  | `concept:status/storing`      | Storing                                     | concept verwijderd       |

### conceptschema luchtzuiveringssysteem status (`conceptscheme:systeemstatus`)

|     | Concept                       | Label                                       | Wijziging           |
| --- | ----------------------------- | ------------------------------------------- | ------------------- |
| 🆕  | `conceptscheme:systeemstatus` | conceptschema luchtzuiveringssysteem status | nieuw conceptschema |
| 🆕  | `lzs-status:gereinigd`        | Gereinigd                                   | nieuw concept       |
| 🆕  | `lzs-status:onderhoud`        | In onderhoud                                | nieuw concept       |
| 🆕  | `lzs-status:operationeel`     | Operationeel                                | nieuw concept       |
| 🆕  | `lzs-status:storing`          | Storing                                     | nieuw concept       |

### Zonder conceptschema

|     | Concept                       | Label | Wijziging                                  |
| --- | ----------------------------- | ----- | ------------------------------------------ |
| 🆕  | `unit:M3`                     |       | nieuw concept                              |
| 🆕  | `unit:M3-PER-HR`              |       | nieuw concept                              |
| 🆕  | `unit:MilliS-PER-CentiM`      |       | nieuw concept                              |
| 🆕  | `unit:NUM`                    |       | nieuw concept                              |
| 🆕  | `unit:PA`                     |       | nieuw concept                              |
| 🆕  | `unit:PH`                     |       | nieuw concept                              |
| ➕  | `quantitykind:Acidity`        |       | `skos:altLabel`: "Zuurtegraad"             |
| ➕  | `quantitykind:Conductivity`   |       | `skos:altLabel`: "Geleidbaarheid"          |
| ➕  | `quantitykind:Count`          |       | `skos:altLabel`: "Aantal"                  |
| ➕  | `quantitykind:VaporPressure`  |       | `skos:altLabel`: "Dampdruk"                |
| ➕  | `quantitykind:Volume`         |       | `skos:altLabel`: "Volume"                  |
| ➕  | `quantitykind:VolumeFlowRate` |       | `skos:altLabel`: "Volume per tijdseenheid" |
| 🗑️  | `quantitykind:Basicity`       |       | concept verwijderd                         |
| 🗑️  | `quantitykind:Fugacity`       |       | concept verwijderd                         |
| 🗑️  | `quantitykind:VolumePerTime`  |       | concept verwijderd                         |

## [0.1.2] - 2025-09-04

🆕 21 nieuw · ✏️ 6 gewijzigd · 🗑️ 16 verwijderd

### conceptschema luchtzuiveringssysteem (`conceptscheme:lzs`)

|     | Concept             | Label                                | Wijziging                |
| --- | ------------------- | ------------------------------------ | ------------------------ |
| 🗑️  | `conceptscheme:lzs` | conceptschema luchtzuiveringssysteem | conceptschema verwijderd |

### conceptschema luchtzuiveringssysteem (`conceptscheme:lzstype`)

|     | Concept                               | Label                                | Wijziging                                                          |
| --- | ------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| 🆕  | `conceptscheme:lzstype`               | conceptschema luchtzuiveringssysteem | nieuw conceptschema                                                |
| ✏️  | `concept:type/luchtwassysteem`        | Luchtwassysteem                      | `skos:inScheme`: `conceptscheme:lzs` → `conceptscheme:lzstype`     |
| ✏️  | `concept:type/luchtzuiveringssysteem` | Luchtzuiveringssysteem               | `skos:topConceptOf`: `conceptscheme:lzs` → `conceptscheme:lzstype` |
| ✏️  | `concept:type/s1`                     | Biologisch luchtwassysteem           | `skos:inScheme`: `conceptscheme:lzs` → `conceptscheme:lzstype`     |
| ✏️  | `concept:type/s2`                     | Chemisch luchtwassysteem             | `skos:inScheme`: `conceptscheme:lzs` → `conceptscheme:lzstype`     |
| ✏️  | `concept:type/s3`                     | Biobed                               | `skos:inScheme`: `conceptscheme:lzs` → `conceptscheme:lzstype`     |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:lzs-param-norm`)

|     | Concept                        | Label                                                       | Wijziging                                                                                                                 |
| --- | ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ➕  | `conceptscheme:lzs-param-norm` | conceptschema luchtzuiveringssysteem parameter specificatie | `skos:definition`: "Het schema van indelingsklassen (1, 2, 3) zoals vastgelegd in de Vlaamse milieuregelgeving (VLAREM)." |
| 🆕  | `concept:parameter_norm/_1`    | Zuurtegraad waswater S1 systeem                             | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_2`    | Geleidbaarheid waswater S1 systeem                          | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_3`    | Waswaterdebiet S1 systeem                                   | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_4`    | Spuiwaterdebiet S1 systeem                                  | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_5`    | Drukval S1 systeem                                          | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_6`    | Zuurtegraad waswater S2 systeem                             | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_7`    | Geleidbaarheid waswater S2 systeem                          | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_8`    | Waswaterdebiet S2 systeem                                   | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_9`    | Spuiwaterdebiet S2 systeem                                  | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_10`   | Drukval S2 systeem                                          | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_11`   | Waswaterdebiet voorbevochtiging S3 systeem                  | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_12`   | Waswaterdebiet bevloeiing S3 systeem                        | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_13`   | Biobedspuiwaterproductie S3 systeem                         | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_14`   | Biobedspoelwaterproductie S3 systeem                        | nieuw concept                                                                                                             |
| 🆕  | `concept:parameter_norm/_15`   | Drukval S3 systeem                                          | nieuw concept                                                                                                             |
| 🗑️  | `concept:parameter_norm/1`     | Zuurtegraad waswater S1 systeem                             | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/2`     | Geleidbaarheid waswater S1 systeem                          | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/3`     | Waswaterdebiet S1 systeem                                   | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/4`     | Spuiwaterdebiet S1 systeem                                  | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/5`     | Drukval S1 systeem                                          | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/6`     | Zuurtegraad waswater S2 systeem                             | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/7`     | Geleidbaarheid waswater S2 systeem                          | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/8`     | Waswaterdebiet S2 systeem                                   | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/9`     | Spuiwaterdebiet S2 systeem                                  | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/10`    | Drukval S2 systeem                                          | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/11`    | Waswaterdebiet voorbevochtiging S3 systeem                  | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/12`    | Waswaterdebiet bevloeiing S3 systeem                        | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/13`    | Biobedspuiwaterproductie S3 systeem                         | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/14`    | Biobedspoelwaterproductie S3 systeem                        | concept verwijderd                                                                                                        |
| 🗑️  | `concept:parameter_norm/15`    | Drukval S3 systeem                                          | concept verwijderd                                                                                                        |

### conceptschema luchtzuiveringssysteem status (`conceptscheme:lzss`)

|     | Concept                    | Label     | Wijziging     |
| --- | -------------------------- | --------- | ------------- |
| 🆕  | `concept:status/gereinigd` | Gereinigd | nieuw concept |

### VLAREM indelingsklassen (`conceptscheme-alg:vlarem-klasse`)

|     | Concept                           | Label                   | Wijziging           |
| --- | --------------------------------- | ----------------------- | ------------------- |
| 🆕  | `conceptscheme-alg:vlarem-klasse` | VLAREM indelingsklassen | nieuw conceptschema |
| 🆕  | `vlarem-klasse:k1`                | Klasse 1                | nieuw concept       |
| 🆕  | `vlarem-klasse:k2`                | Klasse 2                | nieuw concept       |
| 🆕  | `vlarem-klasse:k3`                | Klasse 3                | nieuw concept       |

## [0.1.1] - 2025-09-01

✏️ 42 gewijzigd

### Properties

|     | Property                | Wijziging                                             |
| --- | ----------------------- | ----------------------------------------------------- |
| 🆕  | `lzs-vocab:relevantLZS` | nieuwe property: 52 waarden bij 42 concepten          |
| 🗑️  | `dcterms:type`          | niet meer gebruikt (was: 52 waarden bij 42 concepten) |

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:lzsp`)

|     | Concept                                             | Label                                                            | Wijziging                                                                        |
| --- | --------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ➖  | `concept:eigenschap/biobedspoelwaterproductie`      | Biobedspoelwaterproductie                                        | `dcterms:type`: `concept:type/s3`                                                |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`                                       |
| ➖  | `concept:eigenschap/biobedspuiwaterproductie`       | Biobedspuiwaterproductie                                         | `dcterms:type`: `concept:type/s3`                                                |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`                                       |
| ➖  | `concept:eigenschap/drukvaloverhetsysteem`          | Drukval over het systeem                                         | `dcterms:type`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2`          |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ➖  | `concept:eigenschap/geleidbaarheidvanhetwaswater`   | Geleidbaarheid van het waswater                                  | `dcterms:type`: `concept:type/s1`, `concept:type/s2`                             |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s1`, `concept:type/s2`                    |
| ➖  | `concept:eigenschap/spuiwaterproductie`             | Spuiwaterproductie                                               | `dcterms:type`: `concept:type/s1`, `concept:type/s2`                             |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s1`, `concept:type/s2`                    |
| ➖  | `concept:eigenschap/stalbezetting`                  | Stalbezetting                                                    | `dcterms:type`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2`          |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ➖  | `concept:eigenschap/systeemstatus`                  | SysteemStatus                                                    | `dcterms:type`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2`          |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ➖  | `concept:eigenschap/waswaterdebiet`                 | Waswaterdebiet over het waspakket                                | `dcterms:type`: `concept:type/s1`, `concept:type/s2`                             |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s1`, `concept:type/s2`                    |
| ➖  | `concept:eigenschap/waswaterdebietbevloeiing`       | Waswaterdebiet van de bevloeiing van het vulmateriaal            | `dcterms:type`: `concept:type/s3`                                                |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`                                       |
| ➖  | `concept:eigenschap/waswaterdebietvoorbevochtiging` | Waswaterdebiet van de voorbevochtiging van de ingaande stallucht | `dcterms:type`: `concept:type/s3`                                                |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s3`                                       |
| ➖  | `concept:eigenschap/zuurtegraadwaswater`            | Zuurtegraad van het waswater                                     | `dcterms:type`: `concept:type/s1`, `concept:type/s2`                             |
| ➕  |                                                     |                                                                  | `lzs-vocab:relevantLZS`: `concept:type/s1`, `concept:type/s2`                    |

### conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm_bandbreedte`)

|     | Concept                       | Label                                                                      | Wijziging                                  |
| --- | ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| ➖  | `concept:norm_bandbreedte/1`  | Zuurtegraad waswater \< 6 (S1 systeem)                                     | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/2`  | Zuurtegraad waswater \> 8,5 (S1 systeem)                                   | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/3`  | Geleidbaarheid waswater \> maximale waarde (S1 systeem)                    | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/4`  | Waswaterdebiet afwijking naar beneden \> 20% (S1 systeem)                  | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/5`  | Spuiwaterdebiet afwijking naar beneden \> 10% (S1 systeem)                 | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/6`  | Drukval afwijking naar beneden \> 40% (S1 systeem)                         | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/7`  | Drukval afwijking naar boven \> 40% (S1 systeem)                           | `dcterms:type`: `concept:type/s1`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:norm_bandbreedte/8`  | Zuurtegraad waswater afwijking naar boven \> 1 pH-eenheid (S2 systeem)     | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/9`  | Geleidbaarheid waswater \> maximale waarde (S2 systeem)                    | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/10` | Waswaterdebiet afwijking naar beneden \> 20% (S2 systeem)                  | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/11` | Spuiwaterdebiet afwijking naar beneden \> 10% (S2 systeem)                 | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/12` | Drukval afwijking naar beneden \> 40% (S2 systeem)                         | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/13` | Drukval afwijking naar boven \> 40% (S2 systeem)                           | `dcterms:type`: `concept:type/s2`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:norm_bandbreedte/14` | Waswaterdebiet voorbevochtiging afwijking naar beneden \> 20% (S3 systeem) | `dcterms:type`: `concept:type/s3`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:norm_bandbreedte/15` | Waswaterdebiet bevloeiing afwijking naar beneden \> 20% (S3 systeem)       | `dcterms:type`: `concept:type/s3`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:norm_bandbreedte/16` | Drukval afwijking naar boven \> 50 Pa (S3 systeem)                         | `dcterms:type`: `concept:type/s3`          |
| ➕  |                               |                                                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:lzs-param-norm`)

|     | Concept                     | Label                                      | Wijziging                                  |
| --- | --------------------------- | ------------------------------------------ | ------------------------------------------ |
| ➖  | `concept:parameter_norm/1`  | Zuurtegraad waswater S1 systeem            | `dcterms:type`: `concept:type/s1`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:parameter_norm/2`  | Geleidbaarheid waswater S1 systeem         | `dcterms:type`: `concept:type/s1`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:parameter_norm/3`  | Waswaterdebiet S1 systeem                  | `dcterms:type`: `concept:type/s1`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:parameter_norm/4`  | Spuiwaterdebiet S1 systeem                 | `dcterms:type`: `concept:type/s1`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:parameter_norm/5`  | Drukval S1 systeem                         | `dcterms:type`: `concept:type/s1`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s1` |
| ➖  | `concept:parameter_norm/6`  | Zuurtegraad waswater S2 systeem            | `dcterms:type`: `concept:type/s2`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:parameter_norm/7`  | Geleidbaarheid waswater S2 systeem         | `dcterms:type`: `concept:type/s2`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:parameter_norm/8`  | Waswaterdebiet S2 systeem                  | `dcterms:type`: `concept:type/s2`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:parameter_norm/9`  | Spuiwaterdebiet S2 systeem                 | `dcterms:type`: `concept:type/s2`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:parameter_norm/10` | Drukval S2 systeem                         | `dcterms:type`: `concept:type/s2`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s2` |
| ➖  | `concept:parameter_norm/11` | Waswaterdebiet voorbevochtiging S3 systeem | `dcterms:type`: `concept:type/s3`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:parameter_norm/12` | Waswaterdebiet bevloeiing S3 systeem       | `dcterms:type`: `concept:type/s3`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:parameter_norm/13` | Biobedspuiwaterproductie S3 systeem        | `dcterms:type`: `concept:type/s3`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:parameter_norm/14` | Biobedspoelwaterproductie S3 systeem       | `dcterms:type`: `concept:type/s3`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |
| ➖  | `concept:parameter_norm/15` | Drukval S3 systeem                         | `dcterms:type`: `concept:type/s3`          |
| ➕  |                             |                                            | `lzs-vocab:relevantLZS`: `concept:type/s3` |

## [0.1.0] - 2025-08-21

Geen inhoudelijke wijzigingen aan de codelijst.

## [0.0.8] - 2025-08-21

Geen inhoudelijke wijzigingen aan de codelijst.

## [0.0.7] - 2025-08-20

Geen inhoudelijke wijzigingen aan de codelijst.

## [0.0.6] - 2025-08-20

🆕 5 nieuw · ✏️ 42 gewijzigd · 🗑️ 5 verwijderd

### conceptschema luchtzuiveringssysteem (`conceptscheme:lzs`)

|     | Concept                               | Label                      | Wijziging          |
| --- | ------------------------------------- | -------------------------- | ------------------ |
| 🆕  | `concept:type/luchtwassysteem`        | Luchtwassysteem            | nieuw concept      |
| 🆕  | `concept:type/luchtzuiveringssysteem` | Luchtzuiveringssysteem     | nieuw concept      |
| 🆕  | `concept:type/s1`                     | Biologisch luchtwassysteem | nieuw concept      |
| 🆕  | `concept:type/s2`                     | Chemisch luchtwassysteem   | nieuw concept      |
| 🆕  | `concept:type/s3`                     | Biobed                     | nieuw concept      |
| 🗑️  | `concept:luchtwassysteem`             | Luchtwassysteem            | concept verwijderd |
| 🗑️  | `concept:luchtzuiveringssysteem`      | Luchtzuiveringssysteem     | concept verwijderd |
| 🗑️  | `concept:s1`                          | Biologisch luchtwassysteem | concept verwijderd |
| 🗑️  | `concept:s2`                          | Chemisch luchtwassysteem   | concept verwijderd |
| 🗑️  | `concept:s3`                          | Biobed                     | concept verwijderd |

### conceptschema luchtzuiveringssysteem eigenschap (`conceptscheme:lzsp`)

|     | Concept                                             | Label                                                            | Wijziging                                                                                                          |
| --- | --------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ✏️  | `concept:eigenschap/biobedspoelwaterproductie`      | Biobedspoelwaterproductie                                        | `dcterms:type`: `concept:s3` → `concept:type/s3`                                                                   |
| ✏️  | `concept:eigenschap/biobedspuiwaterproductie`       | Biobedspuiwaterproductie                                         | `dcterms:type`: `concept:s3` → `concept:type/s3`                                                                   |
| ✏️  | `concept:eigenschap/drukvaloverhetsysteem`          | Drukval over het systeem                                         | `dcterms:type`: `concept:s3`, `concept:s1`, `concept:s2` → `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ✏️  | `concept:eigenschap/geleidbaarheidvanhetwaswater`   | Geleidbaarheid van het waswater                                  | `dcterms:type`: `concept:s1`, `concept:s2` → `concept:type/s1`, `concept:type/s2`                                  |
| ✏️  | `concept:eigenschap/spuiwaterproductie`             | Spuiwaterproductie                                               | `dcterms:type`: `concept:s1`, `concept:s2` → `concept:type/s1`, `concept:type/s2`                                  |
| ✏️  | `concept:eigenschap/stalbezetting`                  | Stalbezetting                                                    | `dcterms:type`: `concept:s3`, `concept:s1`, `concept:s2` → `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ✏️  | `concept:eigenschap/systeemstatus`                  | SysteemStatus                                                    | `dcterms:type`: `concept:s3`, `concept:s1`, `concept:s2` → `concept:type/s3`, `concept:type/s1`, `concept:type/s2` |
| ✏️  | `concept:eigenschap/waswaterdebiet`                 | Waswaterdebiet over het waspakket                                | `dcterms:type`: `concept:s1`, `concept:s2` → `concept:type/s1`, `concept:type/s2`                                  |
| ✏️  | `concept:eigenschap/waswaterdebietbevloeiing`       | Waswaterdebiet van de bevloeiing van het vulmateriaal            | `dcterms:type`: `concept:s3` → `concept:type/s3`                                                                   |
| ✏️  | `concept:eigenschap/waswaterdebietvoorbevochtiging` | Waswaterdebiet van de voorbevochtiging van de ingaande stallucht | `dcterms:type`: `concept:s3` → `concept:type/s3`                                                                   |
| ✏️  | `concept:eigenschap/zuurtegraadwaswater`            | Zuurtegraad van het waswater                                     | `dcterms:type`: `concept:s1`, `concept:s2` → `concept:type/s1`, `concept:type/s2`                                  |

### conceptschema luchtzuiveringssysteem normbandbreedte (`conceptscheme:norm_bandbreedte`)

|     | Concept                       | Label                                                                      | Wijziging                                        |
| --- | ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| ✏️  | `concept:norm_bandbreedte/1`  | Zuurtegraad waswater \< 6 (S1 systeem)                                     | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/2`  | Zuurtegraad waswater \> 8,5 (S1 systeem)                                   | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/3`  | Geleidbaarheid waswater \> maximale waarde (S1 systeem)                    | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/4`  | Waswaterdebiet afwijking naar beneden \> 20% (S1 systeem)                  | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/5`  | Spuiwaterdebiet afwijking naar beneden \> 10% (S1 systeem)                 | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/6`  | Drukval afwijking naar beneden \> 40% (S1 systeem)                         | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/7`  | Drukval afwijking naar boven \> 40% (S1 systeem)                           | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:norm_bandbreedte/8`  | Zuurtegraad waswater afwijking naar boven \> 1 pH-eenheid (S2 systeem)     | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/9`  | Geleidbaarheid waswater \> maximale waarde (S2 systeem)                    | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/10` | Waswaterdebiet afwijking naar beneden \> 20% (S2 systeem)                  | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/11` | Spuiwaterdebiet afwijking naar beneden \> 10% (S2 systeem)                 | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/12` | Drukval afwijking naar beneden \> 40% (S2 systeem)                         | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/13` | Drukval afwijking naar boven \> 40% (S2 systeem)                           | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:norm_bandbreedte/14` | Waswaterdebiet voorbevochtiging afwijking naar beneden \> 20% (S3 systeem) | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:norm_bandbreedte/15` | Waswaterdebiet bevloeiing afwijking naar beneden \> 20% (S3 systeem)       | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:norm_bandbreedte/16` | Drukval afwijking naar boven \> 50 Pa (S3 systeem)                         | `dcterms:type`: `concept:s3` → `concept:type/s3` |

### conceptschema luchtzuiveringssysteem parameter specificatie (`conceptscheme:lzs-param-norm`)

|     | Concept                     | Label                                      | Wijziging                                        |
| --- | --------------------------- | ------------------------------------------ | ------------------------------------------------ |
| ✏️  | `concept:parameter_norm/1`  | Zuurtegraad waswater S1 systeem            | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:parameter_norm/2`  | Geleidbaarheid waswater S1 systeem         | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:parameter_norm/3`  | Waswaterdebiet S1 systeem                  | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:parameter_norm/4`  | Spuiwaterdebiet S1 systeem                 | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:parameter_norm/5`  | Drukval S1 systeem                         | `dcterms:type`: `concept:s1` → `concept:type/s1` |
| ✏️  | `concept:parameter_norm/6`  | Zuurtegraad waswater S2 systeem            | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:parameter_norm/7`  | Geleidbaarheid waswater S2 systeem         | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:parameter_norm/8`  | Waswaterdebiet S2 systeem                  | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:parameter_norm/9`  | Spuiwaterdebiet S2 systeem                 | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:parameter_norm/10` | Drukval S2 systeem                         | `dcterms:type`: `concept:s2` → `concept:type/s2` |
| ✏️  | `concept:parameter_norm/11` | Waswaterdebiet voorbevochtiging S3 systeem | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:parameter_norm/12` | Waswaterdebiet bevloeiing S3 systeem       | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:parameter_norm/13` | Biobedspuiwaterproductie S3 systeem        | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:parameter_norm/14` | Biobedspoelwaterproductie S3 systeem       | `dcterms:type`: `concept:s3` → `concept:type/s3` |
| ✏️  | `concept:parameter_norm/15` | Drukval S3 systeem                         | `dcterms:type`: `concept:s3` → `concept:type/s3` |

## [0.0.5] - 2025-08-18

Eerste release, met 57 concepten in 7 conceptschema's:

|     | Conceptschema                    | Label                                                       |
| --- | -------------------------------- | ----------------------------------------------------------- |
| 🆕  | `conceptscheme:lzs`              | conceptschema luchtzuiveringssysteem                        |
| 🆕  | `conceptscheme:lzs-param-norm`   | conceptschema luchtzuiveringssysteem parameter specificatie |
| 🆕  | `conceptscheme:lzsm`             | conceptschema luchtzuiveringssysteem medium                 |
| 🆕  | `conceptscheme:lzsp`             | conceptschema luchtzuiveringssysteem eigenschap             |
| 🆕  | `conceptscheme:lzss`             | conceptschema luchtzuiveringssysteem status                 |
| 🆕  | `conceptscheme:lzsst`            | conceptschema luchtzuiveringssysteem stalbezetting          |
| 🆕  | `conceptscheme:norm_bandbreedte` | conceptschema luchtzuiveringssysteem normbandbreedte        |
