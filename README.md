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

- Tree controls
- Tooltip
- Engine Pane

- stable node ordering
- throttle keyboard in hook
- animated nodes
    - fading in/out nodes while fetching 
    - expand from parent?
    - experiment
- fixed eco
- better child selection (remember last)
- tree colors respective to orientation
- d-pad hints
- fix zoom calc to zoom on screen center

- org useChessground
- org openingsApi / build tree

- collapsable tree nodes
- collapsable tree panel sections
- eco openings explorer
- graceful query failure handling
- small display board in node tooltip
- code formatter + pre-commit
- ci/cd deploy
- store tree in indexedDB
- mobile layout support
- capture sound

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primatives
