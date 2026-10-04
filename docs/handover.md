# Maintainer handover

The 2026-10-04 refresh updates the generator, layered templates, and release checks for the latest Node LTS and Current releases. The repository's `.mise.toml` selects Node 24.21.0 LTS; CI tracks `lts/*` and `node` with `check-latest: true`, plus `22.x` for the existing compatibility floor. The release job uses LTS. Live host evidence from the September handover remains in a separate private report.

## Current change set

The generator now protects scaffold and PCF output boundaries before mutation. Packed-package smoke tests prove npm's published artifact contains the required templates and renamed `.gitignore` files. PCF regeneration requires the generator-owned marker, resolves symlinks and junctions before containment checks, and validates names, versions, output paths, XML-facing text, and npm-facing values before changing source or output.

Generated Web Resource PCF wrappers now include dedicated agent guidance, explicit build and lint failure detection, exclusion of webresource token authentication, Kendo popup scoping, unchanged bound fields, and source-app rebuild checks after conversion. The matrix uses numeric project names, inferred constructors, dotted namespaces, and both UI libraries. It compiles the corrected lint fixture and requires zero lint warnings.

Shadcn ships its neutral theme variables and Tailwind mappings. PCF CSS retains selector isolation and removes cascade layers so unlayered Dynamics resets cannot override application utilities. The refresh script seeds the theme before registry generation and preserves registry CSS additions.

Power Pages now uses the supported shell authentication boundary and tracks only the required target files. Static Web Apps keeps its routing configuration in `public/`, copies it into `dist`, and tests the deployed file. Generated `.gitignore` files allow public deployment assets while excluding local tokens and build output.

The October dependency refresh moves Oxlint from 1.83.0 to 1.86.0 with its required `oxlint-tsgolint` 7.0.2003 engine. Both versions remain exact pins, protected from independent updates by Dependabot and the refresh script. Vitest and coverage move to 5.0.3, Query to 5.104.1, Vite to 8.3.2, Kendo to 16.1.0 with Fluent theme 14.6.0, and the Code Apps SDK to 1.5.0. CLI and template lockfiles also have refreshed compatible transitive dependencies.

Shadcn refresh now uses CLI 4.21.1 and preserves the reviewed `cn` 0.4.0 and Recharts 3.10.1 versions after registry generation. It launches npm's JavaScript entrypoint with the current Node executable, including on Windows. The source snapshot, neutral theme, and portal transforms remain intact. `@shadcn/lint` 0.2.0 reads the application's class grammar without fallback warnings, and the generated lint fixture rejects plugin warnings as well as checking rule diagnostics.

## Compatibility decisions

