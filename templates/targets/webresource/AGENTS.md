## Purpose

This is a Dynamics 365 / Dataverse web resource template using React + TypeScript + Vite.
Treat it as a **Dynamics-hosted frontend** — not a generic SPA. Do not modernise it into something else unless explicitly asked.

The default philosophy is: keep the app small, readable, and easy to ship into Dynamics. Prefer obvious code, existing components, and the template's established runtime patterns over broad abstractions or clever defensive layers.

---

## Hard Constraints

1. **Dynamics runtime must keep working** — preserve `window.parent.Xrm`/`window.top.Xrm` detection and `ClientGlobalContext.js.aspx` where present.
2. **Local dev must keep working** — `token.json` drives local auth; never bundle it into output or commit real values.
3. **Build output must stay web-resource-friendly** — predictable filenames, no uncontrolled chunking, deployable via Webresource Manager or pipeline upload.
4. **Keep it client-side** — no SSR, no Next.js, no backend coupling unless explicitly requested.
5. **Make surgical changes** — extend existing patterns before inventing new ones; don't refactor unrelated areas.

---

## Runtime Modes

**Dynamics-hosted:** detect via `window.parent.Xrm`, derive base URL from `getGlobalContext().getClientUrl()`, no bearer token needed.

**Local dev:** load `token.json` dynamically, use bearer token, call Dataverse directly.

Never mix the two modes or duplicate their logic — reuse `authService.ts`.

---

## Critical Files — Don't Break These

| File | Why it matters |
|---|---|
| `src/services/authService.ts` | Single source of truth for env detection, base URL, and auth headers |
| `src/main.tsx` | App bootstrap — preserve providers and theme imports |
| `vite.config.ts` | Controls deployment shape: `base: "./"`, predictable output names, `main.css` |
| `index.html` | Dynamics integration boundary — may inject `ClientGlobalContext.js.aspx` |
| `token.json` | Local dev only — never commit real values, never bundle |

---

## API / Data Access

- Put reusable API logic in `src/services`
- Always reuse `getApiUrl()` and `getAuthHeaders()` — never duplicate them
- Use narrow `$select` queries; throw on non-OK responses
- No raw fetch calls scattered across UI components
- Use Zod for validation where data crosses a boundary: form inputs, URL/search params, config, and Dataverse/API responses that the UI depends on
- Keep service functions boring and explicit: one fetch function, one hook, one mutation where needed
- Do not add repository/client layers unless the app has enough repeated API logic to justify them

**Preferred pattern:**
```ts
// {entity}Service.ts — fetch function + TanStack Query hook
// invalidate relevant queryKey on mutation success
```

See the example at the bottom of this file.

---

## State Management

- **TanStack Query** → server state
- **Zustand** → shared client state
- **Local component state** → local UI behaviour
- No Redux unless explicitly requested; don't store server state in Zustand

---

## UI & Styling

- Kendo UI or Shadcn/ui — stay consistent with whichever the project uses; don't mix UI systems unless explicitly asked.
- If the project uses Shadcn/ui, use Shadcn components from `@/components/ui` and style them with Tailwind utility classes.
- If the project uses Kendo UI, use Kendo React components for controls, grids, menus, dialogs, inputs, and other rich UI. Use Tailwind for layout, spacing, and local composition around those components.
- Tailwind is the default styling approach for both Shadcn/ui and Kendo projects; preserve `main.css` output.
- Do not hand-roll component styling or custom CSS unless Tailwind/component props cannot reasonably express the requirement.
- Prefer existing component APIs, theme tokens, variants, and utility helpers before creating new wrappers.
- Keep screen layouts practical for embedded Dynamics use: compact, scannable, responsive, and not marketing-page styled.

---

## Code Shape

- Keep code simple and readable. A future maintainer should understand the main path quickly.
- Avoid over-engineering: no generic frameworks, broad factories, speculative abstractions, or excessive configuration for small features.
- Avoid being overly defensive. Validate real external inputs and API responses where useful, but don't wrap every local value in ceremony.
- Prefer direct, typed functions over classes unless the existing code already uses classes for that concern.
- Keep React components focused: UI in components, reusable data access in services, shared client state in Zustand only when local state is no longer enough.
- Make the smallest change that solves the request cleanly.

---

## What To Avoid

Unless explicitly asked: don't replace Vite, don't add SSR, don't remove Dynamics runtime logic, don't remove the local token flow, don't hardcode org-specific values, don't rename output files in ways that complicate deployment.

---

## Example Service Pattern

```ts
import { getApiUrl, getAuthHeaders } from "@/services/authService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Account {
  accountid: string;
  name?: string | null;
}

export const listAccounts = async (): Promise<Account[]> => {
  const res = await fetch(
    `${getApiUrl()}/accounts?$select=accountid,name&$top=50`,
    { headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.status}`);
  return (await res.json()).value as Account[];
};

export const useAccounts = () =>
  useQuery({ queryKey: ["accounts"], queryFn: listAccounts });

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      patchAccount(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
};
```
