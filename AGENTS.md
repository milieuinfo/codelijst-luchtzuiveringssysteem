# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.
Detailed background, in Flemish, lives in [`docs/`](docs/README.md). Read the relevant doc before
making a change; this file is the short version.

## What this project is

A **code list** (SKOS vocabulary) for air purification systems (*luchtzuiveringssystemen*) in livestock
stables, used by the ARMOS monitoring project. One hand-maintained CSV is turned into RDF and
several other serialisations, validated against a SHACL application profile, packaged as a Maven
`jar` and released to the Omgeving Artifactory.

The Node.js generation logic lives in the external package
[`@milieuinfo/maven-metadata-generator-npm`](https://github.com/milieuinfo/maven-metadata-generator-npm).
This repo only holds the sources, the configuration and thin scripts that call that package.

## Where to look

| You need to know… | Read |
| --- | --- |
| What a file is, who writes it, who reads it, whether it is committed / in the jar | [`docs/projectstructuur.md`](docs/projectstructuur.md) — the *Opzoektabel* at the top |
| How to change the code list (concepts, prefixes, concept schemes, columns, rules) | [`docs/codelijst-aanpassen.md`](docs/codelijst-aanpassen.md) — start with the table *Welke bestanden voor welke wijziging?* |
| What each Node.js script does, the JSON-LD frames, the SHACL step | [`docs/scripts.md`](docs/scripts.md) |
| Maven, the Jenkins pipeline, the "generated SKOS" check, releases | [`docs/build-en-release.md`](docs/build-en-release.md) |
| How the generator works internally | the package source, `node_modules/@milieuinfo/maven-metadata-generator-npm/src/` |

## Sources vs. generated files

Edit these (sources):

| Path | Purpose |
| --- | --- |
| `src/source/codelijst-source.csv` | The code list itself: concept schemes and concepts, one row each |
| `src/source/config.yml` | Paths, output formats, prefixes (the ones actually used), DCAT metadata texts |
| `src/source/context.json` | JSON-LD context: maps CSV column names to RDF predicates (read by the scripts) |
| `src/source/prefix.json` | Reference list of prefixes; **not** read by any script |
| `src/source/toegestane-verwijderingen.txt` | Allowlist of intentional removals vs. the previous release, read by `validate_release` |
| `src/n3/luchtzuivering-rules.n3` | Project-specific N3 inference rules |
| `src/utils/variables.js` | Wires config into the generator; holds the JSON-LD frames |
| `src/utils/git.js` | Small git library: one function per git command (`show`, `tag`, `commit`, ...), same arguments as the CLI, returns stdout. Never call git directly from a script |
| `src/utils/git-utils.js` | Logic built on `git.js` (latest release tag, file contents at a tag) |
| `src/utils/console.js` | Generic console helpers: `style` (colours, bold, chainable), `symbol` (✔ ✖ ⚠ ℹ →), `print` (title, success, warning, error, ...). Honours `NO_COLOR` / `FORCE_COLOR`. Use it for script output |
| `src/main/resources/be/vlaanderen/omgeving/data/id/ontology/**` | Small `lzs-vocab:` vocabulary and the SHACL shapes (AP constraints) |
| `src/main/resources/be/vlaanderen/omgeving/lzs/data/id/graph/*.json` | Published copies of context/prefixes for consumers; maintained by hand, not read by any script |

Note that `src/main/resources/` mixes sources and generated output. Only `data/id/conceptscheme/` is generated.

**Never edit by hand** (generated, but committed):

```
src/main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/luchtzuiveringssysteem/
  luchtzuiveringssysteem.{ttl,nt,jsonld,json,csv,parquet}
```

Generated and **not** committed: `temp/` (DCAT dataset/catalog metadata and the ODCS data contract),
`validation/` (SHACL report, only written on failure and not cleaned up on success),
`target/` (Maven output, local Node install), `node_modules/`.

## Commands

Run from the repository root. pnpm is the package manager (`packageManager` in `package.json`),
so do not use `npm install`.

```bash
pnpm install --frozen-lockfile
pnpm run create_skos        # CSV -> SKOS files in src/main/resources/.../conceptscheme/
pnpm run create_metadata    # DCAT + ODCS into temp/ (needs network access to repo.omgeving.vlaanderen.be)
pnpm run validate_release   # SHACL + fail on information removed vs. the previous release tag (needs git tags)
mvn verify                  # full build: installs Node/pnpm in target/, runs both scripts, builds the jar
```

The scripts `cd src` first. All paths in `config.yml` are relative to `src/`.

## Changing the code list

Full guide with examples: [`docs/codelijst-aanpassen.md`](docs/codelijst-aanpassen.md). Quick map:

| Change | Files to touch |
| --- | --- |
| Add / edit a concept (label, definition, notation, relations) | `src/source/codelijst-source.csv` only |
| Remove a concept or value, or change an `_id` | CSV + an entry in `src/source/toegestane-verwijderingen.txt`. This is a breaking change for consumers, so flag it to the user |
| Concept in a new namespace | CSV + `prefixes:` in `config.yml` + both `prefix.json` files |
| New concept scheme | CSV (a `skos:ConceptScheme` row + its concepts) + a prefix in `config.yml` |
| New column / property | CSV header (append at the end) + `src/source/context.json` + **both** frames in `src/utils/variables.js` (if IRI-valued) + `lzs-vocab:` term in the ontology `.ttl` (if new) + optionally SHACL shapes and the published `context.json` |
| Derive a relation automatically | `src/n3/luchtzuivering-rules.n3` (new rule files must be listed under `skos.rules` in `config.yml`) |
| Validation rules | `…/ontology/luchtzuiveringssysteem-ap-constraints/luchtzuiveringssysteem-ap-constraints.ttl` |
| Dataset / distribution titles and descriptions | `metadata:` block in `config.yml` |

Workflow for every code list change:

1. Before editing, run `pnpm run create_skos` once. If `src/main/resources/` then shows changes,
   the local setup is off (usually a stale `node_modules`). Fix that first.
2. Make the source change.
3. Run `pnpm run create_skos`. If SHACL validation fails, nothing is written. Read
   `validation/validation_result.json`, then fix the data, not the shapes (unless changing the shapes is the intent).
4. Review the effect with `git diff -- '*.nt'`. It is sorted, one triple per line.
   Run `pnpm run validate_release`: it fails when anything from the previous release tag went missing.
   Only allowlist a removal when the user intends it.
5. Commit the source change **and** all regenerated files together.

## Rules

1. **Regenerate and commit together.** Jenkins regenerates the SKOS files and fails the build when
   `git status -- src/main/resources` is not clean.
2. **Nothing may disappear silently.** Jenkins runs `03_validate_against_previous_release.js` and fails when concepts
   or values from the previous release tag are missing and not listed in `toegestane-verwijderingen.txt`.
3. **SHACL must pass.** Do not loosen the shapes to make data pass unless that is the actual intent.
4. **CSV conventions.**
   - The first column `_id` holds the IRI, usually as a CURIE (`lzs-param:...`). Every prefix used
     must exist under `prefixes:` in `config.yml`.
   - Separate multiple values in one cell with `|` (for example `lzs-type:s1|lzs-type:s2`).
   - Leave unused cells empty. Empty cells and empty rows are ignored.
   - Keep the existing column order. Append new columns at the end.
   - Keep the file UTF-8, comma-separated, LF. Do not let a spreadsheet tool add quoting or columns.
5. **Do not fill in what the rules derive.** `narrower`, `hasTopConcept`, the `*Transitive` variants,
   `semanticRelation` and `relevantProperty` (from a parameter's `relevantLZS`) are inferred. Only
   fill in the forward relation.
6. **Versions are managed by the release process.** Do not change `<version>` in `pom.xml` or
   create commits starting with `[Maven skip ci]`; Jenkins and the maven-release-plugin do that.
7. **No secrets in git.** `src/.env` and `src/utils/setenv*.js` hold credentials and are git-ignored.
   Never commit, print, copy or document their contents. Do not run the `99_*` deploy scripts:
   they overwrite graphs on shared triple stores.
8. **Formatting** follows [`.editorconfig`](.editorconfig): UTF-8, LF, final newline, 4-space indent
   (2 for JSON/YAML/XML). Do not reformat files you are not otherwise changing, and never reformat
   generated files.

## Conventions

- Commit messages are in Flemish, brief and to the point: one line, prefixed with a ticket id
  when there is one (`ARMOS-131 Nieuwe systeemstatus`). Never add `Co-authored-by` or any other
  attribution trailer, not in commits and not in PR descriptions.
- Documentation in `docs/` is in Flemish, with technical terms kept in English. This file stays in English.
- When a change alters how the project works (new file, new script, new step), update the matching doc in `docs/` as well.

### Language per kind of text

"Flemish" means Dutch as it is written in Flanders (Belgian Dutch): standard Dutch spelling, with Flemish
word choice and phrasing (e.g. *afnemers*, *t.o.v.*, *vermelden*), not usage from the Netherlands.

| Text | Language |
| --- | --- |
| Commit messages, PR descriptions | Flemish |
| `docs/`, the comment header of `src/source/toegestane-verwijderingen.txt` | Flemish |
| Code comments in project scripts and repo-specific utils (`01_…`, `03_…`, `variables.js`, `git-utils.js`) | Flemish |
| Generic, repo-independent utils (`src/utils/git.js`, `src/utils/console.js`) | English: names, comments and JSDoc, so they can be reused elsewhere |
| Console output of the Node.js scripts (messages, errors) | English. The scripts' own output must match the generator, which logs in English (`skos generation: csv to jsonld`, `Validation succeeded.`) |
| `echo` messages in `Jenkinsfile.groovy` | Flemish, like the existing ones |
| This file | English |

### File names

- Scripts in `src/` are `NN_english_snake_case.js`. The number gives the order: `01`/`02` are build steps,
  `03` is a check Jenkins runs afterwards, `99` is a manual step.
- Utils in `src/utils/` have short, lowercase English names (`git.js`, `git-utils.js`, `console.js`).
- Data files in `src/source/` keep their Flemish names (`codelijst-source.csv`, `toegestane-verwijderingen.txt`).

### JavaScript

- ES modules (`"type": "module"`). Start a new file with `'use strict';`, like `01_…` and `variables.js`.
- 4-space indent, single quotes, semicolons, camelCase for new names. Existing code mixes camelCase and
  snake_case (`skosOptions`, `frame_skos_prefixes`); do not rename it.
- New code is asynchronous with Promise chains (`Promise.resolve().then(...).then(...)`), not top-level
  `await`. `02_metadata.js` and `utils/variables.js` still use top-level `await`; leave them unless asked.
- New modules export inline (`export const`, `export function`). `variables.js` uses an export list; leave it.
- Only import packages listed in `package.json`. pnpm is strict, so a dependency of the generator (for example
  `rdf-validate-shacl`) is not importable. Importing a file from the generator's `src/` is fine; `variables.js`
  already does it, and `03_…` uses its `src/utils/shacl_validation.js`.
- Set `process.exitCode = 1` on failure instead of calling `process.exit()`, so pending output is flushed.

### Utils

- **Git:** never call git directly from a script. `src/utils/git.js` has one function per git command
  (`show`, `tag`, `mergeBase`, `commit`, ...), taking the same arguments as the CLI with an optional options
  object last (`{ cwd }`), and returns a Promise with stdout. Add missing commands there with
  `command('name')`. Logic that combines commands or parses their output goes in `src/utils/git-utils.js`.
- **Console output:** use `src/utils/console.js`. `print.success` / `print.error` / `print.warning` /
  `print.info` prefix ✔ / ✖ / ⚠ / ℹ; errors and warnings go to stderr. `style` gives chainable colours
  (`style.red.bold(...)`), `symbol` the symbols (`→`, `•`, ...).
- **Colours:** on only when stdout is a terminal. `NO_COLOR` turns them off (it wins), `FORCE_COLOR` turns
  them on. Jenkins writes to a log, not a terminal, so its output is plain text with the symbols. Do not set
  `FORCE_COLOR` in the Jenkinsfile unless the AnsiColor plugin is known to be installed.
- The generator prints its own lines (for example `Validation succeeded.` from its SHACL step). They cannot be
  changed from this repo.