- TypeScript 7.0.2 remains the application compiler. The Query lint chain still resolves `@typescript-eslint` packages whose supported compiler API range stops before native TypeScript 7, so keep the TypeScript 6 compatibility alias. Follow Microsoft's [side-by-side compiler guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60) and remove the alias only after the installed dependency tree supports the native API.
- Oxlint 1.86.0 requires `oxlint-tsgolint >=7.0.2003`, so the previous 7.0.2001 pin cannot be retained with this upgrade. TypeScript 7.0.2 remains the latest stable compiler and the engine supports TypeScript 7. Keep the React Hooks, Fast Refresh, React Compiler, Query, and shadcn rule fixtures when updating the pair. Review the [Oxlint release](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.86.0), [engine release](https://github.com/oxc-project/tsgolint/releases/tag/v7.0.2003), and [type-aware linting guidance](https://oxc.rs/docs/guide/usage/linter/type-aware.html).
- Vitest 5 requires Node 22.12 or later and Vite 6.4 or later. The repository floor is Node 22.14 and generated apps use Vite 8, so the paired Vitest and coverage upgrade is supported. See the [Vitest 5 migration guide](https://vitest.dev/guide/migration/).
- Shadcn CLI 4.21.1, `@shadcn/react` 0.3.1, and `cn` 0.4.0 are current stable releases. The pinned refresh ran again and preserved the neutral theme and portal transforms. The [design-system linter](https://github.com/shadcn-ui/lint) requires `cn` 0.3.2 or later to read the application's grammar; 0.4.0 satisfies that condition. Refresh source and dependencies together when the [shadcn changelog](https://ui.shadcn.com/docs/changelog) identifies a later release.
- `pcf-scripts` and `pcf-start` 1.51.1 remain the latest released Microsoft packages. `pcf-scripts` still declares TypeScript 4 or 5. Its refreshed lock resolves `ts-loader` 9.6.2, whose compiler integration still uses the JavaScript API, so PCF remains on TypeScript 5.9.3. Reconsider only after a released Microsoft package and loader support the candidate compiler and both generated wrappers pass build, lint, CSS scoping, and runtime checks. See the [`pcf-scripts` release history](https://www.npmjs.com/package/pcf-scripts?activeTab=versions), [ts-loader changelog](https://github.com/TypeStrong/ts-loader/blob/main/CHANGELOG.md), and [TypeScript 7 support discussion](https://github.com/TypeStrong/ts-loader/issues/1702).
- KendoReact 16.1.0 updates the Buttons and Popup packages used by these templates. The listed [16.0 breaking changes](https://www.telerik.com/kendo-react-ui/components/updates/breaking-changes/16-0-0) concern other components. Keep both PCF popup context and CSS scoping checks when refreshing Kendo and its theme.

## Verification state

On 2026-10-04, the full local gates passed on Node 24.21.0 LTS, Node 26.10.0 Current, and the existing minimum Node 22.14.0. Each runtime passed:

- 149 unit tests with 100% statement, branch, function, and line coverage; CLI typecheck and lint.
- Packed-package scaffolding, all eight generated app builds and zero-warning lint runs, fresh installs followed by `npm ci`, and TypeScript dependency-tree checks.
- Both PCF builds and lint commands, source-app checks after conversion, scoped CSS with no cascade layers, and the failing/passing lint fixture including TypeScript compilation.
- Generated agent guidance, deployed SWA routing configuration, and compiled shadcn theme tokens for every supported host.
- npm dry-run package inspection: 170 files, including the new guidance and runtime helpers, with no `node_modules` directories.

The October pinned shadcn refresh preserved the theme baseline. September checks also exercised a local SWA deep route and Power Pages token parsing with native DOMParser; those host checks were not repeated during this dependency refresh. Native Windows execution and paid Kendo license validation remain unverified. Live Dynamics and PCF deployment evidence from September is recorded in the separate private report.

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

The 2026-10-04 audits found the following entries. Counts include packages affected through transitive chains, so they are not counts of distinct advisories.

| Dependency tree | Remaining entries | Upstream condition to revisit |
|---|---|---|
| CLI production dependencies | 0 | Reaudit after dependency changes. |
| Shared base and a generated Kendo webresource | 0 | Reaudit after dependency changes. |
| CLI including release tooling | 11: 10 high, 1 moderate | A released Semantic Release dependency chain that fixes `braces`, and an npm bundle that fixes its embedded `brace-expansion`, `http-cache-semantics`, `ip-address`, and `undici`. |
| Generated shadcn webresource | 7 high | A released shadcn CLI or compatible transitive update that removes the `braces` finding from its fast-glob/ts-morph chain. |
| PCF tooling | 10: 5 high, 5 moderate | Microsoft packages newer than 1.51.1 with corrected browser-sync/`braces` and Application Insights/OpenTelemetry trees. |
| Generated SWA with Kendo | 6: 5 high, 1 low | An SWA CLI newer than 2.0.10 with corrected `adm-zip`, devcert/`tmp`, and selfsigned/node-forge trees. |
| Generated SWA with shadcn | 13: 12 high, 1 low | Both the SWA and shadcn conditions above. |

Compatible audit fixes were applied. Current upstream packages still carry these findings; npm's forced fixes propose obsolete Semantic Release, shadcn 1.0.0, PCF 1.19.4, or SWA CLI 1.1.3 downgrades. Keep the supported packages and recheck the stated release conditions. The shared `braces` finding is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). SWA CLI also has the previously recorded Node 26 `DEP0187` emulator warning; recheck it with the next CLI release.

## Account-owner actions

These actions require repository or registry owners and cannot be completed in code:

1. Add a second active npm owner and align npm ownership with `.github/CODEOWNERS`.
2. Recheck `main` branch protection; the September review reported missing required status checks and approving reviews. Require the exact `22.x`, `lts/*`, and `node` checks from a completed `build-test-smoke` and `generated-build` pull request run, require reviewed pull requests and code-owner review for the release surface, and keep force pushes disabled.
3. Review and merge the compatible GitHub Actions updates only after the final branch matrix is green.
4. Exercise one quarterly deployment for each supported host and record the result outside this public repository when it contains tenant or customer details.

The current npm release is independent of this working tree. Confirm it with `npm view create-ec-app version`; treat committed, pushed, merged, CI-passed, and published as separate states.
