## Purpose

This repository is an Azure Static Web Apps frontend using React, TypeScript, and Vite.

Treat it as a static Azure-hosted SPA. Keep it small, readable, and easy to deploy.

## Hard constraints

- Keep Static Web Apps hosting, local Vite development, and SPA routing fallback working.
- Keep the app client-side unless an Azure Functions API already exists or is explicitly requested.
- Do not add Dynamics `Xrm`, `token.json`, Power Pages ADAL, or Power Apps code app SDK patterns unless the target changes.
- Make surgical changes unless the task is implementing a Figma screen.

## Runtime

### Static Web Apps-hosted

- Build output is served from `dist`. Preserve `staticwebapp.config.json`.
- Keep `navigationFallback` when the app uses client-side routing.
- Use `staticwebapp.config.json` for SWA routes, auth, headers, response overrides, and fallback rules.
- Do not add deprecated `routes.json`.
- Do not rely on client-only route guards for sensitive data. Backend APIs must enforce auth and roles.

### Local dev

- Use Vite for normal UI development.
- Use the Static Web Apps CLI only when testing SWA routing, auth, or `/api` integration locally.
- Keep `swa-cli.config.json` aligned with the Vite dev server and `dist` output.
- Do not require a deployed Azure Static Web App for ordinary component work.

| File | Rule |
|---|---|
| `staticwebapp.config.json` | Routing, auth, and SPA fallback boundary. |
| `swa-cli.config.json` | Keep `appDevserverUrl`, build command, and output location accurate. |
| `vite.config.ts` | Preserve React, Tailwind, alias, and existing build assumptions. |
| `src/main.tsx` | Preserve bootstrap, providers, and global theme/style imports. |
| `package.json` | Keep SWA CLI scripts and dependencies only if the project uses them. |
| `api/` | Only add or change when the app has a Static Web Apps API requirement. |

Keep `staticwebapp.config.json` `navigationFallback` aligned with client-side routes.

Do not replace Vite, add SSR, add Next.js, or introduce backend coupling unless asked. If the build flow changes, verify the SWA config still reaches `dist`.

## Data access

Prefer direct calls to the app's own API or public endpoints.

- Use relative `/api/...` calls for Static Web Apps managed APIs.
- Put `fetch` in service files with explicit response types near the call site and narrow payloads.
- Check `response.ok` with useful status text.
- Use `import.meta.env.VITE_*` only for public browser-safe values. Do not put secrets in client-side environment variables.
- If the app needs private data, put enforcement in the SWA API or configured route auth. Client-side hiding is not security.
- Throw on failed required reads, writes, auth, and parsing. Do not swallow failures as empty data unless the feature is explicitly best-effort.
- Use runtime validation only for user input, URL params that control behaviour, local config that can be wrong, data that crosses into an API write, or security/data-loss paths.
- Do not validate, normalize, or reformat values just because it is possible.
- Do not copy Dataverse browser calls, `window.Xrm`, Power Pages `_api`, or Power Apps generated services into this app.

<!-- figma-host -->
There is no host chrome. The Figma frame is the app.

<!-- checks-extra -->
- SWA CLI smoke test when `staticwebapp.config.json` or `/api` routing changes
