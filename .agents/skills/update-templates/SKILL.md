---
name: update-templates
description: Update create-ec-app's layered templates and developer tooling, or review upgrade readiness using current official documentation and released dependency metadata. Use for dependency, shadcn, TypeScript, Oxlint, Node, and PCF compatibility maintenance in this repository.
---

# Update templates

Work from the `create-ec-app` repository root. Read `AGENTS.md` and `docs/tooling.md`, then inspect the current manifests, lockfiles, relevant template layers, and CI. Treat versions and compatibility exceptions recorded in the guide as a dated baseline to reassess, not permanent pins or proof of current support. If the request is review-only, return findings without modifying dependencies.

## Establish what is supported now

Browse current official documentation, release notes, and maintainer guidance for the packages being considered. Inspect published metadata as well, for example:

```bash
npm view pcf-scripts@latest version engines dependencies peerDependencies --json
npm view pcf-start@latest version engines dependencies peerDependencies --json
npm view typescript dist-tags --json
npm view oxlint@latest version engines peerDependencies --json
npm view oxlint-tsgolint@latest version peerDependencies --json
```

Use `npm view <package>@<candidate>` for the exact version being evaluated. Inspect the resolved dependency tree after installation; broad peer ranges alone do not establish compiler API compatibility. Distinguish released stable support from previews, proposed PRs, closed issues, and roadmap dates. If current evidence cannot be retrieved or remains inconclusive, retain the working version, report the uncertainty, and continue independent supported updates.

Useful official starting points; follow newer releases from these pages rather than relying on their historical statements:

- PCF: [Microsoft guidance](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/code-components-best-practices), [pcf-scripts releases on npm](https://www.npmjs.com/package/pcf-scripts?activeTab=versions), and the published package's README/changelog and dependencies.
- Loader support: [ts-loader releases](https://github.com/TypeStrong/ts-loader/releases), [changelog](https://github.com/TypeStrong/ts-loader/blob/main/CHANGELOG.md), and [native TypeScript tracking](https://github.com/TypeStrong/ts-loader/issues/1702).
- TypeScript: [Microsoft release announcements](https://devblogs.microsoft.com/typescript/) and [side-by-side API compatibility guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60).
- Oxlint: [release notes](https://github.com/oxc-project/oxc/releases), [type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html), and [JavaScript plugin compatibility](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).
- React/Query lint dependencies: [React Hooks plugin documentation](https://react.dev/reference/eslint-plugin-react-hooks), [TanStack Query ESLint documentation](https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query), and [typescript-eslint supported versions](https://typescript-eslint.io/users/dependency-versions/).
- UI/runtime: [shadcn changelog](https://ui.shadcn.com/docs/changelog), [Vite migration guide](https://vite.dev/guide/migration), and [Node releases](https://nodejs.org/en/about/previous-releases). Consult the relevant Microsoft or Telerik documentation for target SDK/Kendo changes.

## Decide on compatibility exceptions

**PCF to TypeScript 7 (or a later native compiler):** Check the candidate stable `pcf-scripts` package's actual compiler integration, including its resolved webpack/ts-loader versions or any replacement loader. Confirm that the published loader supports the candidate compiler API and that Microsoft guidance does not exclude that combination. A TypeScript 7 release, a successful Vite app build, or a closed ts-loader issue is insufficient. Probe eligible versions in a disposable generated PCF project. Upgrade `templates/pcf/base` only when clean dependency resolution and both Kendo/shadcn PCF builds and CSS checks pass. Preserve the existing compiler when support is unresolved; record the specific upstream release/support condition to recheck. Do not label an experimental local build as Microsoft-supported.

**Native compiler and lint engine:** Select a supported TypeScript/`oxlint-tsgolint` pair using current release documentation. Preserve the official TypeScript 6 API alias only while a dependency actually needs it. Before removing it, inspect the Query plugin's transitive dependencies and other API consumers such as shadcn's configuration tooling, then verify a clean install, the selected compiler version, and the dependency tree. Do not use forced or legacy peer resolution to declare an upgrade compatible.

**Lint rules:** Keep React Hooks, Fast Refresh, React Compiler, and Query protections when updating or replacing their plugins. Check current native-rule parity and bridge support; verify behavior using `scripts/check-generated-lint.mjs`, including the corrected fixture. Do not drop failing rules simply to make an upgrade pass.

## Apply the supported changes

- Update the root CLI, `templates/base`, target/UI dependency patches, and `templates/pcf/base` according to their own compatibility constraints. Do not apply a blanket major-version bump across these different toolchains.
- `bash update-templates.sh` refreshes compatible minor ranges and template locks, preserves compiler/engine pins, and skips the shadcn snapshot. Review its diff; it does not decide major-version compatibility. Handle root dependencies and supported compiler changes explicitly. Keep template folders free of `node_modules`.
- For shadcn, inspect the current CLI docs, update the deliberate CLI pins in `scripts/refresh-shadcn-template.ts` and `src/shadcnRegistry.ts` together, and run `npm run refresh:shadcn-template`. Preserve EC's portal transforms and CSS scoping. Review source, `SHADCN_TEMPLATE.md`, dependency patch, and affected tests together.
- Keep manifests, lockfiles, compiler aliases, editor settings, and the CI Node matrix consistent. Preserve each host's auth and deployment output. An upgrade request does not authorize live deployment, npm publication, or merging to `main`.

## Verify and leave a handover record

For shared dependency/compiler/UI upgrades, run the repository's existing gates:

```bash
npm ci
npm run check
npm run smoke:scaffold
npm run build:generated
npm pack --dry-run --json
```

The generated matrix covers all eight target/UI combinations, both PCF wrappers outside the source app, CSS scoping, valid TypeScript dependency trees, and failing/passing lint examples. Use the requested Node version locally and keep CI coverage aligned with the advertised supported versions. Inspect package contents for the generated docs, editor settings, and lint config. Scope checks down for documentation-only work; extend testing only for a concrete remaining risk.

If local constraints require dependency lifecycle scripts to be disabled or prevent license/host checks, record that limitation instead of claiming a normal install or live deployment was verified. For PCF telemetry-free local checks, use Microsoft's `PP_TOOLS_TELEMETRY_OPTOUT=true` setting where appropriate.

Update `docs/tooling.md`, `templates/base/docs/tooling.md`, and affected `AGENTS.md` changelog entries when their guidance changes. Record the review date, old/new versions, source URLs supporting consequential compatibility decisions, checks actually run, and deferred upgrades with explicit recheck conditions. Summarize what the next developer can update now and what still depends on upstream support. Commit authorized changes on the working branch; distinguish committed, pushed, and released status in the handover.
