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

Node 26 is supported alongside Node 22. CI checks both versions, including the generated-project build workflow. The CLI and generated apps compile with TypeScript 7 and lint with Oxlint. PCF wrappers retain TypeScript 5.9 for compatibility with Microsoft's build tools.

See the shared [tooling and handover guide](docs/tooling.md) for editor setup, the generated apps' TypeScript compatibility aliases, and upgrade checks. The CLI itself uses `typescript@7.0.2` directly and its editor settings select `node_modules/typescript`.

UI layers are `shadcn-ui` and `kendo`.

| Target | Hosting and generated guidance |
|---|---|
| `webresource` | Dynamics webresource, with host-specific `AGENTS.md`; can generate a separate PCF wrapper. |
| `swa` | Azure Static Web Apps, with routing/deployment configuration and host-specific `AGENTS.md`. Provides the frontend hosting baseline. |
| `power-pages` | Microsoft Power Pages code site, with site-session guidance and host-specific `AGENTS.md`. |
| `code-apps` | Power Apps Code App, with SDK configuration and host-specific `AGENTS.md`. |
| `portal` | WIP placeholder: shared React/Vite base plus the chosen UI layer only. It does not inherit `swa`, provide SWA configuration, or generate `AGENTS.md`/`CLAUDE.md`. |

The intended `portal` target is an SWA frontend with Microsoft Entra sign-in and an Azure Function App broker that accesses Dataverse using a service principal/application user. It should reuse the SWA frontend layer and add the broker, configuration, host guidance, and tests. This backend contract makes it a separate target. The current placeholder does not implement that contract; see [the portal target contract](docs/portal.md).

## Agent workflow

Start with `npx --yes create-ec-app@latest --help`. Running the CLI without scaffold options starts interactive prompts. Agents should provide the project name, target, UI library, and installation choice explicitly:

```bash
npx --yes create-ec-app@latest --project-name my-swa --target swa --ui shadcn-ui --no-install --skip-git
cd my-swa
```

Read the generated `AGENTS.md`, `README.md`, and `docs/tooling.md` before editing, then install and verify:

```bash
npm install
npm run check
npm run build
```

Use Node 22.14 or newer within Node 22, or use Node 26; both lines are covered by CI. Commit the newly generated lockfile and use `npm ci` for later installs. `--skip-git` leaves repository initialization to the caller. Power Pages uses `--target power-pages`; `portal` is not an alias for Power Pages or SWA.

`@latest` selects the published npm release. An unmerged branch or pull request does not change the version installed by that command.

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
- `--version` / `-v`: print the CLI version and exit.
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

To scaffold shadcn files from a custom registry instead of the committed snapshot, pass a built `registry.json` URL:

```bash
npx create-ec-app@latest --project-name my-app --target webresource --ui shadcn-ui --shadcn-registry https://schalk-conradie.github.io/ec-registry/r/registry.json --no-install --skip-git
```

Custom registry scaffolding fetches every item listed in that registry catalog, writes each item file using its `target` or `path`, and merges the item `dependencies` and `devDependencies` into the generated `package.json`. It still writes `components.json`, the shadcn Tailwind CSS import, and a registry namespace so the generated app can use the same registry later.

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

The script updates compatible minor dependency ranges and lockfiles, stops on errors, and avoids installing template `node_modules`. It preserves the TypeScript/compiler-engine pins and leaves the shadcn snapshot to `npm run refresh:shadcn-template`, which updates source and dependencies together. Review compiler and engine upgrades manually using the [tooling guide](docs/tooling.md).

Generated apps do not ship the base template's `package-lock.json`: target and UI layers change the dependency set, so the template lockfile would be stale and break `npm ci`. The first `npm install` inside the generated app creates the real lockfile to commit.

Template `.gitignore` files are stored as `gitignore` (npm strips dotfiles named `.gitignore` when packing) and renamed to `.gitignore` while layering. Target-and-UI-specific file overrides live in `templates/combinations/<target>-<ui>` and apply after the target and UI layers.

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
  --output ./pcf/MyControlHost \
  --namespace EC \
  --constructor MyControlHost \
  --display-name "My Control Host"
