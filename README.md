# Gametree

A tool designed to help chess players visualize and analyze chess games / openings
through an interactive tree.

![Screenshot from 2024-07-02 14-10-53](https://github.com/evanderh/gametree/assets/3112477/3a6da338-0ec5-4a5a-a59f-08b523753388)

[demo](https://www.gametree.dev)

## Features

- Visualize and navigate through the chess game tree.
- View frequency and win rates of different openings in Master's and Lichess games.
- Evaluate positions / moves with Stockfish 16.

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

- remove game tree / unify tree state
- fix changing data source reseting the tree
- minimap
    - draggable minimap
    - highlight current move
- collapsable tree nodes
- collapsable tree panel sections
- typography/layout improvements
    - make temp moves on main board
        - when hovering tree node or move in engine/game panel
        - remove board from hover tooltip
    - node labels
        - truncate repeated node labels
        - show full variation name+ECO on hover tooltip
- ci/cd deploy
- eco openings explorer
- prefetch node descendants
- mobile layout support

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primatives
