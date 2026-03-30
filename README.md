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
    - feat(tree-buttons): copy line button (FEN / PGN / UCI position?)
    - feat(nav-next-node): remember last visited child index 
    - fix(tree-buttons): node buttons sticky if mouse leaves through bridge div
    - feat(tree-buttons): buttons should scale based on zoom level to maintain consistent physical size on screen
    - feat(hotkeys): vim keys navigation, space / shift+click to pin/unpin node
    - fix(tree-zoom): smooth zoom, can be jumpy / jerky
    - feat(tree-minimap): make collapsable
    - fix(tree-minimap): tree interaction cut off by bottom right overlay wrapper
    - feat(tree-options): add info/tooltip for data source
    - refactor(tree-node): move tree node components to separate dir
    - feat(tree-node): transposition detection + annotation

- sidepane
    - feat(sidepane): make sidepane resizable
    - feat(sidepane-opening): opening metadata view (ECO, name, win probabilities)
    - feat(sidepane-evaluation): engine evaluation view (eval bar + graph + PV + controls)
    - feat(sidepane-bookmarks): bookmarks view (global list + navigation + delete)

- other
    - fix(test): fix tests
    - better move sounds
    - code formatter + pre-commit

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primitives
