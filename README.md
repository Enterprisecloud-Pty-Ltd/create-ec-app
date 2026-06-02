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

## Generate A PCF Control

After creating a webresource app, build it first so `dist/main.css` exists:

```bash
cd my-app
npm run build
```

Then run the published CLI and install the generated PCF project's dependencies:

```bash
npx create-ec-app@latest --pcf-dir ./pcf/{{ControlName}} namespace {{EC}} --constructor {{ControlName}} --display-name "Control Name"
cd ./pcf/{{ControlName}}
npm install
```

This creates a PCF wrapper under the webresource project, reuses the app's built CSS, and keeps the generated app wrapped in `EcAppShell` so scoped styles and app-local portals continue to work inside the PCF host.

## Verification

Useful checks before shipping template changes:

```bash
npm run build
npm audit --audit-level=moderate --prefix templates/base
npm audit --audit-level=moderate --prefix templates/pcf/base
node scripts/check-generated-css-scope.mjs <generated-app-path>
```

For shadcn changes, also generate a fresh app, run `npm run build`, and verify a nested parent/child fixture if the scoping model changed.