```

3. Install dependencies inside that generated PCF directory:

```bash
cd ./pcf/MyControlHost
npm install
npm run build
```

This writes a standalone PCF project to `--output`. `--pcf-dir` identifies the source webresource; a relative `--output` is resolved from that source directory. If `--output` is omitted, the wrapper is generated under `pcf/<ConstructorName>` in the source project. The generated control:

- imports `src/App.tsx` directly instead of wrapping built HTML in an iframe
- creates and imports `pcf-scoped.css` from the built `dist/main.css`
- scopes every non-keyframe CSS selector under the generated PCF host selector
- creates `src/runtime/types.ts` only if that file does not already exist
- provides a runtime object with record context and `context.webAPI` access inside the generated PCF shell
- mounts your React app directly into the PCF container

Regenerate after app code or CSS changes by running the same sequence again from the webresource root:

```bash
npm run build
npx create-ec-app@latest \
  --pcf-dir . \
  --output ./pcf/MyControlHost \
  --namespace EC \
  --constructor MyControlHost \
  --display-name "My Control Host"
cd pcf/MyControlHost
npm install
npm run build
```

Regeneration removes and recreates the PCF output folder, so keep durable app code in `src` and use generator templates or layers for repeatable PCF-specific changes. New wrappers contain `create-ec-app.pcf.json`, which proves generator ownership and permits automatic regeneration. Wrappers created before this marker was introduced require `--force` once; review the target first, because an unmarked PCF project may contain hand-maintained work. Later regenerations recognize the marker automatically.

The output cannot be the source project or a directory containing it, including paths through symlinks or junctions. Constructor names use letters and digits and must start with a letter. Namespace segments follow the same rule and may be separated by dots, such as `EC.Controls`. When `--constructor` is omitted, numeric project names receive an `App` prefix: `360-dashboard` becomes `App360DashboardHost`. Versions use numeric `major.minor.patch` values without leading zeros, prerelease labels, or build metadata so they work in both npm and the PCF manifest.

What gets generated:

- a minimal PCF wrapper project at `--output`, defaulting to `pcf/<ConstructorName>` in the source project
- a checked-in PCF shell stamped out from `create-ec-app/templates/pcf/base`
- direct imports back to your webresource source
- a generated `pcf-scoped.css` file with CSS selectors scoped to the PCF control

Source and deployment boundaries:

- The source webresource remains a separate runnable app. Generation adds runtime files and can rewrite shadcn portal components in its source.
- React source stays in the webresource project and is imported by the wrapper.
- Add the generated PCF project to a Dataverse solution separately; generation does not deploy it.

## Verification

Useful checks before shipping template changes:

```bash
npm run build
npm test
npm run smoke:scaffold
npm run build:generated
node scripts/check-generated-css-scope.mjs <generated-pcf-control-path>
```

`npm test` runs Vitest with coverage across all `src/**/*.ts` files and enforces 100% statement, branch, function, and line coverage. `npm run smoke:scaffold` builds the CLI, packs the npm tarball, installs it, and scaffolds the target/UI matrix through the installed package with `--no-install --skip-git`, checking the generated file shape including `.gitignore` contents — so publish-time file stripping is caught locally. `npm run build:generated` installs the packed CLI, scaffolds fresh apps, verifies `npm ci` from their new lockfiles, builds, and lints with zero warnings across all eight combinations of Webresource, Power Pages, SWA, and Code Apps with Kendo and shadcn. It also builds and lints both PCF wrappers outside their source projects, rebuilds the converted source apps, checks agent guidance and CSS isolation, verifies the deployed SWA configuration and TypeScript dependency tree, and tests thirteen deliberately broken lint examples plus a compiled, lint-clean counterpart. Both CI jobs must pass before automatic release.

Run `npm run check` for the CLI's typecheck, Oxlint, and unit tests. VS Code recommendations and settings are supplied for the CLI and generated apps.

## Release Process

Releases use semantic-release from `.github/workflows/ci.yml` on pushes to `main`.
The CI job runs:

```bash
npm ci
npm run build
npm test
npm run smoke:scaffold
```

After CI passes, the release job runs:

```bash
npm ci
npm run release
```

Release authentication:

- `GITHUB_TOKEN`: provided by GitHub Actions.
- npm trusted publishing is configured for this repository's `ci.yml` workflow on npmjs.com.

Use Conventional Commits so semantic-release can choose the release type. Git tags, GitHub releases, and the npm package version published by semantic-release are the source of truth; `package.json` is not manually bumped as part of normal development.
