# create-ec-app

CLI for scaffolding Enterprisecloud React apps from layered templates.

## Scaffold An App

```bash
npm run dev -- --project-name my-app --target webresource --ui shadcn-ui --no-install
```

Targets include `webresource`, `power-pages`, `swa`, and `code-apps`. UI layers include `shadcn-ui` and `kendo`.

## Power Apps Code Apps

Use the `code-apps` target to scaffold a React + Vite app that keeps the EC base template and adds Microsoft Power Apps code app support:

```bash
npm run dev -- --project-name my-code-app --target code-apps --ui shadcn-ui --no-install
```

Compared with the base template, the Code Apps target adds:

- `@microsoft/power-apps` for the Power Apps code app SDK and npm CLI
- `@microsoft/power-apps-vite` for local Play URLs, Power Apps CORS settings, and `base: "./"` build output
- `powerApps()` in `vite.config.ts` alongside the existing React, Tailwind, and `@` alias config

Code Apps use the Power Apps host, `power.config.json`, and generated SDK services for Dataverse and connector access. They should not use the `webresource` target's `src/services/AuthService.ts` or `token.json` local bearer-token pattern, and the Code Apps scaffold removes those auth artifacts if they are present during generation.

After scaffolding, initialize the app metadata and authenticate to your environment:

```bash
npm install
npx power-apps init --display-name "My Code App" --environment-id <environment-id> --app-url http://localhost:5173
```

`power.config.json` is intentionally not scaffolded as a real file. Microsoft’s CLI creates it during `npx power-apps init` and refuses to initialize if one already exists. The target includes `power.config.example.json` so you can see the expected shape without blocking initialization.

For local development, run:

```bash
npm run dev
```

Open the **Local Play** URL printed by the Power Apps Vite plugin in the same browser profile you use for your Power Platform tenant.

To deploy:

```bash
npm run build
npx power-apps push
```

`npx power-apps push` publishes a new version to the environment in `power.config.json` and returns a Power Apps URL when it succeeds. Microsoft still documents the older PAC CLI path (`pac code init`, `npm run build | pac code push`) for compatibility, but the npm CLI is the preferred path for new code app work.

For ALM, use a non-default solution or set a preferred solution in the environment. With the PAC CLI path you can target a specific solution using:

```bash
pac code push --solutionName <solution-name>
```

The generated Code Apps README links to Microsoft's [overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview), [npm CLI quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/npm-quickstart), [architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture), and [ALM](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm) documentation.

It also documents Microsoft’s Code Apps data model:

- Dataverse table data sources through generated services under `src/generated`
- Power Platform connector data sources with connection IDs or connection references
- Environment-variable references for ALM-friendly dataset/table values
- Dataverse actions/functions through `npx power-apps find-dataverse-api` and `npx power-apps add-dataverse-api`
- Runtime context through `getContext` from `@microsoft/power-apps/app`

## shadcn/ui Generation

The shadcn template does not vendor generated component files. During scaffolding, the CLI copies the base and UI templates, replaces tokens such as `{{APP_NAME}}`, then runs:

```bash
npx shadcn@latest add --all --yes --overwrite
```

This keeps generated components aligned with the latest shadcn registry. The template leaves Tailwind utility names unprefixed so generated JSX and CSS stay close to the upstream shadcn output.

Current shadcn projects also depend on the `shadcn` package at build time because `src/index.css` imports:

```css
@import "shadcn/tailwind.css";
```

That shared CSS defines shadcn's Tailwind v4 custom variants and utilities, including Radix/Base UI state and orientation variants used by controls such as sliders, accordions, scroll areas, menus, and sidebars. The app build resolves this import into `dist/main.css`.

After generation, the CLI applies small compatibility fixes for app embedding:

- Radix/Base UI portals render into the app-local portal root from `EcAppShell`.
- Known generated selector issues are normalized so builds stay clean with current Vite/Tailwind.

## Style Scoping

Generated apps use normal Tailwind/shadcn CSS by default. `EcAppShell` is still present, but its job is to provide an app-local portal root for Radix/Base UI overlays:

```tsx
<div data-ec-app-root="">
```

When a webresource is converted into a PCF wrapper, the generator creates a local `pcf-scoped.css` file in the generated PCF project. That file is copied from the built `dist/main.css` with CSS custom-property rules rewritten under the PCF host selector, so shadcn/Tailwind theme variables stay inside that control without prefixing or scoping every utility selector.

## Template Updates

To refresh template dependency ranges and lockfiles:

```bash
bash update-templates.sh
```

The script updates `package.patch.json` files, template `package.json` files, installs dependencies to refresh lockfiles, then removes template `node_modules` directories.

## Generate a PCF Control

If you want to host the React webresource inside a PCF control instead of loading the HTML webresource directly in an iframe, use `create-ec-app` itself to generate the wrapper for an existing webresource project.

Basic flow:

1. Build the webresource:

```bash
npm run build
```

2. Run the generator and point `--pcf-dir` at the generated PCF project directory:

```bash
npx create-ec-app@latest --pcf-dir ./pcf/{{ControlName}} namespace {{EC}} --constructor {{ControlName}} --display-name "Control Name"
```

3. Install dependencies inside that generated PCF directory:

```bash
cd ./pcf/{{ControlName}}
npm install
```

This writes a standalone PCF project to the `--pcf-dir` folder. The generated control:

- imports `src/App.tsx` directly instead of wrapping built HTML in an iframe
- creates and imports `pcf-scoped.css` from the built `dist/main.css`
- creates `src/runtime/types.ts` only if that file does not already exist
- provides a runtime object with record context and `context.webAPI` access inside the generated PCF shell, following the `PcfBase` pattern
- mounts your React app directly into the PCF container

Typical conversion flow from inside a generated webresource project:

```bash
npm install
npm run build
npx create-ec-app@latest --pcf-dir ./pcf/FusionNotebookHost namespace EC --constructor FusionNotebookHost --display-name "Fusion Notebook Host"
cd pcf/FusionNotebookHost
npm install
npm run build
```

What gets generated:

- a minimal PCF wrapper project under `pcf/<ConstructorName>`
- a checked-in PCF shell stamped out from `create-ec-app/templates/pcf/base`
- direct imports back to your webresource source
- a generated `pcf-scoped.css` file with CSS custom properties scoped to the PCF control

What does not happen:

- your existing webresource project is not converted in place
- your React source is not moved into the PCF project
- the generated PCF project does not automatically get added to a Dataverse solution

## Verification

Useful checks before shipping template changes:

```bash
npm run build
npm audit --audit-level=moderate --prefix templates/base
npm audit --audit-level=moderate --prefix templates/pcf/base
node scripts/check-generated-css-scope.mjs <generated-pcf-control-path>
```

For shadcn changes, also generate a fresh app, run `npm run build`, generate a PCF wrapper, and run the CSS scope check against the generated PCF folder.
