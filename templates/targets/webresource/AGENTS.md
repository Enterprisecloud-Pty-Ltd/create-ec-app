## Purpose

This repository is a Dynamics 365 / Dataverse web resource using React, TypeScript, and Vite.

Treat it as a Dynamics-hosted frontend, not a generic SPA. Keep it small, readable, and easy to ship into Dynamics.

Use the global AGENTS.md rules first. This file adds project-specific constraints.

## Hard Constraints

- Keep Dynamics runtime support working.
- Keep local development support working.
- Keep build output web-resource-friendly.
- Keep the app client-side.
- Make surgical changes.

Do not modernize the project into a different architecture unless explicitly asked.

## Runtime Modes

The app supports two modes.

### Dynamics-hosted

- Detect Dynamics through the existing `window.parent.Xrm` / `window.top.Xrm` pattern.
- Derive the base URL from `Xrm.Utility.getGlobalContext().getClientUrl()`.
- Do not add bearer-token auth in hosted mode.
- Preserve `ClientGlobalContext.js.aspx` where the project uses it.

### Local dev

- Use `token.json` for local auth only.
- Load `token.json` dynamically.
- Never commit real token values.
- Never bundle `token.json` into deployment output.

Do not mix the two modes. Do not duplicate runtime detection. Reuse `AuthService.ts`.

## Critical Files

| File | Rule |
|---|---|
| `src/services/AuthService.ts` | Single source of truth for runtime detection, base URL, and auth headers. |
| `src/main.tsx` | Preserve bootstrap, providers, and global theme/style imports. |
| `vite.config.ts` | Preserve Dynamics-friendly output: `base: "./"`, predictable filenames, and `main.css`. |
| `index.html` | Treat as the Dynamics integration boundary. Preserve `ClientGlobalContext.js.aspx` where present. |
| `token.json` | Local dev only. Never commit real values or bundle it. |

## API and Data Access

Prefer direct, boring Dataverse Web API calls.

Use:

- `getApiUrl()`
- `getAuthHeaders()`
- narrow `$select` queries
- `URLSearchParams` for normal query parameters
- direct `fetch` inside service files
- small TypeScript interfaces for response shapes
- clear `response.ok` checks with useful status text

Avoid:

- raw fetch calls inside UI components
- duplicated auth or base URL logic
- repository/client layers for small features
- metadata resolvers unless arbitrary table names are a real requirement
- entity caches unless repeated metadata/API cost is demonstrated
- generic OData builders
- Zod schemas for every Dataverse response
- GUID or logical-name regex validation by default
- silent fallbacks for failed Dataverse calls

For known tables, use known entity set names. Fetch metadata only when the feature truly supports arbitrary entity logical names.

Escape OData string literals when interpolating inside quoted OData expressions. Do not create a broad escaping/parsing layer for simple queries.

## Validation

Use TypeScript types for normal Dataverse response shapes.

Use runtime validation only when the current feature needs it, such as:

- user-entered form data
- URL/search parameters that control behavior
- local config that can be wrong
- genuinely variable API data where the UI must branch safely
- security-sensitive or data-loss-prone paths

Do not validate values just because they are shaped like GUIDs, logical names, dates, URLs, or enum strings. If Dataverse will reject the value clearly and there is no local UX/security need, pass it through.

Do not normalize strings by default. Trim, lowercase, strip braces, or reformat only when the app has a known input source that sends multiple formats.

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
resolveConfig -> normalizeInput -> validateInput -> resolveMetadata -> buildRequest -> executeRequest
```

Prefer direct flow:

```text
read config -> fetch -> check response -> return typed data
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
- Preserve the existing theme and `main.css` output.
- Do not mix UI systems unless explicitly asked.
- Do not hand-roll custom CSS unless component props and Tailwind are not enough.
- Keep layouts compact, scannable, responsive, and suitable for embedded Dynamics screens.

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
- explicit Dataverse table/field handling over generic frameworks
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
- prefer hash/search-param routing for embedded webresources unless the Dynamics host URL is proven to support browser history routing
- do not add a router for a single screen that local state can handle

## Error Handling

Dataverse reads, saves, deletes, uploads, downloads, auth failures, and required parsing failures should throw.

Do not swallow failed fetches and treat them as “not found” unless the requirement explicitly says the feature is best-effort.

Include response status and useful response text where practical.

## Build and Deployment

Do not replace Vite, add SSR, add Next.js, change output names, enable uncontrolled chunking, or introduce backend coupling unless explicitly asked.

Keep output deployable through Webresource Manager or the existing pipeline.

## Checks

Run the smallest relevant command for the changed area, such as:

- typecheck
- lint
- targeted tests
- Vite build when deployment shape could be affected

Do not run broad expensive checks unless the change touches shared infrastructure or the project requires it.

## Example Service Pattern

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiUrl, getAuthHeaders } from "@/services/AuthService";

export interface Account {
  accountid: string;
  name?: string | null;
}

export const listAccounts = async (): Promise<Account[]> => {
  const response = await fetch(
    `${getApiUrl()}/accounts?$select=accountid,name&$top=50`,
    { headers: await getAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch accounts: ${response.status}`);
  }

  const data = (await response.json()) as { value: Account[] };
  return data.value;
};

const accountsQueryKey = ["accounts"] as const;

export const useAccounts = () =>
  useQuery({ queryKey: accountsQueryKey, queryFn: listAccounts });

export const patchAccount = async (
  id: string,
  data: Partial<Account>,
): Promise<void> => {
  const response = await fetch(`${getApiUrl()}/accounts(${id})`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update account: ${response.status}`);
  }
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      patchAccount(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
  });
};
```

## Figma MCP
When using the Figma MCP server, ensure that you are not just blindly copying the designs. Take note and always place a focus on the following:

- Ensure responsiveness on all screen sizes
- If there are icons as part of the design, use those, don't blindly look for Lucide-React equivalents.
- Use the exact colours in the design. Don't make up your own.

## Tooling and maintenance

Read [docs/tooling.md](docs/tooling.md) before changing compiler, lint, build, or UI dependencies. This path is relative to the generated application's root; the source guide lives in `templates/base/docs/tooling.md` in `create-ec-app`. It covers the TypeScript compatibility aliases, editor setup, and separate PCF toolchain. For shared template upgrades, use `$update-templates` in the `create-ec-app` repository.

## Changelog

Keep dated entries for material changes to this app's tooling or agent instructions. Record the reason and checks performed; label inherited template history separately from changes made in this app.

### 2026-09-05 — Template baseline

- Adopted TypeScript 7 and Oxlint while retaining React Hooks, Fast Refresh, React Compiler, and TanStack Query lint protection.
- Added editor settings and `docs/tooling.md`; PCF wrappers retain their separate TypeScript 5.9 toolchain.
- The generator's Node 26 validation passed all eight target/UI builds and lint checks, both PCF wrappers, and lint regression fixtures. This does not verify this application's future changes or live deployment.
