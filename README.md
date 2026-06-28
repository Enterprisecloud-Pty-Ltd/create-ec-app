# create-ec-app

CLI for scaffolding Enterprisecloud React apps from layered templates.

## Scaffold An App

```bash
npx create-ec-app@latest --project-name my-webresource --target webresource --ui shadcn-ui
npx create-ec-app@latest --project-name my-code-app --target code-apps --ui kendo --skip-git
npx create-ec-app@latest --project-name my-swa --target swa --ui shadcn-ui --no-install
```

For local development in this repo:

```bash
npm run dev -- --project-name my-app --target webresource --ui shadcn-ui --no-install --skip-git
```

Targets include `webresource`, `portal`, `power-pages`, `swa`, and `code-apps`. UI layers include `shadcn-ui` and `kendo`.

Quick shadcn creates with dependency install:

```bash
npx create-ec-app@latest --project-name my-webresource --target webresource --ui shadcn-ui --install
npx create-ec-app@latest --project-name my-power-pages --target power-pages --ui shadcn-ui --install
npx create-ec-app@latest --project-name my-swa --target swa --ui shadcn-ui --install
npx create-ec-app@latest --project-name my-code-app --target code-apps --ui shadcn-ui --install
```

Useful CLI flags:

- `--force`: overwrite an existing non-empty project directory.
- `--skip-git`: skip `git init`, `git add .`, and the initial commit.
- `--help` / `-h`: print usage and exit without prompting.

By default, existing non-empty project directories fail with a clear error. Existing empty directories are reused. Git initialization still runs by default unless `--skip-git` is passed.

## Power Apps Code Apps

Use the `code-apps` target to scaffold a React + Vite app that keeps the EC base template and adds Microsoft Power Apps code app support:

```bash
npm run dev -- --project-name my-code-app --target code-apps --ui shadcn-ui --no-install --skip-git
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

## shadcn/ui Template

The shadcn template vendors generated component source under `templates/ui/shadcn-ui/src`. Normal scaffolding copies those files like any other template layer and does not run `npx shadcn`.

```bash
npm run dev -- --project-name my-app --target webresource --ui shadcn-ui --no-install --skip-git
```

That command is offline-friendly after the package is available locally; `--no-install` skips dependency installation and no scaffold-time external component generation is performed. Generated projects still include `components.json` so app owners can later run shadcn manually inside their own app if they choose.

The committed snapshot pins the component source and uses exact versions in `templates/ui/shadcn-ui/package.patch.json` for dependencies directly required by those files.

Maintainers refresh the snapshot intentionally:

```bash
npm run refresh:shadcn-template
```

The refresh script uses a pinned shadcn CLI version, applies EC portal compatibility transforms, updates vendored component files, writes `SHADCN_TEMPLATE.md`, and refreshes the shadcn dependency patch.

For shadcn changes, generate a fresh app and run a build before committing:

```bash
npm run build:generated
```

## Style Scoping

Generated webresources use normal Tailwind/shadcn CSS by default. When a webresource is converted into a PCF wrapper, the generator creates a local PCF shell and a local `pcf-scoped.css` file in the generated PCF project. That CSS file is copied from the built `dist/main.css` with every non-keyframe selector rewritten under the `.pcf-shell-control[data-pcf-control="..."]` host selector, so Tailwind utilities, base selectors, and shadcn/Tailwind theme variables stay inside that control.

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

2. Run the generator from the webresource root. Point `--pcf-dir` at the webresource root and `--output` at the PCF project folder you want to generate:

```bash
npx create-ec-app@latest \
  --pcf-dir . \
  --output ./pcf/{{ControlName}} \
  --namespace EC \
  --constructor {{ControlName}} \
  --display-name "Control Name"
```

3. Install dependencies inside that generated PCF directory:

```bash
cd ./pcf/{{ControlName}}
npm install
npm run build
```

This writes a standalone PCF project to the `--pcf-dir` folder. The generated control:

- imports `src/App.tsx` directly instead of wrapping built HTML in an iframe
- creates and imports `pcf-scoped.css` from the built `dist/main.css`
- scopes every non-keyframe CSS selector under the generated PCF host selector
- creates `src/runtime/types.ts` only if that file does not already exist
- provides a runtime object with record context and `context.webAPI` access inside the generated PCF shell, following the `PcfBase` pattern
- mounts your React app directly into the PCF container

Regenerate after app code or CSS changes by running the same sequence again from the webresource root:

```bash
npm run build
npx create-ec-app@latest \
  --pcf-dir . \
  --output ./pcf/FusionNotebookHost \
  --namespace EC \
  --constructor FusionNotebookHost \
  --display-name "Fusion Notebook Host"
cd pcf/FusionNotebookHost
npm install
npm run build
```

Regeneration removes and recreates the PCF output folder, so keep durable app code in `src` and use generator templates or layers for repeatable PCF-specific changes.

What gets generated:

- a minimal PCF wrapper project under `pcf/<ConstructorName>`
- a checked-in PCF shell stamped out from `create-ec-app/templates/pcf/base`
- direct imports back to your webresource source
- a generated `pcf-scoped.css` file with CSS selectors scoped to the PCF control

What does not happen:

- your existing webresource project is not converted in place
- your React source is not moved into the PCF project
- the generated PCF project does not automatically get added to a Dataverse solution

## Verification

Useful checks before shipping template changes:

```bash
npm run build
npm test
npm run smoke:scaffold
npm run build:generated
node scripts/check-generated-css-scope.mjs <generated-pcf-control-path>
```

`npm test` runs Vitest with coverage across all `src/**/*.ts` files and enforces the configured coverage thresholds. `npm run smoke:scaffold` builds the CLI, scaffolds the target/UI matrix with `--no-install --skip-git`, and checks the generated file shape. `npm run build:generated` installs and builds a smaller generated-project matrix, including a shadcn webresource.

## Release Process

Releases use semantic-release on pushes to `main`. The release workflow runs:

```bash
npm ci
npm run build
npm test
npm run smoke:scaffold
npm run release
```

Required repository secrets:

- `GITHUB_TOKEN`: provided by GitHub Actions.
- `NPM_TOKEN`: npm automation token with publish access.

Use Conventional Commits so semantic-release can choose the release type. Git tags, GitHub releases, and the npm package version published by semantic-release are the source of truth; `package.json` is not manually bumped as part of normal development.
