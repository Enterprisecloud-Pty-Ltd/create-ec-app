## UI

Stay consistent with the project's existing UI system.

- Shadcn/ui: use existing `@/components/ui` components and Tailwind utilities.
- Kendo: use Kendo React for rich controls and Tailwind for layout.
- Preserve the existing theme and global CSS imports.
- Do not mix UI systems unless explicitly asked.
- Keep imported UI components on their existing variants. Use `className` for layout only. Add a component variant or edit the owned component source when the design requires a new appearance.
- Use theme colour and spacing tokens. Keep Tailwind class names static so lint and Tailwind can resolve them.
- Use component props and Tailwind before adding custom CSS. Keep layouts compact, scannable, and responsive.
- Respect the project's Oxlint configuration, including `@shadcn/lint` rules. Fix violations rather than disabling rules to accommodate UI changes.

When implementing or reviewing a Figma design, treat Figma as the visual source of truth.

- Use the Figma MCP `get_design_context` tool when it is available. Query the target frame before editing code. If the response is sparse, drill into child nodes. Do not infer missing values from screenshots.
- Figma wins on colour, type, space, radius, shadow, icon/image, and layout at the reference viewport.
- The project UI kit wins on interaction primitives (button, input, dialog, menu). Restyle those components; do not rebuild them.
- Hand-authored CSS or SVG is allowed when the kit cannot express the spec. Do not substitute Unicode characters, library icons, or hand-authored SVG based only on a similar name or appearance.
- Download and use the exported Figma asset for every icon or image unless an existing project asset is visually identical.
- Confirm the requested font is actually rendered. Declaring a font family is not enough if the browser falls back.
- Semantic HTML, buttons for actions, links for navigation, labels, and keyboard support still apply when Figma is visual-only. Do not remove shadcn/Radix or Kendo accessibility behaviour while restyling.
- Preserve hierarchy and placement. Do not move, merge, remove, or reinterpret elements unless the user asks for a design change.
- Match the documented Figma viewport exactly. Keep other viewports usable if Figma does not define them.
- Do not describe a UI as matching Figma while any visible value or asset is inferred, approximated, or unverified.

{{FIGMA_HOST}}

## Code shape

Prefer focused React components, direct typed functions, and existing services.

- Use small local helpers when they remove real duplication or name non-obvious domain logic.
- Prefer composition over inheritance. Extract components when repeated UI or a meaningful responsibility makes the boundary useful; do not enforce a fixed caller count.
- Avoid broad factories, excessive configuration, wrapper chains, HOCs for simple UI needs, and classes for simple service logic.
- Do not refactor working code to a different pattern or reorganize files for cleanliness while adding a feature.
- Keep changes focused on the requested work, including when implementing a Figma screen.

## State, queries, and mutations

- Use TanStack Query for server state and local component state for local UI.
- Use Zustand only for shared client state that has outgrown local state. Do not store server state in Zustand. Do not add Redux unless asked.
- One fetch/save function per operation, with a query or mutation hook when the UI needs that state. Colocate query keys with the hook when they are reused for invalidation.
- Handle loading, error, empty, and success when each state affects the workflow.
- Keep service flow direct: read config, fetch, check the response, return typed data. Do not split each step into a wrapper.

## Feature and routing shape

- Keep small apps flat. Use feature folders when a feature owns multiple related files such as API calls, hooks, components, types, or pages.
- Colocate related files. Create only folders that contain real files and follow the existing project structure.
- Do not move code into shared `lib`, `common`, or `utils` folders before there is a second caller. Reuse existing shared utilities.
- Keep route definitions in one obvious place when a router is present.
- Keep page components thin: read route/search params and compose feature components. Parse URL params at the page boundary, then pass typed values down.
- Follow the host's routing constraints. Do not add a router for a single screen that local state can handle.

## Work and clarification

- Proceed with requested features and fixes that follow the existing architecture, including necessary dependency or configuration edits within that scope.
- Preserve the responsibilities of the host's critical files. Change them only when required by the task or a demonstrated bug, and verify the affected behaviour.
- Ask when missing information materially affects correctness, scope, or consequences. Do not ask again for work already authorized.
- Obtain explicit direction before changing architecture, replacing the UI system, or introducing a new authentication approach beyond the requested scope.
- Obtain explicit confirmation of the target environment and action before changing production systems or data, or deploying to production.

## Checks

Run the smallest relevant command for the changed area:

- typecheck
- lint
- targeted tests
- Vite build when deployment shape could be affected
{{CHECKS_EXTRA}}- when the work implements a Figma design: compare the running UI at the reference viewport and verify key computed styles and dimensions in the browser

Do not run broad expensive checks unless the change touches shared infrastructure or the project requires it.

## Tooling and maintenance

Read [docs/tooling.md](docs/tooling.md) before changing compiler, lint, build, or UI dependencies. This path is relative to the generated application's root; the source guide lives in `templates/base/docs/tooling.md` in `create-ec-app`. It covers the TypeScript compatibility aliases, editor setup, and separate PCF toolchain. For shared template upgrades, use `$update-templates` in the `create-ec-app` repository.

## Changelog

Keep dated entries for material changes to this app's tooling or agent instructions. Record the reason and checks performed; label inherited template history separately from changes made in this app.

### 2026-09-05 — Template baseline

- Adopted TypeScript 7 and Oxlint while retaining React Hooks, Fast Refresh, React Compiler, and TanStack Query lint protection.
- Added editor settings and `docs/tooling.md`; PCF wrappers retain their separate TypeScript 5.9 toolchain.
- The generator's Node 26 validation passed all eight target/UI builds and lint checks, both PCF wrappers, and lint regression fixtures. This does not verify this application's future changes or live deployment.

### 2026-09-15 — Design-system lint baseline

- Added `@shadcn/lint` rules that keep component appearance in variants or owned component source, require theme-backed colour and spacing values, and require statically readable Tailwind classes.

### 2026-09-16 - Agent guidance refinement

- Expanded shared guidance for component boundaries, service flow, file organization, and clarification. Necessary in-scope fixes do not require repeated approval.
- Expanded the webresource overlay with critical-file boundaries, targeted validation, error handling, and a typed Dataverse service example. Retained the existing Figma and design-system lint rules.

### 2026-09-16 - Fresh-install handover checks

- Updated the shared baseline to React 19.3, Query 5.103.1, Zod 4.6.5, and Oxlint 1.83. The TypeScript 6 API alias uses the available `@typescript/typescript6@6.0.2` release; application compilation remains TypeScript 7.0.2.
- Public deployment assets remain tracked. The generator checks packed artifacts, fresh installs and lockfile reinstalls, zero-warning lint, and builds before and after PCF conversion. These are generator checks; verify this application's changes and live host separately.
