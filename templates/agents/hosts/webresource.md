## Purpose

This repository is a Dynamics 365 / Dataverse web resource using React, TypeScript, and Vite.

Treat it as a Dynamics-hosted frontend, not a generic SPA. Keep it small, readable, and easy to ship into Dynamics.

## Hard constraints

- Keep Dynamics runtime support, local development, and web-resource-friendly build output working.
- Keep the app client-side.
- Do not modernize the project into a different architecture unless explicitly asked.
- Make surgical changes unless the task is implementing a Figma screen.

## Runtime

The app supports two modes. Do not mix them. Do not duplicate runtime detection. Reuse `AuthService.ts`.

### Dynamics-hosted

- Detect Dynamics through `window.top?.Xrm`.
- Derive the base URL from `Xrm.Utility.getGlobalContext().getClientUrl()`.
- Do not add bearer-token auth in hosted mode.
- Preserve `ClientGlobalContext.js.aspx` where the project uses it.

### Local dev

- Use `token.json` for local auth only. Load it dynamically.
- Never commit real token values or bundle `token.json` into deployment output.

| File | Rule |
|---|---|
| `src/services/AuthService.ts` | Runtime detection, base URL, and auth headers. |
| `src/main.tsx` | Preserve bootstrap, providers, and global theme/style imports. |
| `vite.config.ts` | Preserve `base: "./"`, predictable filenames, and `main.css`. |
| `index.html` | Dynamics integration boundary. Preserve `ClientGlobalContext.js.aspx` where present. |
| `token.json` | Local dev only. Never commit real values or bundle it. |

Prefer hash or search-param routing unless the Dynamics host URL is proven to support browser history routing.

Keep output deployable through Webresource Manager or the existing pipeline. Do not replace Vite, add SSR, add Next.js, change output names, enable uncontrolled chunking, or introduce backend coupling unless asked.

## Data access

Prefer direct Dataverse Web API calls via `getApiUrl()` and `getAuthHeaders()`.

- Put `fetch` in service files, not UI components.
- Use narrow `$select` queries and `URLSearchParams` for normal query parameters.
- Use small TypeScript interfaces for response shapes. Check `response.ok` with useful status text.
- For known tables, use known entity set names. Fetch metadata only when the feature supports arbitrary logical names.
- Escape OData string literals when interpolating inside quoted OData expressions. Do not build a broad escaping layer.
- Throw on failed Dataverse reads, writes, auth, and required parsing. Do not swallow failures as "not found" unless the feature is explicitly best-effort.
- Do not add repository layers, generic OData builders, Zod schemas for every response, or GUID/logical-name regex validation by default.
- Use runtime validation only for user input, URL params that control behaviour, local config that can be wrong, or security/data-loss paths.
- Do not normalize strings by default.

<!-- figma-host -->
For a full-screen Figma design, split Dynamics chrome (sitemap, header, form, dialog) from the web resource canvas before implementation.

<!-- checks-extra -->
