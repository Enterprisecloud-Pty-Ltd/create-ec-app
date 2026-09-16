# Working on create-ec-app

This repository contains the CLI and layered templates, rather than one generated application. `templates/base` is shared across all targets and UI libraries; `templates/targets` and `templates/ui` supply overlays. `templates/pcf/base` is a separate Microsoft PCF toolchain. Generated apps receive a composed `AGENTS.md` from `templates/agents/shared.md` plus a host overlay in `templates/agents/hosts`.

## Tooling

Read [docs/tooling.md](docs/tooling.md) before changing dependencies, compilers, lint rules, build tooling, or editor configuration. Use the repository skill [update-templates](.agents/skills/update-templates/SKILL.md) for dependency refreshes and compatibility reviews, including reassessing the PCF TypeScript exception. Invoke it with `$update-templates`.

Maintain package manifests and lockfiles together. Refresh shadcn source and its dependency patch together through the pinned refresh script. Keep host authentication, PCF portal/CSS scoping, and each target's deployment output intact.

For shared tooling changes, run the checks described in the guide, including the generated matrix. Documentation-only changes need link, packaging, and scaffold checks where affected; do not repeat the full dependency/build matrix without a concrete reason.

Pushing a release-producing change to `main` can publish to npm through semantic-release. Publishing, merging to `main`, and production deployment require explicit authorization covering that action.

## Changelog

Add a dated entry for material tooling or agent-workflow changes. Record what changed and why, verification performed, and compatibility exceptions with source links and a concrete condition for revisiting them. Keep this useful for handover; omit routine formatting and repeated status updates. Entries describe repository changes, not a released npm version unless release is confirmed.

### 2026-09-05 — Tooling refresh and handover

