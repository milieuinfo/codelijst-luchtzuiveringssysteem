# AGENTS.md

Guide for agents and humans. Root `README.md` = consumers only (contents, how to get it, versions), no maintenance info. Maintainer docs (Flemish): [`docs/`](docs/README.md); read the relevant one before a change.

## Project

SKOS code list of air purification systems (*luchtzuiveringssystemen*) in livestock stables, for ARMOS monitoring. One hand-maintained CSV -> RDF + other serialisations, validated against a SHACL application profile, packaged as Maven `jar`, released to the Omgeving Artifactory. Generation logic: [`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm); this repo = sources, config, thin scripts calling it.

## Where to look

| Question | Read |
| --- | --- |
| What a file is, who writes/reads it, committed? in jar? | `docs/projectstructuur.md` (*Opzoektabel*) |
| Changing the code list | `docs/codelijst-aanpassen.md` (*Welke bestanden voor welke wijziging?*) |
| Scripts, JSON-LD frames, SHACL step | `docs/scripts.md` |
| Maven, Jenkins, generated-SKOS check, tests, releases, changelog | `docs/build-en-release.md` |
| Generator internals | `node_modules/@milieuinfo/maven-metadata-generator-npm/src/` |

## Files

Sources (edit these):

| Path | Purpose |
| --- | --- |
| `src/source/codelijst-source.csv` | The code list: one row per concept scheme / concept |
| `src/source/config.yml` | Paths, output formats, prefixes (only used ones), DCAT metadata texts |
| `src/source/context.json` | JSON-LD context: CSV column -> RDF predicate (`"@type": "@id"` = IRI column) |
| `src/source/prefix.json` | Reference list of prefixes; read by no script |
| `src/source/toegestane-verwijderingen.txt` | Allowlist of intentional removals vs. previous release (`validate:release`) |
| `src/n3/luchtzuivering-rules.n3` | Project N3 inference rules |
| `src/utils/variables.js` | Wires config into the generator; JSON-LD frames |
| `src/utils/git.js`, `git-utils.js` | One function per git command / logic on it: release tags, tag date, file at a tag |
| `src/utils/releases.js` | Shared by `03_…`/`04_…`: `.nt` path, prefixes, `kort`, version from tag, triples of current files or a release |
| `src/utils/rdf.js` | Generic: `parseNTriples`, `toNT`, `tripleKey`, `shorten` (CURIE), `groupBy` |
| `src/utils/markdown.js` | Generic: `escapeMarkdown`, `table` (padded) |
| `src/utils/csv.js` | Generic: `parseCsv(text)` (csv-parser) |
| `src/utils/files.js` | Generic: `readTextIfExists(path, fallback)` (missing file -> fallback) |
| `src/utils/script.js` | Generic: `isMainModule(import.meta.url)`: run main only when started, not imported |
| `src/utils/console.js` | Generic console output (see Utils) |
| `src/main/resources/be/vlaanderen/omgeving/data/id/ontology/**` | `lzs-vocab:` vocabulary + SHACL shapes (AP constraints) |
| `src/main/resources/be/vlaanderen/omgeving/lzs/data/id/graph/*.json` | Published context/prefix copies for consumers; hand-maintained, read by no script |
| `eslint.config.js` | JS (recommended, `eslint-plugin-n`, convention rules, `eslint-config-prettier` last), Markdown (`@eslint/markdown`, GFM; not `CHANGELOG.md`, snapshots), `package.json` (`eslint-plugin-package-json`: valid fields, key order, sorted scripts, exact versions) |
| `.prettierrc.json`, `.prettierignore` | Prettier on JS + config files; not md, `src/source/`, `src/main/resources/`, snapshots |
| `vitest.config.js`, `test/` | See Tests |
| `pnpm-workspace.yaml` | pnpm settings (pnpm 11 ignores `pnpm` in `package.json`): `overrides` (`@rdfjs/types`), `saveExact`, `allowBuilds` (`classic-level: false`: ships prebuilds) |
| `Jenkinsfile.groovy` | Sonar settings as `-D` in `sonar.scanMaven` `extraArgs` (standalone `sonar-scanner`: `pom.xml`, `sonar-project.properties` unused): lcov path, `test/` as tests, coverage exclusions (`*.config.js`, `99_…`), ignore S7785 |

`src/main/resources/` mixes sources and output; only `data/id/conceptscheme/` is generated.

Generated + committed, never edit by hand: `src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/luchtzuiveringssysteem.{ttl,nt,jsonld,json,csv,parquet}`, `CHANGELOG.md` (`create_changelog[_full]`), `test/__snapshots__/` (`test -u`).

Generated, not committed: `temp/` (DCAT dataset/catalog, ODCS), `validation/` (SHACL report; only on failure, not removed on success), `coverage/`, `target/` (Maven output, local Node), `node_modules/`.

## Commands

From repo root, pnpm only (never `npm install`). Scripts `cd src`; `config.yml` paths are relative to `src/`.

```bash
pnpm install --frozen-lockfile
pnpm run create_skos            # CSV -> SKOS files (conceptscheme/), then create_changelog
pnpm run create_skos_only       # validate:csv, then SKOS only (what Maven runs: no tags needed, CHANGELOG.md untouched)
pnpm run validate:csv           # source CSV before generation: prefixes in config.yml, XSD lexical forms (0.8, not 0,8)
pnpm run create_metadata        # DCAT + ODCS into temp/ (network: repo.omgeving.vlaanderen.be)
pnpm run validate:release       # SHACL + fail on info removed vs. previous release tag (needs tags)
pnpm run validate:history       # same + report per release vs. predecessor (old removals: report only)
pnpm run create_changelog       # add/replace section 'Volgende versie' (vs. latest tag); --version/VERSION: that version
pnpm run create_changelog_full  # rebuild from all tags + current files as 'Volgende versie' or --version/VERSION (Jenkins at release)
pnpm run lint                   # ESLint: JS, Markdown, package.json (lint:fix)
pnpm run format                 # Prettier write (format:check)
pnpm run test                   # Vitest + coverage (coverage/lcov.info for Sonar)
pnpm run test -u                # update snapshots after an intended output change; review the diff
pnpm run check                  # lint + format:check + test (Jenkins stage Codekwaliteit)
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
| Derive a relation | `src/n3/luchtzuivering-rules.n3` (new rule files: under `skos.rules` in `config.yml`) |
| Validation rules | `…/ontology/luchtzuiveringssysteem-ap-constraints/luchtzuiveringssysteem-ap-constraints.ttl` |
| Dataset/distribution titles, descriptions | `metadata:` in `config.yml` |

Workflow:
1. `pnpm run create_skos` first: changes in `src/main/resources/` = broken local setup (usually stale `node_modules`); fix first.
2. Edit the source; `pnpm run create_skos`. SHACL failure writes nothing: read `validation/validation_result.json`, fix the data, not the shapes (unless intended).
3. Review `git diff -- '*.nt'` (sorted, one triple per line); `pnpm run validate:release`. Allowlist a removal only if the user intends it.
4. `pnpm run check`. Changed `config.yml`, columns or shapes -> `config.json`/`odcs.yaml` snapshots change: `pnpm run test -u`, review. Concept edits don't touch snapshots.
5. Commit source, regenerated files and `CHANGELOG.md` together.

## Rules

1. **Regenerate and commit together.** Jenkins regenerates SKOS and fails if `git status -- src/main/resources` is dirty.
2. **Nothing disappears silently.** Jenkins runs `03_…`; fails on concepts/values of the previous tag missing and not in `toegestane-verwijderingen.txt`.
3. **SHACL must pass.** Don't loosen shapes to make data pass unless intended.
4. **CSV:** `_id` (first column) = IRI, usually CURIE (`lzs-param:...`); every prefix in an IRI column must be in `prefixes:` of `config.yml` (tested). Multiple values: `|`. Unused cells empty (empty cells/rows ignored). Keep column order, append new columns. UTF-8, comma, LF; no spreadsheet-added quoting or columns.
5. **Don't fill in derived values:** `narrower`, `hasTopConcept`, `*Transitive`, `semanticRelation`, `relevantProperty` (from a parameter's `relevantLZS`) are inferred. Fill only the forward relation.
6. **Versions belong to the release process.** Don't change `<version>` in `pom.xml` or make `[Maven skip ci]` commits (Jenkins + maven-release-plugin).
7. **No secrets.** `src/.env`, `src/utils/setenv*.js` hold credentials (git-ignored): never commit, print, copy, read or document them. Never run `99_*` scripts (overwrite graphs on shared triple stores).
8. **Formatting** per `.editorconfig`: UTF-8, LF, final newline, 4-space indent (2 for JSON/YAML/XML). Don't reformat untouched files (incl. IDE reformats) or generated files. Tables in `README.md`/`docs/` padded.
9. **AGENTS.md stays token-optimized**, every change too: terse, no padding, no repetition.
10. **TDD.** Before a change or refactor: test the existing behaviour (passes), change, rerun: proves nothing that worked broke. New behaviour: failing test first.

## Conventions

- Commits: Flemish, one brief line, ticket prefix if any (`ARMOS-131 Nieuwe systeemstatus`). No `Co-authored-by`/attribution trailers in commits or PRs.
- Change in how the project works (new file, script, step) -> update the matching `docs/` page.

"Flemish" = Belgian Dutch: standard spelling, Flemish wording (*afnemers*, *t.o.v.*, *vermelden*), not Netherlands usage.

| Text | Language |
| --- | --- |
| Commits, PRs, `docs/` (technical terms English), `toegestane-verwijderingen.txt` header, `CHANGELOG.md`, Jenkinsfile `echo`, comments in scripts, repo-specific utils (`variables.js`, `git-utils.js`, `releases.js`) and tests | Flemish |
| Generic utils (`git.js`, `console.js`, `rdf.js`, `markdown.js`, `files.js`, `script.js`, `csv.js`): names, comments, JSDoc | English (reusable) |
| Script console output | English, like the generator (`Validation succeeded.`) |
| This file | English |

File names: scripts `src/NN_english_snake_case.js` (`00` check before build, `01`/`02` build, `03` check after, `04` release, `99` manual); utils short lowercase English in `src/utils/` (check there first: RDF -> `rdf.js`, releases -> `releases.js`; logic used by >1 script goes there, not copied); `src/source/` data keeps Flemish names.

JavaScript:
- ES modules; new files start with `'use strict';`. 4 spaces, single quotes, semicolons, printWidth 120, camelCase for new names; existing snake_case (`frame_skos_prefixes`) stays.
- `pnpm run format` + `pnpm run check` before committing; Jenkins fails otherwise. No inline rule disabling without reason.
- Promise chains, no top-level `await` (`02_metadata.js`, `variables.js` keep theirs unless asked). Sonar S7785 is ignored for this.
- New modules export inline; `variables.js` keeps its export list.
- File access in Promise chains: `node:fs/promises` (`readTextIfExists` for optional files, no `existsSync` + read). Sync only for values needed at module load (`variables.js`, `isMainModule`).
- On failure `process.exitCode = 1`, never `process.exit()` (`n/no-process-exit`).
- Import only packages in `package.json` (`n/no-extraneous-import`; pnpm strict: generator deps like `rdf-validate-shacl` aren't importable). Files from the generator's `src/` are fine (`shacl_validation.js`).

Dependencies:
- pnpm 11: `packageManager` in `package.json` + `<pnpmVersion>` in `pom.xml`, change both. `minimumReleaseAge` rejects packages < 1 day old: pick an older version, don't relax it. Install scripts need an `allowBuilds` decision, or `pnpm install` fails (also in Maven).
- Exact versions only (ESLint enforces; `overrides` in `pnpm-workspace.yaml`: check yourself). `@zazuko/env-node` = generator's pinned version (generator rejects other datasets; tested). `dotenv` = only for local `setenv.js`.
- After an update: `pnpm run check`, `create_skos_only` (no diff), `validate:release`. Failing snapshot = changed output: investigate, don't just `-u`.

Tests (Vitest, `test/`, run with `src/` as cwd via `test/setup.js`, `pool: 'forks'`; JUnit report `target/surefire-reports/TEST-vitest.xml`, published by the library's `maven.goal` -> Jenkins *Test Result*):
- Import `describe`/`it`/`expect` from `vitest`. New util logic gets a test (rule 10).
- Scripts with logic worth testing export it and run main only via `isMainModule(import.meta.url)` (`00_…`: `ongekendePrefixen`, `ongeldigeWaarden`, `valideerBron`; `03_…`: `vergelijk`, `leesRegel`, both main flows; `04_…`: `sectie`, both main flows). Main-flow tests mock `git-utils.js` (tags, files at a tag; Jenkins fetches tags after the tests) and `writeFile`; `fixtures.js`: `vorigeRelease`, `alsTekst`, `vangUitvoer`.
- `validatie`: `03_…` on the real list with deliberate changes (`fixtures.js`). `changelog`: `04_…` on a small fixed list (snapshots independent of data). `bron`: `00_…` on the source CSV and deliberate errors. Integration: config (snapshot), generated CSV datatypes, SHACL, byte-for-byte regeneration, ODCS (snapshot, version/time masked), env-node guard.

Utils:
- **Git:** never call git directly from a script (`child_process` banned outside `git.js`). `git.js`: one function per command, CLI args plus optional options object last (`{ cwd }`), returns Promise of stdout; add with `command('name')`. Parsing/combining -> `git-utils.js`.
- **Console:** use `console.js`. `print.success`/`error`/`warning`/`info` prefix ✔/✖/⚠/ℹ (errors, warnings to stderr); `print.detail` (stdout), `print.errorDetail` (stderr, below an error); `style` chainable (`style.red.bold(...)`); `symbol` (`→`, `•`).
- **Colours:** only on a TTY; `NO_COLOR` off (wins), `FORCE_COLOR` on. Jenkins logs plain text; no `FORCE_COLOR` in the Jenkinsfile unless AnsiColor is known installed.
- Generator lines (`Validation succeeded.`) can't be changed here.
