# Application tooling

## Commands

Run `npm install` for the initial scaffold and commit `package-lock.json`. Use `npm ci` thereafter.

```bash
npm run dev
npm run typecheck
npm run lint
npm run lint:fix
npm run check
npm run build
```

`check` runs typechecking and lint. `build` runs typechecking and creates the production Vite bundle. Run both in application CI.

## Compiler and lint setup

The template baseline uses TypeScript 7.0.2, Oxlint 1.81.0, and the matching `oxlint-tsgolint` 7.0.2001 engine. Node 22 and 26 are covered by the generator's Linux CI.

`@typescript/native` aliases `typescript@7.0.2` and supplies the `tsc` command. `typescript` aliases Microsoft's `@typescript/typescript6@6.0.3` compatibility package for the JavaScript API used by Query's lint dependencies; its compiler command is `tsc6`. Keep the aliases until those dependencies support the native API. Verify with `npx tsc --version` and `npm ls typescript @typescript/native`.

Oxlint retains React Hooks, Fast Refresh, React Compiler, and recommended TanStack Query rules, plus type-aware floating/misused promise checks. React Compiler and Query rules use the official plugins through Oxlint's JavaScript plugin bridge. Vendored `src/components/ui/**` and `src/hooks/use-mobile.ts` remain excluded from lint but are typechecked and bundled.

## Editor

Install the workspace recommendations: Oxc (`oxc.oxc-vscode`) and TypeScript Native Preview (`TypeScriptTeam.native-preview`, which also supports stable TypeScript 7). The supplied settings select `node_modules/@typescript/native`, enable Oxc fixes on explicit saves, and disable duplicate ESLint diagnostics. Commit the supplied settings and recommendations; other personal VS Code files stay ignored.

## Upgrades and PCF

Read the maintained [create-ec-app tooling guide](https://github.com/Enterprisecloud-Pty-Ltd/create-ec-app/blob/main/docs/tooling.md) and use `$update-templates` in a checkout of that repository for shared template updates. The skill checks current official documentation and release metadata before changing versions. Update this app's `AGENTS.md` changelog when its tooling changes.

Upgrade the native compiler and type-aware engine as a supported pair, then run `check` and `build`. Updating shadcn dependencies alone does not refresh vendored components; refresh source and dependencies together in the generator.

PCF wrappers currently retain TypeScript 5.9 with Microsoft's `pcf-scripts`. Do not infer compatibility from a new TypeScript release: check the released PCF build tools and their loader support, then build both UI variants. Open the wrapper folder separately in VS Code to use its own compiler settings. Rebuild the webresource and regenerate its wrapper whenever shared source or CSS changes.
