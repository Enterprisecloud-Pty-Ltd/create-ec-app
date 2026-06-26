## Purpose

This repository is a Power Pages single-page application using React, TypeScript, and Vite.

Treat it as a Power Pages code site. Keep it small, readable, and easy to upload to Power Pages.

Use the global AGENTS.md rules first. This file adds project-specific constraints.

## Hard Constraints

- Keep Power Pages code-site deployment working.
- Keep Power Pages `_api` access working.
- Keep local Vite development working.
- Keep the app client-side.
- Make surgical changes.

Do not add Dynamics `Xrm`, `token.json`, Static Web Apps routing, or Power Apps code app SDK patterns unless the target changes.

## Runtime Modes

The app supports two modes.

### Power Pages-hosted

- Run as a browser SPA hosted by Power Pages.
- Use Power Pages `_api` for Dataverse access from the site.
- Rely on Power Pages web roles, table permissions, and site settings for data authorization.
- Preserve code-site build output and `powerpages.config.json`.
- Do not call the Dataverse organization Web API directly from the browser.
- Do not assume `window.Xrm` or model-driven app context exists.

### Local dev

- Use Vite for local UI development.
- Use the existing Vite `/_api` proxy when local code needs to call a Power Pages site.
- Keep the proxy target explicit and environment-specific.
- Use the existing `AuthContext` flow only where this template already requires it.
- Never commit client secrets, tenant-specific secrets, or real token values.

Do not mix Power Pages auth with webresource `authService.ts` or `token.json`.

## Critical Files

| File | Rule |
|---|---|
| `src/context/AuthContext.tsx` | Current auth boundary for this template. Reuse it; do not add a second auth system. |
| `src/main.tsx` | Preserve `AuthProvider`, `QueryClientProvider`, bootstrap, and global style imports. |
| `vite.config.ts` | Preserve React, Tailwind, alias, and the `/_api` dev proxy when API calls are used locally. |
| `powerpages.config.json` | Power Pages code-site configuration. Keep compiled path and landing page accurate. |
| `src/App.tsx` | Keep app behavior client-side and provider-aware. |

## API and Data Access

Prefer direct, boring Power Pages Web API calls.

Use:

- relative `_api/...` URLs
- the existing auth context only where the current template flow already uses it
- Power Pages request verification/CSRF handling where the portal Web API requires it
- Power Pages table permissions and web roles for authorization
- narrow `$select` queries
- `URLSearchParams` for normal query parameters
- direct `fetch` inside service files
- small TypeScript interfaces for response shapes
- clear `response.ok` checks with useful status text

Avoid:

- direct calls to `https://<org>.crm*.dynamics.com/api/data/v9.2` from the browser
- duplicated auth contexts
- raw fetch calls inside UI components
- repository/client layers for small features
- generic OData builders
- Zod schemas for every Power Pages response
- GUID or logical-name regex validation by default
- silent fallbacks for failed Power Pages calls

For known tables, use known entity set names. Fetch metadata only when the feature truly supports arbitrary table names.

Escape OData string literals when interpolating inside quoted OData expressions. Do not create a broad escaping/parsing layer for simple queries.

## Validation

Use TypeScript types for normal Power Pages Web API response shapes.

Use runtime validation only when the current feature needs it, such as:

- user-entered form data
- URL/search parameters that control behavior
- local config that can be wrong
- genuinely variable API data where the UI must branch safely
- security-sensitive or data-loss-prone paths

Do not validate values just because they are shaped like GUIDs, logical names, dates, URLs, or enum strings. If Power Pages or Dataverse will reject the value clearly and there is no local UX/security need, pass it through.

Do not normalize strings by default. Trim, lowercase, strip braces, or reformat only when the app has a known input source that sends multiple formats.

## Services, Queries, and Mutations

Keep service files explicit.

Preferred shape:

- one fetch/save function for the operation
- one TanStack Query hook when components need it
- one mutation hook when mutation state or invalidation is needed
- query keys colocated with the hook when reused for invalidation

Do not create wrapper chains such as:

```text
resolveConfig -> normalizeInput -> validateInput -> resolveMetadata -> buildRequest -> executeRequest
```

Prefer direct flow:

```text
read auth/context -> fetch -> check response -> return typed data
```

## State Management

- Use TanStack Query for server state.
- Use local component state for local UI behavior.
- Use Zustand only for shared client state that has outgrown local state.
- Do not store server state in Zustand.
- Do not add Redux unless explicitly requested.

## UI and Styling

Stay consistent with the project's existing UI system.

- Shadcn/ui projects: use existing `@/components/ui` components and Tailwind utilities.
- Kendo projects: use Kendo React components for rich controls and Tailwind for layout/composition.
- Preserve the existing theme and global CSS imports.
- Do not mix UI systems unless explicitly asked.
- Do not hand-roll custom CSS unless component props and Tailwind are not enough.
- Keep layouts compact, scannable, responsive, and suitable for Power Pages.

## Code Shape

Prefer:

- focused React components
- direct typed functions
- existing auth, services, and components
- small local helpers only when they remove real duplication or name non-obvious domain logic
- explicit Power Pages table/field handling over generic frameworks

Avoid:

- broad factories
- generic service clients
- classes for simple service logic
- excessive configuration
- defensive wrappers around every value
- broad refactors while adding a feature

## Error Handling

Power Pages reads, saves, deletes, uploads, downloads, auth failures, and required parsing failures should throw.

Do not swallow failed fetches and treat them as "not found" unless the requirement explicitly says the feature is best-effort.

Include response status and useful response text where practical.

## Build and Deployment

Do not replace Vite, add SSR, add Next.js, change the code-site output shape, or introduce backend coupling unless explicitly asked.

Keep output deployable through the Power Pages code-site flow and keep `powerpages.config.json` aligned with the built `dist` folder.

## Checks

Run the smallest relevant command for the changed area, such as:

- typecheck
- lint
- targeted tests
- Vite build when deployment shape could be affected
- local `/_api` proxy smoke test when API routing changes

Do not run broad expensive checks unless the change touches shared infrastructure or the project requires it.

## Figma MCP

When using the Figma MCP server, ensure that you are not just blindly copying the designs. Take note and always place a focus on the following:

- Ensure responsiveness on all screen sizes
- If there are icons as part of the design, use those, don't blindly look for Lucide-React equivalents.
- Use the exact colours in the design. Don't make up your own.
