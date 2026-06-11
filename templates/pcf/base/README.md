# {{CONTROL_DISPLAY_NAME}}

This folder was generated from the webresource source using the checked-in PCF base template.

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
- Regenerate this folder after rebuilding the webresource whenever the app changes.
- The project includes both `pcf-scripts` build support and a `.pcfproj` for Dataverse solution packaging flows.

## CSS scoping

This PCF control renders the app inside the PCF host container class `.pcf-shell-control`.

During PCF generation, `create-ec-app` reads the webresource's built `dist/main.css`, scopes CSS selectors to this control's `.pcf-shell-control[data-pcf-control="{{PCF_CONSTRUCTOR}}"]` host selector, and writes the result to `pcf-scoped.css`.

Tailwind utilities and base selectors are isolated under the generated PCF host selector. Radix/shadcn portals render into the PCF-local portal root where supported.
