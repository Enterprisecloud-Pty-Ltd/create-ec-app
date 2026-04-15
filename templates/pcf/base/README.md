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
