# Maintainer handover

This review prepared the generator, layered templates, and release checks for the next maintainer. It did not publish npm, merge to `main`, or deploy a release. Live host validation used an isolated local handover report outside this public repository; this file deliberately contains no environment names, URLs, record IDs, or credentials.

## Current change set

The generator now protects scaffold and PCF output boundaries before mutation. Packed-package smoke tests prove npm's published artifact contains the required templates and renamed `.gitignore` files. PCF regeneration requires the generator-owned marker, resolves symlinks and junctions before containment checks, and validates names, versions, output paths, XML-facing text, and npm-facing values before changing source or output.

Generated Web Resource PCF wrappers now include dedicated agent guidance, explicit build and lint failure detection, exclusion of webresource token authentication, Kendo popup scoping, unchanged bound fields, and source-app rebuild checks after conversion. The matrix uses numeric project names, inferred constructors, dotted namespaces, and both UI libraries. It compiles the corrected lint fixture and requires zero lint warnings.

Shadcn ships its neutral theme variables and Tailwind mappings. PCF CSS retains selector isolation and removes cascade layers so unlayered Dynamics resets cannot override application utilities. The refresh script seeds the theme before registry generation and preserves registry CSS additions.

Power Pages now uses the supported shell authentication boundary and tracks only the required target files. Static Web Apps keeps its routing configuration in `public/`, copies it into `dist`, and tests the deployed file. Generated `.gitignore` files allow public deployment assets while excluding local tokens and build output.

The dependency refresh moved Oxlint to 1.83.0 and Vitest plus coverage to 5.0.1, refreshed compatible application dependencies, and updated the GitHub Actions majors. Clack 1.8 cancellation values are narrowed before use. Generated apps compile with TypeScript 7.0.2 and retain the released `@typescript/typescript6@6.0.2` API compatibility alias. The previously recorded 6.0.3 alias target is unavailable from the registry and was masked by the old lockfile.

## Compatibility decisions

- TypeScript 7.0.2 remains the application compiler. The Query lint chain still resolves `@typescript-eslint` packages whose supported compiler API range stops before native TypeScript 7, so keep the TypeScript 6 compatibility alias. Follow Microsoft's [side-by-side compiler guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60) and remove the alias only after the installed dependency tree supports the native API.
- `oxlint-tsgolint` 7.0.2001 remains the matching type-aware engine for TypeScript 7.0.2. Oxlint 1.83.0 accepts that engine. Keep the React Hooks, Fast Refresh, React Compiler, Query, and shadcn rule fixtures when updating it. Review [Oxlint releases](https://github.com/oxc-project/oxc/releases) and its [type-aware linting guidance](https://oxc.rs/docs/guide/usage/linter/type-aware.html).
- Vitest 5 requires Node 22.12 or later and Vite 6.4 or later. The repository floor is Node 22.14 and generated apps use Vite 8, so the paired Vitest and coverage upgrade is supported. See the [Vitest 5 migration guide](https://vitest.dev/guide/migration/).
- shadcn 4.21.0 and `@shadcn/react` 0.3.1 were still current during the review. No source snapshot refresh was needed. Refresh source, dependency patch, documentation, and tests together when the [shadcn changelog](https://ui.shadcn.com/docs/changelog) identifies a later compatible release.
- `pcf-scripts` and `pcf-start` 1.51.1 remain the latest released Microsoft packages. `pcf-scripts` still declares TypeScript 4 or 5 and ships `ts-loader` 9, so PCF remains on TypeScript 5.9.3. Reconsider only after a released Microsoft package declares support for the candidate compiler and both generated wrappers pass build, lint, CSS scoping, and runtime checks. See the [`pcf-scripts` release history](https://www.npmjs.com/package/pcf-scripts?activeTab=versions) and Microsoft's [PCF packaging guidance](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/import-custom-controls).

## Verification state

The final local gates passed on Node 26.8.1 and the advertised minimum Node 22.14.0:

- 148 unit tests with 100% statement, branch, function, and line coverage; CLI typecheck and lint.
- Packed-package scaffolding, all eight generated app builds and zero-warning lint runs, fresh installs followed by `npm ci`, and TypeScript dependency-tree checks.
- Both PCF builds and lint commands, source-app checks after conversion, scoped CSS with no cascade layers, and the failing/passing lint fixture including TypeScript compilation.
- Generated agent guidance, deployed SWA routing configuration, and compiled shadcn theme tokens for every supported host.
- npm dry-run package inspection: 170 files, including the new guidance and runtime helpers, with no `node_modules` directories.

The pinned shadcn refresh ran successfully and preserved the restored theme baseline. A local SWA emulator served a deep client route successfully. Browser checks verified Power Pages token parsing with native DOMParser. Native Windows execution and live SWA, Power Pages, and Code Apps deployments were not performed. Dynamics webresource and PCF deployment evidence is recorded in the separate private report.

Repeat these commands after material changes:

```bash
npm ci
npm run check
npm run smoke:scaffold
npm run build:generated
npm pack --dry-run --json
```

Set `CREATE_EC_APP_KEEP_GENERATED=1` when running the generated matrix to retain its output for inspection. With npm 11.19 or later, the matrix rejects unreviewed required keytar or Telerik lifecycle scripts. Optional native watcher scripts may still be blocked by npm's install-script policy; this does not prevent the verified builds and lints.

Kendo license activation remains a separate gate. The matrix approves the exact licensing script but does not prove an account has a valid Telerik license. Run one licensed Kendo install and build before a release that changes Kendo packages or license behavior.

## Upstream advisories

Root production dependencies and the base application template audit cleanly. The latest Microsoft PCF lock can resolve most older findings, but nine audit entries remain in released `pcf-scripts` and `pcf-start`: the `pcf-start` browser-sync chain accounts for four high findings, while the `pcf-scripts` Application Insights and OpenTelemetry chain accounts for five moderate findings. npm's proposed forced fix is an invalid downgrade to 1.19.4. Recheck when Microsoft publishes a version newer than 1.51.1 with refreshed telemetry and browser-sync dependencies; do not downgrade or add unproven overrides.

Static Web Apps CLI 2.0.10 remains the latest stable release and carries four transitive advisories through `adm-zip`, `devcert`, and `tmp`. npm proposes downgrading to SWA CLI 1.1.3. Keep 2.0.10 and recheck when Microsoft releases a newer stable CLI with a corrected tree. Node 26 also reports the documented `DEP0187` warning from the CLI while the emulator still starts and serves the generated routing configuration.

## Account-owner actions

These actions require repository or registry owners and cannot be completed in code:

1. Add a second active npm owner and align npm ownership with `.github/CODEOWNERS`.
2. Finish `main` branch protection. The API currently reports no required status checks and no required approving review. Require the exact Node 22 and Node 26 `build-test-smoke` and `generated-build` checks from a completed pull request, require reviewed pull requests, require code-owner review for the release surface, and keep force pushes disabled.
3. Review and merge the compatible GitHub Actions updates only after the final branch matrix is green.
4. Exercise one quarterly deployment for each supported host and record the result outside this public repository when it contains tenant or customer details.

The current npm release is independent of this working tree. Confirm it with `npm view create-ec-app version`; treat committed, pushed, merged, CI-passed, and published as separate states.
