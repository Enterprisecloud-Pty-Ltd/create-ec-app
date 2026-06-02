# create-ec-app

CLI for scaffolding Enterprisecloud React apps from layered templates.

## Scaffold An App

```bash
npm run dev -- --project-name my-app --target webresource --ui shadcn-ui --no-install
```

Targets include `webresource`, `power-pages`, and `swa`. UI layers include `shadcn-ui` and `kendo`.

## shadcn/ui Generation

The shadcn template does not vendor generated component files. During scaffolding, the CLI copies the base and UI templates, replaces tokens such as `{{APP_NAME}}`, then runs:

```bash
npx shadcn@latest add --all --yes --overwrite
```

This keeps generated components aligned with the latest shadcn registry. The template `components.json` sets the Tailwind prefix to `ec`, which makes shadcn emit classes such as `ec:flex`.

Current shadcn projects also depend on the `shadcn` package at build time because `src/index.css` imports:

```css
@import "shadcn/tailwind.css";
```

That shared CSS defines shadcn's Tailwind v4 custom variants and utilities, including Radix/Base UI state and orientation variants used by controls such as sliders, accordions, scroll areas, menus, and sidebars. The app build resolves this import into `dist/main.css`; PCF wrappers then bundle that built CSS from the webresource project.

After generation, the CLI applies small compatibility fixes for app embedding:

- Radix/Base UI portals render into the app-local portal root from `EcAppShell`.
- shadcn theme selectors are scoped to `.ec-app[data-ec-app-id="<app-name>"]`.
- Known generated selector issues are normalized so builds stay clean with current Vite/Tailwind.

## Style Scoping

Every generated app is wrapped by `EcAppShell`:

```tsx
<div className="ec-app" data-ec-app-id="my-app" data-ec-app-root="">
```

Tailwind utilities are prefixed, and shadcn theme tokens are scoped by `data-ec-app-id`. This allows multiple generated apps, including nested parent/child apps with different themes, to coexist without overriding each other's theme variables.

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
- reuses the built stylesheet from `dist/main.css`
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
- direct imports back to your webresource source and built CSS

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
node scripts/check-generated-css-scope.mjs <generated-app-path>
```

For shadcn changes, also generate a fresh app, run `npm run build`, and verify a nested parent/child fixture if the scoping model changed.
