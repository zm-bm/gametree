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
    - feat(tree-buttons): buttons should scale based on zoom level to maintain consistent physical size on screen
    - feat(hotkeys): vim keys navigation, space / shift+click to pin/unpin node
    - fix(tree-zoom): smooth zoom, can be jumpy / jerky
    - feat(tree-minimap): make collapsable
    - fix(tree-minimap): tree interaction cut off by bottom right overlay wrapper
    - feat(tree-options): add info/tooltip for data source
    - feat(tree-node): transposition detection + annotation
    - feat(tree): (?) option for tree links colored by engine eval
    - feat(tree): highlight best move?
    - feat(tree): option for node sorting (frequency default, win rate, eval)

- sidepane
    - feat(sidepane): (?) rename sidebar
    - feat(sidepane): add current line breadcrumbs (placement?)
    - feat(sidepane): make sidepane resizable
    - feat(sidepane-opening): opening metadata view (ECO, name, win probabilities)

- other
    - fix(test): fix tests
    - check for unused components / dead code
    - better move sounds
    - code formatter + pre-commit

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primitives
