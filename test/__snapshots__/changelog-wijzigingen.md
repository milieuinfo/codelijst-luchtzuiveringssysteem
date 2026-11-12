## [Volgende versie]

Nog niet gepubliceerd: wijzigingen t.o.v. release 1.0.0.

🆕 1 nieuw · ✏️ 3 gewijzigd · 🗑️ 1 verwijderd

### Properties

|     | Property            | Wijziging                                           |
| --- | ------------------- | --------------------------------------------------- |
| 🗑️  | `skos:broader`      | niet meer gebruikt (was: 2 waarden bij 2 concepten) |
| 🗑️  | `skos:topConceptOf` | niet meer gebruikt (was: 1 waarde bij 1 concept)    |

### Testschema (`conceptscheme:test`)

|     | Concept      | Label      | Wijziging                                    |
| --- | ------------ | ---------- | -------------------------------------------- |
| 🆕  | `lzs-type:e` | Systeem E  | nieuw concept                                |
| ➖  | `lzs-type:b` | Systeem B  | `skos:broader`: `lzs-type:a`                 |
| ➖  | `lzs-type:c` | Systeem C  | `skos:broader`: `lzs-type:a`                 |
| ✏️  | `lzs-type:d` | Systeem D2 | `skos:prefLabel`: "Systeem D" → "Systeem D2" |
| 🗑️  | `lzs-type:a` | Systeem A  | concept verwijderd                           |
