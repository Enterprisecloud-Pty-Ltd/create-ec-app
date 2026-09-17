# Tooling and maintenance

The generated apps use TypeScript **7.0.2** and Oxlint **1.83.0**, with the matching type-aware engine **oxlint-tsgolint 7.0.2001**. Node 26 and Node 22 are covered by the generator's Linux CI. Node 26.8.1 was used for the September 2026 refresh.

The CLI uses `typescript@7.0.2` directly; its editor settings select `node_modules/typescript`. The generated apps use the compatibility aliases described below. App-specific instructions are shipped from [templates/base/docs/tooling.md](../templates/base/docs/tooling.md).

For dependency maintenance, invoke `$update-templates` in this repository. Its instructions live at [.agents/skills/update-templates/SKILL.md](../.agents/skills/update-templates/SKILL.md).

## Generated app commands

```bash
npm ci                 # after the initial npm install has produced your app's lockfile
npm run dev
npm run typecheck      # TypeScript 7 project build without Vite bundling
npm run lint           # Oxlint, including type-aware promise checks
npm run lint:fix       # apply available automatic fixes
npm run check          # typecheck + lint
npm run build          # typecheck + production bundle
```

Commit the generated application's `package-lock.json`. Use `npm ci` in application CI, followed by `npm run check` and `npm run build`.

## Editor setup

Install the workspace recommendations: **Oxc** (`oxc.oxc-vscode`) and **TypeScript Native Preview** (`TypeScriptTeam.native-preview`, also used for stable TypeScript 7). Workspace settings select `node_modules/@typescript/native`, enable TypeScript 7, and use Oxc fixes on explicit saves. ESLint editor diagnostics are disabled for this workspace because Oxlint runs its lint rules.

If using another editor, select the local TypeScript 7 language server and Oxlint; the npm commands remain the authoritative checks. The supplied workspace settings and recommendations can be committed; other personal VS Code files remain ignored.

## Why there are two TypeScript packages

`@typescript/native` is an npm alias for stable `typescript@7.0.2`; it provides the `tsc` command used by builds. `typescript` is an alias for Microsoft's `@typescript/typescript6@6.0.2` compatibility package; it provides the older JavaScript API required by TanStack's lint dependencies and a separate `tsc6` command. Application compilation uses **7**, not the compatibility compiler.

