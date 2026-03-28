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
    - fix(test): fix tests
    - feat(nav-next-node): remember last visited child index 
    - fix(tree-buttons): node buttons sticky if mouse leaves through bridge div
    - feat(tree-buttons): buttons should scale based on zoom level to maintain consistent physical size on screen
    - feat(hotkeys)
        - vim keys for navigation
        - space / shift+click to pin/unpin node
    - fix(tree-zoom): smooth zoom, can be jumpy / jerky
    - feat(tree-minimap): make collapsable
    - fix(tree-minimap): tree interaction cut off by bottom right overlay wrapper

- sidepane
    - feat(sidepane): make resizable
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
