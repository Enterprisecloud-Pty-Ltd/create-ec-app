## Purpose

This repository is an Azure Static Web Apps frontend using React, TypeScript, and Vite.

Treat it as a static Azure-hosted SPA. Keep it small, readable, and easy to deploy.

Use the global AGENTS.md rules first. This file adds project-specific constraints.

## Hard Constraints

- Keep Static Web Apps hosting working.
- Keep local Vite development working.
- Keep SPA routing fallback working.
- Keep the app client-side unless an Azure Functions API already exists or is explicitly requested.
- Make surgical changes.

Do not add Dynamics `Xrm`, `token.json`, Power Pages ADAL, or Power Apps code app SDK patterns unless the target changes.

## Runtime Modes

The app supports two modes.

### Static Web Apps-hosted

- Build output is served from `dist`.
- Preserve `staticwebapp.config.json`.
- Keep `navigationFallback` when the app uses client-side routing.
- Use `staticwebapp.config.json` for SWA routes, auth, headers, response overrides, and fallback rules.
- Do not add deprecated `routes.json`.
- Do not rely on client-only route guards for sensitive data. Backend APIs must enforce auth/roles.

### Local dev

- Use Vite for normal UI development.
- Use the Static Web Apps CLI only when testing SWA routing, auth, or `/api` integration locally.
- Keep `swa-cli.config.json` aligned with the Vite dev server and `dist` output.
- Do not require a deployed Azure Static Web App for ordinary component work.

## Critical Files

| File | Rule |
|---|---|
| `staticwebapp.config.json` | Static Web Apps routing/auth/fallback boundary. Preserve SPA fallback unless routing is removed. |
| `swa-cli.config.json` | Local SWA CLI configuration. Keep `appDevserverUrl`, build command, and output location accurate. |
| `vite.config.ts` | Preserve React, Tailwind, alias, and any existing build assumptions. |
| `src/main.tsx` | Preserve bootstrap, providers, and global theme/style imports. |
| `package.json` | Keep SWA CLI scripts/dependencies only if the project uses them. |
| `api/` | Only add or change when the app actually has a Static Web Apps API requirement. |

## API and Data Access

Prefer direct, boring calls to the app's own API or public endpoints.

Use:

- relative `/api/...` calls for Static Web Apps managed APIs
- explicit response types near the call site
- narrow payloads
- direct `fetch` inside service files
- clear `response.ok` checks with useful status text
- `import.meta.env.VITE_*` only for public browser-safe values

Avoid:

- putting secrets in client-side environment variables
- direct Dataverse browser calls copied from webresource projects
- `window.Xrm`
- Power Pages `_api` assumptions
- Power Apps generated service assumptions
- generic API clients for one or two endpoints
- silent fallbacks for failed required calls

If the app needs private data, put the enforcement in the SWA API or configured route auth. Client-side hiding is not security.

## Validation

Use TypeScript types for trusted internal data and vendor-shaped responses.

Use runtime validation only when the current feature needs it, such as:

- user-entered form data
- URL/search parameters that control behavior
- local config that can be wrong
- data that crosses into an API write
- security-sensitive or data-loss-prone paths

Do not validate, normalize, or reformat values just because it is possible.

## Services, Queries, and Mutations

Keep service files explicit.

Preferred shape:

- one fetch/save function for the operation
- one TanStack Query hook when components need it
- one mutation hook when mutation state or invalidation is needed
- query keys colocated with the hook when reused for invalidation
- UI that consumes async data should handle loading, error, empty, and success states when each state affects the workflow

Do not create wrapper chains such as:

```text
resolveConfig -> normalizeInput -> validateInput -> buildRequest -> executeRequest
```

Prefer direct flow:

```text
read env/config -> fetch -> check response -> return typed data
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
- Keep layouts compact, responsive, and suitable for a hosted business app.

## Accessibility

- Use semantic HTML.
- Use buttons for actions and links for navigation.
- Keep input labels, accessible names, dialog titles, and keyboard support intact.
- Do not remove shadcn/Radix or Kendo accessibility behavior while restyling.

## Code Shape

Prefer:

- focused React components
- direct typed functions
- existing services and components
- small local helpers only when they remove real duplication or name non-obvious domain logic
- feature folders only when a feature owns multiple pieces such as API, hooks, components, types, or schemas

Avoid:

- broad factories
- generic service clients
- classes for simple service logic
- excessive configuration
- defensive wrappers around every value
- broad refactors while adding a feature
- moving code into shared `common` or `lib` before there is a second caller

## Feature and Routing Shape

Keep small apps flat. Use feature folders when a feature owns enough surface area to group its page, UI, data access, hooks, and types.

Example:

```text
src/
  features/
    accounts/
      pages/
        accounts-page.tsx
      components/
        accounts-table.tsx
      api/
        accounts.api.ts
      hooks/
        use-accounts.ts
      types/
        account.types.ts
```

Use only folders that contain real files. Flatten the example when the feature is small.

When React Router or another router is present:

- keep route definitions in one obvious place, such as `src/routes.tsx` or `src/router/routes.tsx`
- keep page components thin; they read route/search params and compose feature components
- parse URL params at the route/page boundary, then pass typed values down
- keep `staticwebapp.config.json` `navigationFallback` aligned with client-side routes
- do not add a router for a single screen that local state can handle

## Error Handling

Required reads, saves, deletes, uploads, downloads, auth failures, and required parsing failures should throw.

Do not swallow failed fetches and treat them as empty data unless the requirement explicitly says the feature is best-effort.

Include response status and useful response text where practical.

## Build and Deployment

Do not replace Vite, add SSR, add Next.js, or introduce backend coupling unless explicitly asked.

Keep `staticwebapp.config.json` deployable at the output root. If the build flow changes, verify the SWA config still reaches `dist`.

## Checks

Run the smallest relevant command for the changed area, such as:

- typecheck
- lint
- targeted tests
- Vite build when deployment shape could be affected
- SWA CLI smoke test when `staticwebapp.config.json` or `/api` routing changes

Do not run broad expensive checks unless the change touches shared infrastructure or the project requires it.

## Figma MCP

When using the Figma MCP server, ensure that you are not just blindly copying the designs. Take note and always place a focus on the following:

- Ensure responsiveness on all screen sizes
- If there are icons as part of the design, use those, don't blindly look for Lucide-React equivalents.
- Use the exact colours in the design. Don't make up your own.
