# AGENTS.md

Short guide for agents and humans. Root `README.md` is for consumers (contents, how to get it, versions): no maintenance instructions there. Maintainer background (Flemish) is in [`docs/`](docs/README.md); read the relevant doc before a change.

## Project

SKOS code list of air purification systems (*luchtzuiveringssystemen*) in livestock stables, for ARMOS monitoring. One hand-maintained CSV -> RDF + other serialisations, validated against a SHACL application profile, packaged as a Maven `jar`, released to the Omgeving Artifactory. Generation logic lives in [`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm); this repo holds sources, config and thin scripts calling it.

## Where to look

| Question | Read |
| --- | --- |
| What a file is, who writes/reads it, committed? in jar? | `docs/projectstructuur.md` (*Opzoektabel* at top) |
| Changing the code list | `docs/codelijst-aanpassen.md` (table *Welke bestanden voor welke wijziging?*) |
| Node.js scripts, JSON-LD frames, SHACL step | `docs/scripts.md` |
| Maven, Jenkins, generated-SKOS check, releases, changelog | `docs/build-en-release.md` |
| Generator internals | `node_modules/@milieuinfo/maven-metadata-generator-npm/src/` |

## Files

Sources (edit these):

| Path | Purpose |
| --- | --- |
| `src/source/codelijst-source.csv` | The code list: one row per concept scheme / concept |
| `src/source/config.yml` | Paths, output formats, prefixes (only used ones), DCAT metadata texts |
| `src/source/context.json` | JSON-LD context: CSV column -> RDF predicate (read by scripts) |
| `src/source/prefix.json` | Reference list of prefixes; read by no script |
| `src/source/toegestane-verwijderingen.txt` | Allowlist of intentional removals vs. previous release (read by `validate_release`) |
| `src/n3/luchtzuivering-rules.n3` | Project N3 inference rules |
| `src/utils/variables.js` | Wires config into the generator; JSON-LD frames |
| `src/utils/git.js` | One function per git command (see Utils) |
| `src/utils/git-utils.js` | Logic on `git.js`: release tags, tag date, file at a tag |
| `src/utils/releases.js` | Shared by `03_…`/`04_…`: `.nt` path, prefixes, `kort`, version from tag, triples of current files or a release |
| `src/utils/rdf.js` | Generic: `parseNTriples`, `toNT`, `tripleKey`, `shorten` (CURIE), `groupBy` |
| `src/utils/markdown.js` | Generic: `escapeMarkdown`, `table` (padded, aligned) |
| `src/utils/console.js` | Generic console output (see Utils) |
| `src/main/resources/be/vlaanderen/omgeving/data/id/ontology/**` | Small `lzs-vocab:` vocabulary + SHACL shapes (AP constraints) |
| `src/main/resources/be/vlaanderen/omgeving/lzs/data/id/graph/*.json` | Published context/prefix copies for consumers; hand-maintained, read by no script |

`src/main/resources/` mixes sources and output; only `data/id/conceptscheme/` is generated.

Generated + committed, never edit by hand:
- `src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/luchtzuiveringssysteem.{ttl,nt,jsonld,json,csv,parquet}`
- `CHANGELOG.md` (`create_changelog` / `create_changelog_full`)

Generated, not committed: `temp/` (DCAT dataset/catalog, ODCS data contract), `validation/` (SHACL report; written only on failure, not removed on success), `target/` (Maven output, local Node), `node_modules/`.

## Commands

From repo root. pnpm only (`packageManager` in `package.json`), never `npm install`. Scripts `cd src`; `config.yml` paths are relative to `src/`.

```bash
pnpm install --frozen-lockfile
pnpm run create_skos            # CSV -> SKOS files in src/main/resources/.../conceptscheme/, then create_changelog ('Volgende versie')
pnpm run create_skos_only       # CSV -> SKOS files only (what Maven runs: no tags needed, CHANGELOG.md untouched)
pnpm run create_metadata        # DCAT + ODCS into temp/ (network: repo.omgeving.vlaanderen.be)
pnpm run validate_release       # SHACL + fail on info removed vs. previous release tag (needs tags)
pnpm run validate_history       # same + report of every release vs. its predecessor (old removals: report only)
pnpm run create_changelog       # add/replace CHANGELOG.md section 'Volgende versie' (vs. latest tag); --version/VERSION: section for that version instead
pnpm run create_changelog_full  # rebuild CHANGELOG.md from all tags + current files as 'Volgende versie', or with --version/VERSION as that version (Jenkins at release: no 'Volgende versie')
mvn verify                      # full build: Node/pnpm in target/, both scripts, jar
```

## Changing the code list

Full guide: `docs/codelijst-aanpassen.md`.

| Change | Touch |
| --- | --- |
| Add/edit concept (label, definition, notation, relations) | CSV only |
| Remove concept/value, change an `_id` | CSV + entry in `toegestane-verwijderingen.txt`. Breaking for consumers: flag to user |
| Concept in new namespace | CSV + `prefixes:` in `config.yml` + both `prefix.json` files |
| New concept scheme | CSV (`skos:ConceptScheme` row + concepts) + prefix in `config.yml` |
| New column/property | CSV header (append) + `src/source/context.json` + **both** frames in `variables.js` (if IRI-valued) + `lzs-vocab:` term in ontology `.ttl` (if new) + optionally SHACL shapes and published `context.json` |
| Derive a relation | `src/n3/luchtzuivering-rules.n3` (new rule files: list under `skos.rules` in `config.yml`) |
| Validation rules | `…/ontology/luchtzuiveringssysteem-ap-constraints/luchtzuiveringssysteem-ap-constraints.ttl` |
| Dataset/distribution titles, descriptions | `metadata:` in `config.yml` |

Workflow:
1. Run `pnpm run create_skos` first. Changes in `src/main/resources/` = broken local setup (usually stale `node_modules`); fix first.
2. Edit the source.
3. `pnpm run create_skos`. On SHACL failure nothing is written: read `validation/validation_result.json`, fix the data, not the shapes (unless that is the intent).
4. Review `git diff -- '*.nt'` (sorted, one triple per line). Run `pnpm run validate_release` (fails if anything from the previous tag is missing). Allowlist a removal only if the user intends it.
5. Commit source **and** regenerated files (incl. `CHANGELOG.md`) together.

## Rules

1. **Regenerate and commit together.** Jenkins regenerates SKOS and fails if `git status -- src/main/resources` is dirty.
2. **Nothing disappears silently.** Jenkins runs `03_validate_against_previous_release.js`; fails on concepts/values of the previous tag missing and not in `toegestane-verwijderingen.txt`.
3. **SHACL must pass.** Don't loosen shapes to make data pass unless intended.
4. **CSV:** `_id` (first column) = IRI, usually CURIE (`lzs-param:...`); every prefix must be in `prefixes:` of `config.yml`. Multiple values: `|` (`lzs-type:s1|lzs-type:s2`). Unused cells empty (empty cells/rows ignored). Keep column order, append new columns. UTF-8, comma, LF; no spreadsheet-added quoting or columns.
5. **Don't fill in derived values:** `narrower`, `hasTopConcept`, `*Transitive`, `semanticRelation`, `relevantProperty` (from a parameter's `relevantLZS`) are inferred. Fill only the forward relation.
6. **Versions belong to the release process.** Don't change `<version>` in `pom.xml` or make `[Maven skip ci]` commits (Jenkins + maven-release-plugin).
7. **No secrets.** `src/.env`, `src/utils/setenv*.js` hold credentials (git-ignored): never commit, print, copy or document them. Never run `99_*` deploy scripts (overwrite graphs on shared triple stores).
8. **Formatting** per [`.editorconfig`](.editorconfig): UTF-8, LF, final newline, 4-space indent (2 for JSON/YAML/XML). Don't reformat untouched files; never reformat generated files. Markdown tables in `README.md` and `docs/` are padded (aligned columns); this file is not (token-optimized).

## Conventions

- Commits: Flemish, one brief line, ticket prefix when there is one (`ARMOS-131 Nieuwe systeemstatus`). Never `Co-authored-by` or other attribution trailers, in commits or PR descriptions.
- A change in how the project works (new file, script, step) -> update the matching `docs/` page.

Language. "Flemish" = Belgian Dutch: standard spelling, Flemish wording (*afnemers*, *t.o.v.*, *vermelden*), not Netherlands usage.

| Text | Language |
| --- | --- |
| Commits, PR descriptions, `docs/` (technical terms in English), header comment of `toegestane-verwijderingen.txt`, `CHANGELOG.md`, `echo` in `Jenkinsfile.groovy` | Flemish |
| Code comments in project scripts and repo-specific utils (`01_…`, `03_…`, `04_…`, `variables.js`, `git-utils.js`, `releases.js`) | Flemish |
| Generic utils (`git.js`, `console.js`, `rdf.js`, `markdown.js`): names, comments, JSDoc | English (reusable elsewhere) |
| Script console output | English, matching the generator (`skos generation: csv to jsonld`, `Validation succeeded.`) |
| This file | English |

File names:
- Scripts: `src/NN_english_snake_case.js`; `01`/`02` build, `03` check Jenkins runs after, `04` release step, `99` manual.
- Utils: short lowercase English in `src/utils/`. Check there before writing a helper (RDF/N-Triples -> `rdf.js`, reading releases -> `releases.js`); logic used by >1 script goes there, not copied.
- Data files in `src/source/` keep Flemish names.

JavaScript:
- ES modules (`"type": "module"`); new files start with `'use strict';` (like `01_…`, `variables.js`).
- 4 spaces, single quotes, semicolons, camelCase for new names. Existing code mixes camelCase and snake_case (`skosOptions`, `frame_skos_prefixes`): don't rename.
- New code: Promise chains (`Promise.resolve().then(...)`), no top-level `await` (`02_metadata.js`, `variables.js` keep theirs unless asked).
- New modules export inline (`export const`/`export function`); `variables.js` keeps its export list.
- Import only packages in `package.json` (pnpm strict: e.g. `rdf-validate-shacl` from the generator is not importable). Importing files from the generator's `src/` is fine (`variables.js` does; `03_…` uses `src/utils/shacl_validation.js`).
- On failure set `process.exitCode = 1`, never `process.exit()` (flushes output).

Utils:
- **Git:** never call git directly from a script. `git.js`: one function per command (`show`, `tag`, `mergeBase`, `commit`, ...), CLI arguments plus optional options object last (`{ cwd }`), returns Promise of stdout; add commands with `command('name')`. Combining/parsing logic -> `git-utils.js`.
- **Console:** use `console.js`. `print.success`/`error`/`warning`/`info` prefix ✔/✖/⚠/ℹ; errors and warnings to stderr. `style`: chainable colours (`style.red.bold(...)`); `symbol`: `→`, `•`, ...
- **Colours:** only when stdout is a TTY; `NO_COLOR` off (wins), `FORCE_COLOR` on. Jenkins logs are plain text with symbols; don't set `FORCE_COLOR` in the Jenkinsfile unless AnsiColor is known installed.
- Generator lines (e.g. `Validation succeeded.`) can't be changed from this repo.