This follows [Microsoft's side-by-side installation guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60). It avoids forced peer resolution. Check the setup with `npx tsc --version` and `npm ls typescript @typescript/native`.

## Rules retained during the migration

`.oxlintrc.json` retains the previous recommended JavaScript/TypeScript checks, React Hooks and Fast Refresh checks, React Compiler checks, and all recommended TanStack Query rules. It adds type-aware checks for floating promises and misused promises. It also loads [`@shadcn/lint`](https://github.com/shadcn-ui/lint) and enforces `no-restyle` with layout classes allowed, `no-raw-colors`, `no-arbitrary-values`, and `require-static-classes`. `no-unknown-classes` starts as a warning so teams can identify external stylesheet exceptions before making it an error.

React Compiler, Query, and shadcn rules run from their official ESLint plugin packages through [Oxlint's JavaScript plugin support](https://oxc.rs/docs/guide/usage/linter/js-plugins.html). That bridge is still alpha. The generator's CI tests deliberately broken and corrected code to catch integration regressions; ESLint may still appear as a transitive plugin dependency, but it is not the app's lint runner.

The first shadcn policy is deliberately narrow. Layout utilities remain valid on imported components, while component appearance belongs in variants or the component source. Raw palette colours and arbitrary values must become theme tokens, and class names must remain statically readable by Tailwind and the linter. `no-inline-styles` is not enabled because runtime CSS variables and calculated values remain valid application needs.

Vendored `src/components/ui/**` and `src/hooks/use-mobile.ts` remain excluded from lint, matching the previous policy. They are still typechecked and bundled. The generated `pcf/` directory has its own tooling.

## Maintaining the setup

1. Update TypeScript 7 and `oxlint-tsgolint` together; verify the engine's supported TypeScript version in the [Oxlint release notes](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable). Preserve both npm aliases until the Query dependency chain supports the native compiler API.
2. Review React Hooks, Query, and `@shadcn/lint` releases when updating Oxlint. Retest both invalid and corrected examples using the generator's `scripts/check-generated-lint.mjs <app-directory>`.
3. Run checks and a production build after dependency changes. In `create-ec-app`, run `npm run check`, `npm run smoke:scaffold`, and `npm run build:generated`; the last command checks all eight target/UI combinations and both PCF wrappers.
4. Refresh shadcn source and its dependency patch together using the generator's pinned `npm run refresh:shadcn-template`. Updating package versions alone does not refresh vendored components.

## PCF exception

Generated PCF wrappers retain **TypeScript 5.9** and Microsoft's `pcf-scripts` build/lint tooling. Their webpack/ts-loader integration needs the older TypeScript API. Keep that compiler separate until the PCF toolchain explicitly supports TypeScript 7. Generated PCF `build` and `lint` commands use `scripts/run-pcf.mjs` to require explicit task success: `pcf-scripts` 1.51.1 was observed returning zero after webpack failed. Reassess the guard when an upstream release propagates failures reliably. Open the PCF directory separately in VS Code and select its supplied legacy TypeScript settings. Rebuild the webresource and regenerate its PCF wrapper whenever shared source or CSS changes. Automatic regeneration requires the generator-owned `create-ec-app.pcf.json` marker. An older wrapper without the marker needs a reviewed, one-time `--force`; ordinary PCF manifests are deliberately not treated as proof that recursive replacement is safe.

## SWA CLI exception and install scripts

Azure Static Web Apps CLI 2.0.10 is the latest stable release as of 2026-09-16. Its published dependencies still resolve `adm-zip@0.5.18` and `devcert@1.2.3` with `tmp@0.0.33`, which npm reports under four advisories. `npm audit fix --force` proposes downgrading the CLI to 1.1.3; do not use that downgrade or add transitive overrides. Recheck when Microsoft releases a newer stable CLI whose dependency tree removes these advisories.

On Node 26, SWA CLI 2.0.10 also emits `DEP0187` from its `start.ts` call to `fs.existsSync`; the emulator still starts and serves routing configuration. Recheck this warning with the next SWA CLI release.

npm 11 blocks unreviewed dependency install scripts. Generated SWA apps approve `keytar@7.9.0`, which installs the native operating-system credential-store binding used by Azure authentication. Generated Kendo apps approve `@progress/kendo-licensing@1.11.3`, whose postinstall runs Telerik's license activation with `--ignore-no-license`. These approvals are exact-version entries in `allowScripts`; review and update them with the corresponding dependency instead of approving future versions broadly.

## Repository checks and handover record

Read [handover.md](handover.md) for the current compatibility decisions, upstream advisory exceptions, final verification gates, and account-owner actions.

Run from the `create-ec-app` repository root:

```bash
npm ci
npm run check
npm run smoke:scaffold
npm run build:generated
```

`check` includes CLI typechecking, lint, and unit coverage. `build:generated` installs the packed npm artifact and checks four targets with both UI libraries. Each app gets a fresh install followed by `npm ci`, a production build, lint with zero warnings, and a TypeScript dependency-tree check. The matrix also verifies agent guidance, the deployed SWA routing config, both PCF wrappers with explicit lint and CSS scoping checks, and negative/positive lint fixtures. It rebuilds and lints webresources after PCF conversion; the corrected lint fixture must also compile. CI is configured for Node 22 and 26; merging a release-producing commit to `main` can publish to npm.

Run the smoke and generated-build scripts through the npm commands above. They use npm's `npm_execpath` entrypoint with the current Node executable, which avoids executing `npm.cmd` directly on Windows. The generated matrix uses numeric webresource project names and inferred PCF constructors to verify that naming path with both UI libraries.

The 2026-09-05 local validation used Node 26.8.1: 85 unit tests passed with 100% coverage, all eight app builds/lints passed, and both PCF wrappers and CSS checks passed. Dependency lifecycle scripts were disabled for that local run; Kendo license activation and live Microsoft-hosted deployments were not verified. This is a dated baseline, not evidence for a future upgrade.

When maintaining tooling, update this guide and the generated app guide where behavior changes. Add a dated entry to the root `AGENTS.md` changelog covering versions changed, compatibility exceptions, supporting source links, checks run, and any deferred upgrade's concrete recheck condition. Generated targets have their own `AGENTS.md` changelog for app-facing changes.

## Maintainership

The generator only stays current if more than one person can operate every part of it. Check this list when someone joins or leaves the team.

**npm package.** `create-ec-app` is published from GitHub Actions through npm trusted publishing (OIDC), so releases do not depend on anyone's npm token. Managing the package does: changing the trusted publisher, deprecating versions, or recovering 2FA needs an npm owner. Keep at least two active EC accounts as owners and confirm with `npm owner ls create-ec-app`. Add one with `npm owner add <npm-username> create-ec-app`.

**GitHub.** [`.github/CODEOWNERS`](../.github/CODEOWNERS) lists the reviewers for the release surface; keep it aligned with the npm owners. Protect `main` in repository settings: require a pull request, require every Node 22.x and 26.x matrix check emitted by `build-test-smoke` and `generated-build` (select the exact check names shown by a completed PR run, including any reusable-workflow prefix), and disallow force pushes. Every push to `main` with a `feat:` or `fix:` commit publishes a new npm version, so `main` should only receive reviewed merges.

**Versioning.** semantic-release derives the next version from Conventional Commit messages and does not write it back to `package.json`, which intentionally stays at `0.0.0-development`. Find the released version with `npm view create-ec-app version`. Commit subjects become the public release notes, so write them for a reader: `feat: add Dataverse read-only skill to webresource scaffold`, not a narration of what you did. Use `docs:` or `chore:` for changes that should not publish.

**Dependency flow.** [`.github/dependabot.yml`](../.github/dependabot.yml) opens weekly grouped PRs for the CLI, `templates/base`, and the workflow actions; CI runs the full generated matrix on each. Merge green groups. Compiler and lint-engine pins (`typescript` aliases, `oxlint-tsgolint`, PCF) are excluded because they need the compatibility review described above; the Kendo and shadcn patches and the PCF template are refreshed with `bash update-templates.sh` and `$update-templates`. Set a quarterly reminder to run that skill even when Dependabot is quiet, and to reassess the PCF TypeScript exception.

**Monitoring.** The generated build also runs every Monday on a schedule. A failure opens or updates an issue labelled `generated-build`; treat it as the signal that an upstream release broke the templates. Do not fix it by loosening lint rules or forcing peer resolution.

**Not verifiable from CI.** Kendo license activation and live deployments to Dynamics, Power Pages, Static Web Apps, and Power Apps are exercised only by generating an app and deploying it. Do this once per quarter, or after any change to a target's auth or deployment output.
