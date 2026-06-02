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

- The wrapper imports `src/App` directly and reuses the built `dist/main.css`.
- Regenerate this folder after rebuilding the webresource whenever the app changes.
- The project includes both `pcf-scripts` build support and a `.pcfproj` for Dataverse solution packaging flows.

## CSS scoping

This PCF control renders the app inside `.ec-app` and keeps the PCF host container class `.ec-pcf-shell-control`.

Generated Tailwind/shadcn styles are scoped for embeddability:

- Tailwind Preflight is not imported globally.
- Tailwind utilities use the `ec:` prefix.
- shadcn theme variables are defined under `.ec-app`.
- Radix/shadcn portals render into the app-local portal root where supported.

If this PCF was generated from an older app whose `dist/main.css` contains global Tailwind/shadcn styles, those styles may still leak into the model-driven app form. Regenerate or migrate the source app to the scoped CSS template.
