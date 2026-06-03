# {{CONTROL_DISPLAY_NAME}}

This folder was generated from the webresource source using the checked-in PCF base template.

## Build

```bash
npm install
npm run build
```

## Control Info

- Namespace: `{{PCF_NAMESPACE}}`
- Constructor: `{{PCF_CONSTRUCTOR}}`
- React app import: `{{PROJECT_APP_IMPORT}}`
- CSS import: `{{PROJECT_CSS_IMPORT}}`

## Notes

- The wrapper imports `src/App` directly and uses generated `pcf-scoped.css` derived from the webresource build.
- Regenerate this folder after rebuilding the webresource whenever the app changes.
- The project includes both `pcf-scripts` build support and a `.pcfproj` for Dataverse solution packaging flows.

## CSS scoping

This PCF control renders the app inside the PCF host container class `.ec-pcf-shell-control`.

During PCF generation, `create-ec-app` reads the webresource's built `dist/main.css`, scopes CSS custom-property rules to this control's `.ec-pcf-shell-control[data-ec-pcf-control="{{PCF_CONSTRUCTOR}}"]` host selector, and writes the result to `pcf-scoped.css`.

Tailwind utilities remain unprefixed, while shadcn/Tailwind theme variables are local to the generated PCF control. Radix/shadcn portals render into the app-local portal root where supported.
