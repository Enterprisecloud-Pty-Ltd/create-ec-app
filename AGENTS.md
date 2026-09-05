# Working on create-ec-app

This repository contains the CLI and layered templates, rather than one generated application. `templates/base` is shared across all targets and UI libraries; `templates/targets` and `templates/ui` supply overlays. `templates/pcf/base` is a separate Microsoft PCF toolchain. Target-specific `AGENTS.md` files are also copied into generated apps.

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
