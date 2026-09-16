## Purpose

This repository is a Dynamics 365 / Dataverse web resource using React, TypeScript, and Vite.

Treat it as a Dynamics-hosted frontend, not a generic SPA. Keep it small, readable, and easy to ship into Dynamics.

## Hard constraints

- Keep Dynamics runtime support, local development, and web-resource-friendly build output working.
- Keep the app client-side.
- Do not modernize the project into a different architecture unless explicitly asked.
- Keep changes focused on the requested work.
- Do not add backend APIs, server-side processing, authentication layers beyond `AuthService.ts`, or new state management libraries unless explicitly requested.
- Do not refactor working code merely to adopt a newer architecture or pattern.

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

## Critical files

Preserve these integration boundaries. Prefer feature files for new behaviour. Edit these files only when the requested work requires it or a demonstrated bug needs fixing; do not assume they are correct without inspecting them.

| File | Rule |
|---|---|
| `src/services/AuthService.ts` | Single source of truth for runtime detection, base URL, and auth headers. Reuse `getApiUrl()` and `getAuthHeaders()` in every data service; do not duplicate this logic. |
| `src/main.tsx` | Preserve bootstrap, providers, and global theme/style imports. |
| `vite.config.ts` | Preserve `base: "./"`, predictable filenames, and `main.css`. |
| `index.html` | Dynamics integration boundary. Preserve `ClientGlobalContext.js.aspx` where present. |
| `token.json` | Local dev only. Never commit real values or bundle it. |

## Routing and deployment

Prefer hash or search-param routing unless the Dynamics host URL is proven to support browser history routing.

Keep output deployable through Webresource Manager or the existing pipeline. Do not replace Vite, add SSR, add Next.js, change output names, enable uncontrolled chunking, or introduce backend coupling unless asked.

## Data access

Prefer direct Dataverse Web API calls via `getApiUrl()` and `getAuthHeaders()`.

- Put `fetch` in service files, not UI components.
- Use narrow `$select` queries and `URLSearchParams` for normal query parameters.
- Use small TypeScript interfaces for response shapes. Check `response.ok` with useful status text.
- For known tables, use known entity set names. Fetch metadata only when the feature supports arbitrary logical names.
- Do not cache entity metadata unless repeated API cost is demonstrated.
- Escape OData string literals when interpolating inside quoted OData expressions. Do not build a broad escaping layer.
- Do not add repository layers, generic OData builders, Zod schemas for every response, or GUID/logical-name regex validation by default.
- Prefer explicit table and field handling over generic frameworks.

## Validation

Use TypeScript types for normal Dataverse response shapes. Types describe the expected response; they do not validate runtime data.

- Use runtime validation when the feature needs it: user-entered form data, URL/search params that control behaviour, local config that can be wrong, genuinely variable API data where the UI must branch safely, or security-sensitive/data-loss-prone paths.
- Do not validate values just because they look like GUIDs, logical names, dates, URLs, or enum strings. If Dataverse rejects the value clearly and there is no local UX or security need, pass it through.
- Do not normalize strings by default. Trim, lowercase, strip braces, or reformat only when a known input source sends multiple formats.

## Error handling

Dataverse reads, saves, deletes, uploads, downloads, auth failures, and required parsing failures should throw. Include the response status and useful response text where practical.

Do not swallow failures or treat failed fetches as "not found" or empty data unless the requirement explicitly makes the operation best-effort.

## Example service pattern

This example reads up to 50 accounts. Follow Dataverse paging when the feature needs all results. Define update payloads from editable fields rather than using `Partial<Account>`, which also permits record identifiers and read-only fields.

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiUrl, getAuthHeaders } from "@/services/AuthService";

interface Account {
  accountid: string;
  name?: string | null;
}

interface AccountUpdate {
  name: string;
}

export const listAccounts = async (): Promise<Account[]> => {
  const params = new URLSearchParams({ $select: "accountid,name", $top: "50" });
  const response = await fetch(`${getApiUrl()}/accounts?${params}`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch accounts (${response.status}): ${await response.text()}`,
    );
  }

  const accounts = (await response.json()) as { value: Account[] };
  return accounts.value;
};

const accountsQueryKey = ["accounts"] as const;

export const useAccounts = () =>
  useQuery({ queryKey: accountsQueryKey, queryFn: listAccounts });

export const patchAccount = async (
  id: string,
  changes: AccountUpdate,
): Promise<void> => {
  const response = await fetch(`${getApiUrl()}/accounts(${id})`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update account (${response.status}): ${await response.text()}`,
    );
  }
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: AccountUpdate }) =>
      patchAccount(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
  });
};
```

<!-- figma-host -->
For a full-screen Figma design, split Dynamics chrome (sitemap, header, form, dialog) from the web resource canvas before implementation.

<!-- checks-extra -->
