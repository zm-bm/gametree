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

- feat(tree-help): replace legend / hotkeys collapse cards with help modal / overlay
- feat(tree-minimap): make minimap collapsable
- fix(tree-minimap): tree interaction cut off by bottom right overlay wrapper
- feat(tree-options): add info/tooltip for data source

- feat(tree-node): highlight best engine move on the tree
- feat(tree-options): option for tree links colored by engine eval
- feat(tree-options): option for tree nodes sorted by frequency, win rate, eval

- feat(sidebar-layout): sidepane -> sidebar, add scrollable analysis, pin board
- feat(sidebar-opening): opening metadata view (ECO, name, win probabilities, current line)
- feat(sidebar-engine): redo

- fix(test): fix tests
- feat(move-sounds): better move sounds
- chore: remove dead code (tooltip, ecodisplay, others?)
- chore: add code formatter + pre-commit

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primitives
