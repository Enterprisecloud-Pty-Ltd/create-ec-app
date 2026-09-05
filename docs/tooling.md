# Tooling and maintenance

The generated apps use TypeScript **7.0.2** and Oxlint **1.81.0**, with the matching type-aware engine **oxlint-tsgolint 7.0.2001**. Node 26 and Node 22 are covered by the generator's Linux CI. Node 26.8.1 was used for the September 2026 refresh.

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

`@typescript/native` is an npm alias for stable `typescript@7.0.2`; it provides the `tsc` command used by builds. `typescript` is an alias for Microsoft's `@typescript/typescript6@6.0.3` compatibility package; it provides the older JavaScript API required by TanStack's lint dependencies and a separate `tsc6` command. Application compilation uses **7**, not the compatibility compiler.

This follows [Microsoft's side-by-side installation guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60). It avoids forced peer resolution. Check the setup with `npx tsc --version` and `npm ls typescript @typescript/native`.

## Rules retained during the migration

`.oxlintrc.json` retains the previous recommended JavaScript/TypeScript checks, React Hooks and Fast Refresh checks, React Compiler checks, and all recommended TanStack Query rules. It adds type-aware checks for floating promises and misused promises.

React Compiler and Query rules run from their official ESLint plugin packages through [Oxlint's JavaScript plugin support](https://oxc.rs/docs/guide/usage/linter/js-plugins.html). That bridge is still alpha. The generator's CI tests deliberately broken and corrected code to catch integration regressions; ESLint may still appear as a transitive plugin dependency, but it is not the app's lint runner.

Vendored `src/components/ui/**` and `src/hooks/use-mobile.ts` remain excluded from lint, matching the previous policy. They are still typechecked and bundled. The generated `pcf/` directory has its own tooling.

## Maintaining the setup

1. Update TypeScript 7 and `oxlint-tsgolint` together; verify the engine's supported TypeScript version in the [Oxlint release notes](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable). Preserve both npm aliases until the Query dependency chain supports the native compiler API.
2. Review React Hooks and Query plugin releases when updating Oxlint. Retest both invalid and corrected examples using the generator's `scripts/check-generated-lint.mjs <app-directory>`.
3. Run checks and a production build after dependency changes. In `create-ec-app`, run `npm run check`, `npm run smoke:scaffold`, and `npm run build:generated`; the last command checks all eight target/UI combinations and both PCF wrappers.
4. Refresh shadcn source and its dependency patch together using the generator's pinned `npm run refresh:shadcn-template`. Updating package versions alone does not refresh vendored components.

## PCF exception

Generated PCF wrappers retain **TypeScript 5.9** and Microsoft's `pcf-scripts` build/lint tooling. Their webpack/ts-loader integration needs the older TypeScript API. Keep that compiler separate until the PCF toolchain explicitly supports TypeScript 7. Open the PCF directory separately in VS Code to use its supplied legacy TypeScript settings. Rebuild the webresource and regenerate its PCF wrapper whenever shared source or CSS changes.

## Repository checks and handover record

Run from the `create-ec-app` repository root:

```bash
npm ci
npm run check
npm run smoke:scaffold
npm run build:generated
```

`check` includes CLI typechecking, lint, and unit coverage. `build:generated` checks four targets with both UI libraries, valid TypeScript dependency trees, both PCF wrappers, CSS scoping, and negative/positive lint fixtures. CI is configured for Node 22 and 26; merging a release-producing commit to `main` can publish to npm.

The 2026-09-05 local validation used Node 26.8.1: 85 unit tests passed with 100% coverage, all eight app builds/lints passed, and both PCF wrappers and CSS checks passed. Dependency lifecycle scripts were disabled for that local run; Kendo license activation and live Microsoft-hosted deployments were not verified. This is a dated baseline, not evidence for a future upgrade.

When maintaining tooling, update this guide and the generated app guide where behavior changes. Add a dated entry to the root `AGENTS.md` changelog covering versions changed, compatibility exceptions, supporting source links, checks run, and any deferred upgrade's concrete recheck condition. Generated targets have their own `AGENTS.md` changelog for app-facing changes.