- Refreshed dependencies and the shadcn 4.21.0 snapshot; adopted the TypeScript 7.0.2 compiler and Oxlint 1.81.0 with type-aware engine 7.0.2001.
- Generated apps use Microsoft's [TypeScript 6 API compatibility alias alongside TypeScript 7](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60) for the Query lint dependency chain. Recheck when those dependencies support the native API.
- Retained PCF TypeScript 5.9.3. Reconsider when released `pcf-scripts` and its resolved compiler loader support the candidate native compiler, then verify both generated wrappers. Track [ts-loader releases](https://github.com/TypeStrong/ts-loader/releases) and the [TypeScript 7 support discussion](https://github.com/TypeStrong/ts-loader/issues/1702); a closed issue alone is not a support guarantee.
- Added editor settings, release gates for Node 22/26, `docs/tooling.md`, app guides in generated `docs/` folders, and the repository `update-templates` skill.
- Node 26.8.1 validation passed 85 unit tests with 100% coverage, all eight app builds/lints, both PCF builds and CSS scoping, lint regression fixtures, and packed CLI scaffolding. Local dependency lifecycle scripts were disabled; license activation and live deployments remain unverified.
- Handover-file validation passed: skill frontmatter validation, repository links, npm package contents, scaffold smoke, and documentation references in all eight generated apps.

### 2026-09-14 — Generated AGENTS.md composition

- Scaffold now composes generated `AGENTS.md` from `templates/agents/shared.md` and `templates/agents/hosts/{target}.md` instead of copying `templates/targets/*/AGENTS.md`.
- Shared generated guidance includes Figma as the visual source of truth, host-chrome boundaries per target, and the TypeScript 7 / Oxlint tooling changelog inherited from the 2026-09-05 template baseline.

### 2026-09-15 — Design-system lint baseline

- Added [`@shadcn/lint`](https://github.com/shadcn-ui/lint) 0.1.0 to generated apps through the existing Oxlint JavaScript-plugin bridge and aligned `cn` from 0.2.5 to its required 0.2.6 grammar patch.
- Enabled `no-restyle` with layout classes allowed, `no-raw-colors`, `no-arbitrary-values`, and `require-static-classes`. Enabled `no-unknown-classes` as a warning so projects can establish external stylesheet exceptions before promoting it to an error. Left `no-inline-styles` disabled to preserve legitimate runtime styles.
- Extended the generated lint fixture to prove the policies reject broken UI code and accept variant, layout, and theme-token usage.
- Node 26.8.1 validation passed 97 unit tests with 100% coverage, scaffold and package-content checks, all eight generated app builds and lint runs, both PCF builds, CSS scoping, and the 13-failure/corrected lint fixture. Local dependency lifecycle scripts remained disabled, so Kendo license activation was not verified.

### 2026-09-16 - Generated agent guidance refinement

- Expanded shared component, service, state, and file-organization guidance from the edited webresource instructions. Kept Dataverse validation, critical-file boundaries, error handling, and the service example in the webresource overlay.
- Replaced blanket approval gates and claims that core files are always correct with scope-based edits and verification. Preserved Figma fidelity and design-system lint guidance; narrowed the example update payload to editable fields.

### 2026-09-16 - Generated Dataverse read-only skill

- Added the `dynamics-webapi` skill and its standard-library Python helper to generated web-resource projects. Codex discovers the canonical `.agents` copy; Claude Code receives a small `.claude` entry that points to the same instructions.
- Kept the skill read-only and target-specific. Updated the generated README and scaffold smoke checks to cover both web-resource UI variants and prove the other targets do not receive it.
- Both skill entrypoints passed the skill validator, the Python helper compiled and matched the personal source, all 97 repository tests passed with 100% coverage, scaffold smoke checks passed, and the npm dry-run package contained all three generated skill files.

### 2026-09-16 - Handover review: maintainership and automation

- Review of the 2026-09-14 to 2026-09-16 changes found no code defects; the gaps were operational. The npm package had a single owner, `main` was unprotected while auto-publishing, no tool proposed dependency updates, and scheduled build failures were silent.
- Added `.github/dependabot.yml` (weekly grouped minor/patch updates for the CLI, `templates/base`, and workflow actions; compiler and lint-engine pins excluded), `.github/CODEOWNERS`, and a job that opens or updates a `generated-build` issue when the Monday scheduled matrix fails.
- Aligned the release job to Node 22 (the tested floor) and set `package.json` to semantic-release's `0.0.0-development` convention; the released version comes from `npm view create-ec-app version`.
- Removed client and personal environment names from the generated `dynamics-webapi` skill and declared the repository copy canonical. Added a "Maintainership" section to `docs/tooling.md` covering npm owners, branch protection, commit conventions, the Dependabot flow, and quarterly manual checks.
- Still requires an account holder: add a second npm owner and enable branch protection on `main`. Verified with `npm run check` and `npm run smoke:scaffold`.

### 2026-09-16 - Scaffold output correctness fixes

- npm strips `.gitignore` files when packing, so template gitignores never reached generated apps and the fallback ignore lacked `token.json`, causing the initial `git commit` to track the bearer-token file. Templates now store `gitignore` and `applyLayer` renames it to `.gitignore`; the fallback mirrors the template, and generated PCF controls get a `.gitignore` for the first time.
- Generated apps no longer ship `templates/base/package-lock.json`: layer dependency merges made it stale, so `npm ci` failed in every generated app. The first `npm install` creates the real lockfile, matching the generated tooling guide.
- Generated `package.json` now uses `{{APP_NAME}}` for `name` instead of the literal `base`.
- Target∩UI overrides moved to `templates/combinations/<target>-<ui>` applied after both layers; the hardcoded Power Pages + Kendo `main.tsx` string is now `templates/combinations/power-pages-kendo/src/main.patch.tsx`.
- `portal` scaffolds with an explicit work-in-progress warning. PCF generation refuses to remove a non-empty output directory that lacks the generated-control marker unless `--force` is passed. `create-ec-app --version`/`-v` prints the CLI version; in PCF mode `--version` remains the control version.
- The npm package no longer ships `scripts/` or a nonexistent `bin/`. The scaffold smoke test now packs the tarball, installs it, and scaffolds through the installed CLI, asserting `.gitignore` contents, lockfile absence, and the package name — closing the gap that let publish-time stripping go unnoticed.
- Verified with `npm run check` (104 tests, 100% coverage), `npm run smoke:scaffold` through the packed tarball, and `npm run build:generated` (all eight generated apps and both PCF wrappers).

### 2026-09-16 - Review follow-up: PCF output safety and input validation

- PCF `--output` may no longer be the webresource root or a directory containing it; with `--force` an ancestor path would have deleted the entire parent tree, including the project itself. Output removability and option validation now run before the project is mutated (`src/runtime/*`, portal rewrites).
- PCF constructor, namespace, version, package name, display name, and description are validated before generation: constructor/namespace as identifiers, version as semver, package name as an npm name, and display name/description free of characters that corrupt the generated manifest, resx, or package.json (`<`, `>`, `&`, `"`, backslashes, control characters).
- `--pcf-dir` without a value now fails with a clear error instead of silently dropping into the scaffold prompts. Registry item fetches preserve the registry URL's query and hash (matching the `{name}.json` template written to components.json), use a 30-second timeout, and tolerate a `components.json` without a `registries` map or a missing `package.json`.
- Project names must start with a letter or number, matching npm package-name rules.
- `refresh-shadcn-template.ts` fallback `cn` version aligned to 0.2.6 with the 2026-09-15 grammar patch. Dev scripts spawn `npm.cmd` on Windows, and the smoke test's expected-failure check no longer masks spawn errors.
- Verified with `npm run check` (108 tests, 100% coverage) and `npm run smoke:scaffold` through the packed tarball.

### 2026-09-16 - Review fixes: PCF paths, names, and Windows checks

- PCF output protection now resolves symlinks and Windows junctions before checking whether an existing output directory contains the source. The containment check also handles source folder names beginning with `..`; rejection happens before source or output mutation.
- Inferred constructors for numeric project names receive an `App` prefix. Constructor and namespace validation now matches the identifier rules in the pinned [`pcf-scripts` 1.51.1 manifest schema](https://www.npmjs.com/package/pcf-scripts/v/1.51.1). Versions must satisfy both npm semver and PCF's numeric version schema. Recheck these restrictions when the pinned PCF toolchain changes.
- Smoke and generated-build scripts invoke npm's JavaScript entrypoint with the current Node executable. Run them through `npm run`; this avoids the [Windows restriction on executing `.cmd` files without a command interpreter](https://nodejs.org/api/child_process.html#spawning-bat-and-cmd-files-on-windows). Regression tests exercise an npm entrypoint path containing spaces and shell characters.
- The generated matrix now builds both PCF wrappers from numeric webresource project names using inferred constructors and a dotted namespace. On Node 26.8.1, `npm run check` passed 122 tests with 100% coverage, the packed-package scaffold check passed, and all eight generated app builds/lints, both PCF builds, CSS isolation checks, and lint regression fixtures passed. Dependency lifecycle scripts were disabled for the matrix; native Windows execution, Node 22, Kendo license activation, and live deployments were not checked locally.

### 2026-09-16 - Final compatibility and host handover

- Refreshed compatible CLI and generated-app dependencies, including Oxlint 1.83.0 and the paired Vitest 5.0.1 packages. Updated the GitHub Actions majors after their Node 22/26 matrices passed. Clack 1.8 prompt cancellation now narrows its symbol result before application values are used.
- Retained TypeScript 7.0.2 with type-aware engine 7.0.2001. Corrected the compatibility alias to the released `@typescript/typescript6@6.0.2`; the previously recorded 6.0.3 alias target is unavailable from the registry. The Query lint dependency chain still requires the compatibility API.
- Kept PCF on TypeScript 5.9.3 because current [`pcf-scripts` 1.51.1](https://www.npmjs.com/package/pcf-scripts?activeTab=versions) declares support for TypeScript 4 and 5. Added explicit task failure detection after observing that the Microsoft tool could return success after webpack failed. Added Kendo popup scoping and shared authentication support to generated wrappers.
- Corrected Power Pages authentication/template boundaries and SWA deployment output. The generated matrix now checks the packed artifact, fresh install plus `npm ci`, zero-warning lint, post-conversion source builds, deployed SWA routing, PCF lint and CSS isolation, and a compiled corrected lint fixture.
- Root and base-template audits were clean after the supported lock refresh. Nine findings remain in the latest PCF tooling and four in SWA CLI 2.0.10; forced audit fixes propose unsupported downgrades. Recheck only when Microsoft publishes newer stable packages with corrected dependency trees.
- Final local gates passed on Node 26.8.1 and Node 22.14.0: 142 tests with 100% coverage, packed scaffold/package checks, all eight generated app builds and zero-warning lint runs, and both PCF builds/lints and CSS checks. Shadcn refresh, compiled theme checks, a local SWA routing smoke, and native-browser Power Pages token parsing passed. Native Windows execution and paid Kendo license validation remain unverified.
- Restored the [shadcn neutral theme](https://ui.shadcn.com/docs/theming) and preserved it during registry refresh. PCF CSS now unwraps cascade layers after selector scoping because Dynamics unlayered reset rules otherwise win over Tailwind utilities. Bound fields remain unchanged, and generated PCF bundles exclude webresource token authentication.
- Added a real combination-layer scaffold fixture after clean Linux CI exposed coverage that had depended on an empty local template directory. Coverage thresholds remain unchanged.
- Added [`docs/handover.md`](docs/handover.md) with compatibility sources, final gates, upstream recheck conditions, and the remaining npm-owner and branch-protection actions. Live test-environment details remain in a separate local deployment report and are not part of the public repository.

### 2026-09-16 - Agent usage and target documentation

- Added a non-interactive agent workflow and a target table. Clarified that `portal` currently applies only the shared base and selected UI, without SWA configuration or host agent guidance; `swa` is the implemented target for an SWA-hosted portal.
- Corrected PCF source/output terminology in the repository and generated webresource READMEs. Used runnable example names, documented source mutations, and clarified that wrapper regeneration examples must preserve custom output locations and control versions.
- Verified repository links, packed package contents, scaffold smoke checks, and a PCF documentation fixture with a custom output path and version. No runtime behavior changed, so the full dependency/build matrix was not repeated locally.

### 2026-09-16 - Portal broker architecture clarification

- Recorded the intended portal contract: SWA with Entra authentication, a linked Function App broker, and Dataverse application-user access. The portal reuses the SWA frontend but is a separate target because it adds backend authorization and configuration.
- Replaced the alias recommendation with the intended architecture and explicit completion criteria in `docs/portal.md`. Documented the trusted identity boundary and separated application-user authentication from end-user licensing entitlement.
- This records the intended design; the Function App broker remains unimplemented in the current generator.

### 2026-09-16 - Copilot PCF safety follow-up

- Rejected PCF outputs inside the source `src` or built `dist` trees, including aliases through symlinks or junctions, even when `--force` is supplied. Layer and template paths now fail when either side contains the other, preventing recursive self-copy.
- Added `@types/xrm` to the standalone PCF wrapper because its TypeScript configuration explicitly loads those ambient types and the source webresource is not required to provide them.
- Made the unreadable-directory regression POSIX-specific because Windows does not implement POSIX mode-bit denial. The cross-platform missing, non-directory, containment, and source-preservation tests remain active everywhere.
