# Analysis Desk Token Inventory

UIA-00 establishes the visual vocabulary for the frontend UI rework. This is a foundation pass only: layout, board behavior, tree navigation, and result-color semantics stay unchanged.

## Semantic Token Contract

The Analysis Desk token layer lives in `main.css` and should be the source for new chrome work:

- Canvas: `--gt-app-canvas`, `--gt-tree-canvas`, `--gt-tree-canvas-accent`, `--gt-tree-grid-muted`.
- Inspector: `--gt-inspector-surface`, `--gt-inspector-panel`, `--gt-inspector-border`, `--gt-inspector-panel-border`, `--gt-inspector-divider`, `--gt-inspector-label`, `--gt-inspector-scroll-thumb`.
- Overlays: `--gt-overlay-surface`, `--gt-overlay-border`, `--gt-overlay-border-strong`, `--gt-overlay-divider`, `--gt-overlay-divider-strong`, `--gt-overlay-hover`, `--gt-overlay-text-primary`.
- Text: `--gt-text-primary`, `--gt-text-muted`, `--gt-text-data`.
- Accent/current selection: `--gt-accent`, `--gt-accent-soft`, `--gt-accent-border`, `--gt-current-node-start`, `--gt-current-node-end`, `--gt-current-node-border`, `--gt-selected-line`.
- Reserved result colors: `--gt-result-loss`, `--gt-result-draw`, `--gt-result-win`.

Existing component variables remain as aliases for compatibility:

- `--gt-sf-*` maps to overlay/shared-surface tokens.
- `--gt-sb-*` maps to inspector/sidebar tokens.
- `--gt-eng-*` maps to inspector evaluation rail and active-control tokens.

## Current Color Sources

- Tailwind custom palettes in `tailwind.config.js`: `lightmode`, `darkmode`, `highlight`, and `neutral`.
- Tailwind default palettes used directly in components: slate, zinc, amber, sky, blue, and black/white opacity utilities.
- CSS variables in `main.css`: shared surface, sidebar/inspector, engine, and now Analysis Desk semantic tokens.
- Board CSS in `shared/ui/Board/chessground.board.css`: `--cg-board-image`, `--cg-last-move-highlight`, move destination, premove, selected square, and check overlays.
- Tree result scale in `features/TreeView/lib/colors.ts`: the red-to-draw-to-blue range owned by `colorScale` and `COLORS`.
- SVG tree definitions in `SVGDefs.tsx`: move-node and current-node gradients now read semantic tokens.

## Reserved Result Semantics

Do not reuse amber for result meaning. Amber is reserved for selected/current-line emphasis and transposition/current-node accents.

Result colors are reserved for outcome data:

- Loss: `--gt-result-loss` matches `COLORS.lose` and the warm edge end, `#a50026`.
- Draw: `--gt-result-draw` matches `COLORS.draw`, `#f9f8c2`.
- Win: `--gt-result-win` matches `COLORS.win` and the cool edge end, `#313695`.

Tree links and W/D/L bars should continue to use `colorScale` and `COLORS` unless a later unit explicitly changes the result scale.

## Data Mono Usage

Use `gt-data-text` or `--gt-font-data` for restrained data accents only:

- Move labels and compact move-line metadata.
- Tree stats, percentages, W/D/L labels, and numeric settings.
- Engine score, depth, NPS, and principal-variation metadata.
- Board coordinates, ECO codes, compact inspector metadata, and control readouts.

Do not apply data mono to long theory prose, modal body copy, general button labels, or explanatory help text.

## Implementation Notes

- New components should prefer semantic tokens over raw palette names.
- Existing `lightmode`/`darkmode` utility classes can remain until touched by later scoped units.
- Board styling is intentionally separate from the app chrome. The board dock/inspector can use Analysis Desk surface tokens around the board, but chessground square highlights should stay governed by board CSS.
- Light mode remains supported. Dark mode carries the primary graphite/amber Analysis Desk identity.
