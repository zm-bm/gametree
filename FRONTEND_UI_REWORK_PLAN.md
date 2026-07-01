# Frontend Design Roadmap

The Board HUD branch is complete as the current baseline. This roadmap starts the next design phase: safe-area framing, Board HUD information hierarchy, engine/tree integration, theory access, and iterative tree design work.

## Completed Baseline

- `App` owns global keyboard wiring and the full-viewport workspace shell.
- `features/Tree` owns tree canvas sizing, zoom providers, SVG tree rendering, tree nodes/links/grid, tree controls, and tree navigation.
- `features/Hud` owns board/detail HUD surfaces, including `BoardHud`, `ChessBoard`, `ToggleOrientationButton`, `PositionSummary`, `EngineView`, `PositionTheory`, and HUD panel hooks.
- The old desktop sidebar, old mobile-only `BoardDock`, `PositionInspector`, selected-node board, `AppShell`, and `AnalysisWorkspace` are closed.
- `BoardHud` is the single primary board surface on desktop and mobile, and the compact board remains interactive for legal move entry.

## Durable Rules

- The tree remains the primary full-viewport workspace.
- Board controls stay outside playable board squares.
- Result colors remain semantic W/D/L colors; amber is reserved for focus, selected/current-line emphasis, and control accents.
- Tree-specific overlays stay under `features/Tree`; board/detail HUD surfaces stay under `features/Hud`.
- Do not reintroduce `features/Sidebar`, `features/TreeWorkspace`, `features/TreeView`, `features/PositionInspector`, `BoardDock`, thin `AppShell`, or thin `AnalysisWorkspace` wrappers.

## DESIGN-00: HUD Safe Area And Board Size Tuning

This is the next implementation-ready task.

- Finalize compact board sizes as `160px` mobile, `184px` tablet, and `208px` desktop; all are divisible by 8.
- Add tree camera safe-area framing from screen-space reserved rectangles:
  - compact Board HUD rectangle plus margin;
  - top-right help control;
  - bottom-left tree controls;
  - bottom-right zoom/minimap controls;
  - mobile viewport edge padding.
- Keep the current node/current line out from under persistent controls while preserving the full-screen tree model.
- Do not reserve camera space for open optional HUD detail surfaces; they are temporary/dismissible overlays.
- Preserve manual pan behavior, but reframe on current-node changes, board-move navigation, resize, and zoom-button actions.
- Add or keep a `Center current` recovery action if manual panning can leave the current node hidden.
- Acceptance: desktop and mobile screenshots show the starting/current tree content framed around the compact HUD without changing tree layout or node spacing.

## DESIGN-01: Board HUD Information Hierarchy

- Retire the generic `HUD_PANELS` model as the final design direction.
- Condense summary into the always-visible `gt-board-hud-region`, not a separate optional panel.
- Add a compact current-position summary:
  - opening/name or root label;
  - ECO when available;
  - game count;
  - short current-line/status text only when it fits.
- Replace the current two-rail panel model with one deliberate board instrument action rail:
  - `Flip board`;
  - mobile `Expand board`;
  - `Engine`;
  - `Theory`.
- Keep the expanded mobile board view focused on board plus compact summary.

## DESIGN-02: Engine Tree-Analysis Mode

- Make `Engine` an action-rail toggle, not a generic panel toggle.
- Toggling engine starts/stops the existing engine flow and shows active/pressed state in the rail.
- Add a small engine data window near the Board HUD, initially below the compact HUD in `gt-board-hud-region`.
- Keep the engine window compact: eval, depth/status, best move, and short PV preview.
- Integrate engine guidance with the tree:
  - highlight visible PV/current best-move path in the tree when those moves exist;
  - keep normal tree node clicks/navigation unchanged;
  - use a distinct engine accent that does not conflict with amber focus/current-line styling or W/D/L result colors.
- Do not introduce a large engine sidebar or permanent full panel.

## DESIGN-03: Theory HUD Reader

- Make `Theory` a Board HUD action-rail button for now, not a node button.
- Opening theory shows one compact reading surface for the current position near the Board HUD.
- The theory surface handles loading, unavailable notes, source link, and compact scrolling.
- Do not add node-level theory buttons until there is evidence that per-node theory availability is useful and not noisy.

## DESIGN-04: Tree Design Exploration Track

Treat tree redesign as small screenshot-driven experiments, not one large rewrite. Try them in this order:

1. Node density and card readability.
2. Current node and current-line emphasis.
3. Edge thickness, routing, and result-color clarity.
4. Hover/node action drawer simplification.
5. Mobile usefulness of D-pad/minimap/tree controls.
6. Presentation for board-played moves that are unavailable from opening data.

Each experiment should preserve tree navigation semantics and be verified in Chrome at mobile and desktop sizes before the next experiment starts.

## DESIGN-05: Visual And Accessibility Finish

- Retune graphite/amber styling only after the spatial and interaction models stabilize.
- Verify icon-only controls have accessible names and state.
- Update help copy after the HUD/action model and tree interaction changes are settled.
- Keep light mode legible, but optimize the primary identity around the dark graphite analysis workspace.

## Interfaces And Ownership

- No public app API changes are expected.
- `App` continues to render `TreeCanvas` and `BoardHud` directly.
- `features/Tree` owns camera safe-area helpers and tree visual experiments.
- `features/Hud` owns Board HUD composition, compact summary, engine HUD window, theory reader, and board controls.
- Expected new internal pieces:
  - safe-area/framing helpers under `features/Tree`;
  - compact summary component or `PositionSummary` compact variant under `features/Hud`;
  - compact engine HUD window under `features/Hud`.

## Test Plan

- For this document reset:
  - update `FRONTEND_UI_REWORK_PLAN.md`;
  - run `git diff --check`.
- For `DESIGN-00` when implemented:
  - unit-test safe-area rectangle calculation and camera framing helpers;
  - update tree navigation tests for resize, zoom, current-node change, manual pan, and center-current behavior;
  - run `npm --prefix frontend run test:single -- src/App.test.tsx src/features`;
  - run `npm --prefix frontend run build`;
  - run `npm --prefix frontend run lint`;
  - use Chrome MCP on desktop `1280x800` and mobile `390x844` to confirm current tree content is framed around the HUD.

## Assumptions

- The next phase is a roadmap plus an implementation-ready `DESIGN-00`, not a fully specified final tree redesign.
- Engine direction is tree annotations plus a small HUD data window.
- Theory direction is a HUD action and compact reader, not a node button.
- Summary should be compact and always visible inside the Board HUD region.
- Tree design work will require visual trials; this roadmap should make that explicit instead of pretending the final tree treatment is already known.
