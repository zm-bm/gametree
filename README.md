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
    - fix sticky node buttons bug
    - isolate button
    - tree colors respective to orientation
    - better child selection (remember last)
    - fix zoom calc to zoom on screen center
    - collapsable minimap
    - minimap clips corner of Treeview

- sidepane
    - engine view
    - openings view
    - bookmarks view

- other
    - code formatter + pre-commit
    - fix tests

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primatives
