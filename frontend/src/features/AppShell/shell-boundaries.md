# App Shell Boundaries

UIA-01 keeps the current behavior while naming the seams that later layout work will use.

## Current Owners

- `App`: global app wiring only. It initializes keyboard actions and renders `AppShell`.
- `AppShell`: current responsive shell. It owns the desktop split and the top-level `aside` plus `main` regions.
- `Sidebar`: current inspector compatibility wrapper. It owns only the old shell entry point while rendering `PositionInspector`.
- `PositionInspector`: reusable board plus optional summary, engine, and theory details primitive. It still imports current sidebar internals transitionally.
- `TreeWorkspace`: tree workspace entry point. It renders the current `TreeView` and owns the mobile `BoardDock`.
- `BoardDock`: mobile-only compact tree overlay plus a temporary board-inspection mode attached to the tree workspace.
- `TreeView`: canvas sizing, zoom provider wiring, and tree rendering entry point.
- `Tree`: SVG tree, data loading overlays, help/settings/D-pad/zoom/minimap controls.

## Target Boundaries

- `TreeWorkspace`: the dominant tree-first workspace. It owns `BoardDock` so the mobile board sits with the tree rather than inside the old sidebar shell.
- `PositionInspector`: the replacement concept for `Sidebar`. It owns board presentation plus optional position detail surfaces.
- `BoardDock`: compact, persistent board view over the mobile tree, with a temporary inspection mode for a larger board plus essential position summary. Inspection mode intentionally blocks tree interaction until dismissed.
- `InspectorDetails`: progressive details surface for engine, full summary, and theory.

## Decision

`Sidebar` should not survive as the long-term concept. Keep it as a compatibility wrapper until `AppShell` can render `PositionInspector` or future inspector regions directly without changing the user-facing shell.
