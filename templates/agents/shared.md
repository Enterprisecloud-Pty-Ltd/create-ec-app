## UI

Stay consistent with the project's existing UI system.

- Shadcn/ui: use existing `@/components/ui` components and Tailwind utilities.
- Kendo: use Kendo React for rich controls and Tailwind for layout.
- Preserve the existing theme and global CSS imports.
- Do not mix UI systems unless explicitly asked.

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

## Code

Prefer focused React components, direct typed functions, and existing services.

- Use TanStack Query for server state and local component state for local UI.
- Use Zustand only for shared client state that has outgrown local state. Do not store server state in Zustand. Do not add Redux unless asked.
- One fetch/save function per operation, with a query or mutation hook when the UI needs that state. Colocate query keys with the hook when they are reused for invalidation.
- Handle loading, error, empty, and success when each state affects the workflow.
- Keep small apps flat. Add a feature folder only when a feature owns page, UI, and data together.
- Keep route definitions in one place when a router is present. Parse URL params at the page boundary. Do not add a router for a single screen that local state can handle.
- Do not create wrapper chains, generic clients, classes for simple service logic, or shared `lib` helpers before there is a second caller.
- Make surgical changes unless the task is implementing a Figma screen.

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
