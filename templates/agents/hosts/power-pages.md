## Purpose

This repository is a Power Pages single-page application using React, TypeScript, and Vite.

Treat it as a Power Pages code site. Keep it small, readable, and easy to upload to Power Pages.

## Hard constraints

- Keep Power Pages code-site deployment, `_api` access, and local Vite development working.
- Keep the app client-side.
- Do not add Dynamics `Xrm`, `token.json`, Static Web Apps routing, or Power Apps code app SDK patterns unless the target changes.
- Make surgical changes unless the task is implementing a Figma screen.

## Runtime

### Power Pages-hosted

- Run as a browser SPA hosted by Power Pages.
- Use Power Pages `_api` for Dataverse access from the site.
- Rely on Power Pages web roles, table permissions, and site settings for data authorization.
- Preserve code-site build output and `powerpages.config.json`.
- Do not call the Dataverse organization Web API directly from the browser.
- Do not assume `window.Xrm` or model-driven app context exists.

### Local dev

- Use Vite for local UI development.
- Use the existing Vite `/_api` proxy when local code needs to call a Power Pages site. Keep the proxy target explicit and environment-specific.
- Use the existing `AuthContext` flow only where this template already requires it.
- Never commit client secrets, tenant-specific secrets, or real token values.
- Do not mix Power Pages auth with webresource `AuthService.ts` or `token.json`.

| File | Rule |
|---|---|
| `src/context/AuthContext.tsx` | Current auth boundary. Reuse it; do not add a second auth system. |
| `src/main.tsx` | Preserve `AuthProvider`, `QueryClientProvider`, bootstrap, and global style imports. |
| `vite.config.ts` | Preserve React, Tailwind, alias, and the `/_api` dev proxy when API calls are used locally. |
| `powerpages.config.json` | Keep compiled path and landing page accurate. |
| `src/App.tsx` | Keep app behaviour client-side and provider-aware. |

Keep client routes separate from Power Pages `_api` calls and code-site deployment paths.

Do not replace Vite, add SSR, add Next.js, change the code-site output shape, or introduce backend coupling unless asked. Keep `powerpages.config.json` aligned with the built `dist` folder.

## Data access

Prefer direct Power Pages Web API calls.

- Use root-relative `/_api/...` URLs.
- Use the existing auth context only where the current template flow already uses it.
- Handle Power Pages request verification/CSRF where the portal Web API requires it.
- Put `fetch` in service files, not UI components.
- Use narrow `$select` queries and `URLSearchParams` for normal query parameters.
- Use small TypeScript interfaces for response shapes. Check `response.ok` with useful status text.
- For known tables, use known entity set names. Fetch metadata only when the feature supports arbitrary table names.
- Escape OData string literals when interpolating inside quoted OData expressions. Do not build a broad escaping layer.
- Throw on failed Power Pages reads, writes, auth, and required parsing. Do not swallow failures as "not found" unless the feature is explicitly best-effort.
- Do not add a second auth context, repository layers, generic OData builders, Zod schemas for every response, or GUID/logical-name regex validation by default.
- Use runtime validation only for user input, URL params that control behaviour, local config that can be wrong, or security/data-loss paths.
- Do not normalize strings by default.

<!-- figma-host -->
For a full-screen Figma design, split Power Pages site header, navigation, and other site chrome from the code-site app before implementation.

<!-- checks-extra -->
- local `/_api` proxy smoke test when API routing changes
