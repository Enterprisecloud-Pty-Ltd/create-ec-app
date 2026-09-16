# {{CONTROL_DISPLAY_NAME}}

This folder was generated from the webresource source using the checked-in PCF base template.

This wrapper deliberately uses TypeScript 5.9 with Microsoft's `pcf-scripts`, whose webpack/ts-loader integration requires the older compiler API. The source webresource uses TypeScript 7 and Oxlint independently. Do not upgrade the wrapper's TypeScript major until the PCF toolchain supports it. Open this folder separately in VS Code and select its workspace TypeScript version.

## Build

```bash
npm install
npm run build
```

## Regenerate From Webresource Changes

Do not edit this generated PCF folder as the durable source of truth. From the webresource root, rebuild and regenerate:

```bash
npm run build
npx create-ec-app@latest \
  --pcf-dir . \
  --output ./pcf/{{PCF_CONSTRUCTOR}} \
  --namespace {{PCF_NAMESPACE}} \
  --constructor {{PCF_CONSTRUCTOR}} \
  --display-name "{{CONTROL_DISPLAY_NAME}}"
cd pcf/{{PCF_CONSTRUCTOR}}
npm install
npm run build
```

Then run the harness:

```bash
npm run start -- --no-open
```

## Control Info

- Namespace: `{{PCF_NAMESPACE}}`
- Constructor: `{{PCF_CONSTRUCTOR}}`
- React app import: `{{PROJECT_APP_IMPORT}}`
- CSS import: `{{PROJECT_CSS_IMPORT}}`

## Notes

- The wrapper imports `src/App` directly, renders it through the local PCF shell, and uses generated `pcf-scoped.css` derived from the webresource build.
- Source-app CSS imports are ignored by the PCF webpack config because the built CSS is already included through `pcf-scoped.css`.
- Source-app `AuthService.ts` imports resolve to a PCF-only error boundary. PCF data access must use the runtime `webApi`; bearer-token code is not bundled into the control.
- Shadcn portals and Kendo popups render inside the control's portal root so overlays remain under the scoped host selector.
- Runtime `webApi` methods take Dataverse logical table names such as `account`, matching PCF `context.webAPI`.
- Regenerate this folder after rebuilding the webresource whenever the app changes.
- The project includes both `pcf-scripts` build support and a `.pcfproj` for Dataverse solution packaging flows.

## CSS scoping

This PCF control renders the app inside the PCF host container class `.pcf-shell-control`.

During PCF generation, `create-ec-app` reads the webresource's built `dist/main.css`, scopes CSS selectors to this control's `.pcf-shell-control[data-pcf-control="{{PCF_CONSTRUCTOR}}"]` host selector, and writes the result to `pcf-scoped.css`.

Tailwind utilities and base selectors are isolated under the generated PCF host selector. Generation unwraps cascade layers in source order because unlayered Dynamics host rules would otherwise outrank every layered application utility. Radix/shadcn portals render into the PCF-local portal root where supported.

The generated `build` and `lint` commands require the tool's explicit success result as well as a zero exit code. `pcf-scripts` 1.51.1 can return zero after reporting a task failure, so `scripts/run-pcf.mjs` prevents that result from passing CI. Keep this guard until an upstream version reliably propagates failed tasks and the failure regression checks pass.
