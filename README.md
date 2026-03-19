# Gametree

visualize, explore, and learn about the game tree of chess.

[demo](https://gametree.zmbm.dev)

## Usage

Run the app locally

```sh
npm install
npm run dev
```

Build

```sh
npm run build
```

## Roadmap

- treeview
    - focus mode / compare mode
        - add `Focus` vs `Compare` mode radio buttons in tree options
        - show `bookmark` button in both modes
        - replace `isolate` button with `copy line` button (useful in both Focus and Compare)
        - hide node-level `expand/collapse` in Focus mode (focus state is auto-managed)
        - show node-level `expand/collapse` in Compare mode
        - keep per-mode tree state separate:
            - Compare mode preserves manual expand/collapse state across mode switches
            - Focus mode expansion is derived/ephemeral and should not overwrite Compare state
        - focus mode rendering: emphasize current path + siblings along the current path + immediate candidate moves from current node
        - compare mode rendering: allow arbitrary branch expansion depth
        - camera behavior:
            - manual panning remains enabled in both modes
            - do not snap back to current node after manual panning unless user explicitly navigates
            - on mode switch, zoom/pan to current node
        - copy line behavior:
            - action is based on the clicked node
            - add tree option for copy format: `FEN`, `PGN` (line up to node), `UCI position` command
    - bug: node buttons can be sticky and fail to disappear until next hover
    - tree node buttons should scale base on zoom level to maintain consistent physical size on screen
    - hotkeys + hotkey help
        - add hotkeys for:
            - tree navigation (up/down/left/right or vim keys)
            - expand/collapse node (space)
            - mode switching (F for focus, C for compare)
            - copy line (Y for yank)
        - update hotkeys help overlay to show available hotkeys and their descriptions
    - when descending into a variation, remember the child index at each level so that when the user later ascends back up to that level, they can easily re-descend into the same variation without having to manually find and click it again
    - fix zoom calc to zoom on screen center
    - collapsable minimap
    - bug: bottom right overlay wrapper clips corner of Treeview

- sidepane
    - opening metadata view (ECO, name, win probabilities)
    - engine evaluation view (eval bar + graph + PV + controls)
    - bookmarks view (global list + navigation + delete)

- other
    - better move sounds
    - code formatter + pre-commit
    - fix tests

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primatives
