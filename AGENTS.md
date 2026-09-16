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
