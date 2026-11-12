## [Volgende versie]

Nog niet gepubliceerd: wijzigingen t.o.v. release 1.0.0.

🆕 1 nieuw · ✏️ 4 gewijzigd · 🗑️ 1 verwijderd

### Conceptschema dataleverancier status (`conceptscheme:dataleverancierstatus`)

|     | Concept                           | Label           | Wijziging                                           |
| --- | --------------------------------- | --------------- | --------------------------------------------------- |
| 🆕  | `lzs-dl-status:gevalideerd-nieuw` | Nieuw concept   | nieuw concept                                       |
| ✏️  | `lzs-dl-status:gevalideerd`       | Gewijzigd label | `skos:prefLabel`: "Gevalideerd" → "Gewijzigd label" |

### Conceptschema luchtzuiveringssysteem (`conceptscheme:systeemtype`)

|     | Concept                    | Label                      | Wijziging                                  |
| --- | -------------------------- | -------------------------- | ------------------------------------------ |
| ➖  | `lzs-type:lelysphere`      | Lely Sphere                | `skos:broader`: `lzs-type:luchtwassysteem` |
| ➖  | `lzs-type:s1`              | Biologisch luchtwassysteem | `skos:broader`: `lzs-type:luchtwassysteem` |
| ➖  | `lzs-type:s2`              | Chemisch luchtwassysteem   | `skos:broader`: `lzs-type:luchtwassysteem` |
| 🗑️  | `lzs-type:luchtwassysteem` | Luchtwassysteem            | concept verwijderd                         |
