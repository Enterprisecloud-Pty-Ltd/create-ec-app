# Working on the generated PCF wrapper

This directory is a generated PCF host for the React webresource in `{{PROJECT_ROOT_REL}}`. Treat the webresource source as the durable application source. Rebuild the webresource and regenerate this wrapper after application or CSS changes.

## Boundaries

- Keep the wrapper on the checked-in `pcf-scripts` and TypeScript 5.9 toolchain until the Microsoft PCF webpack stack supports the source app's compiler.
- Keep `index.ts`, `runtime/PcfAppShell.tsx`, `webpack.config.js`, the manifest, and `pcf-scoped.css` aligned with the generator template. Put application behaviour in the webresource source.
- Use the PCF runtime passed to `App`; do not call the webresource `AuthService.ts` from this wrapper or add bearer-token authentication.
- The wrapper replaces webresource `AuthService.ts` imports with a PCF-only error boundary so local bearer-token code cannot enter the PCF bundle. Shared application code must use the runtime `webApi` whenever `runtime.host` is `pcf`.
- Pass Dataverse logical table names such as `account` to the runtime `webApi` methods. PCF `context.webAPI` does not take Web API entity-set names such as `accounts`.
- Keep rendered overlays inside the generated portal root. Shadcn portals are localized during generation. Kendo popup components use `PopupPropsContext` when the source app has Kendo popup support.
- Do not import the source app's global CSS directly. The wrapper imports generated `pcf-scoped.css`; source CSS imports are replaced during bundling.
- Preserve the `.pcf-shell-control[data-pcf-control="{{PCF_CONSTRUCTOR}}"]` host selector. It prevents application and theme styles from leaking into the model-driven app.

## Checks

Run `npm run lint` and `npm run build` in this directory. These checks prove the wrapper compiles and passes the PCF toolchain. They do not prove installation, runtime behaviour in Dynamics, or deployment to Dataverse.

See `README.md` for the build and regeneration workflow and source path. Preserve this wrapper's existing output location when regenerating; the example uses the default layout.
