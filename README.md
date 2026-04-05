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

- feat(sidebar-layout): add scrollable analysis, pin board
- feat(sidebar-opening): opening metadata view (ECO, name, win probabilities, current line)
- feat(sidebar-engine): redo
- feat(move-sounds): better move sounds

- chore: add code formatter + pre-commit
- feat(tree-node): highlight best engine move on the tree
- feat(tree-options): option for tree links colored by engine eval
- feat(tree-options): option for tree nodes sorted by frequency, win rate, eval


## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lumbra's GigaBase](https://lumbrasgigabase.com/) - Game data
- [visx](https://airbnb.io/visx/) - React/D3 primitives
