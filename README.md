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
    - feat(tree-buttons): pin/unpin button
    - feat(tree-buttons): copy line button (FEN / PGN / UCI position?)
    - fix(test): fix tests
    - feat(nav-next-node): remember last visited child index 
    - fix(tree-buttons): node buttons sticky if mouse leaves through bridge div
    - feat(tree-buttons): buttons should scale based on zoom level to maintain consistent physical size on screen

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
- [visx](https://airbnb.io/visx/) - React/D3 primitives
