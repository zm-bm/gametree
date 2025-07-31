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

- ci/cd deploy
- eco openings explorer
- add tree legend 
    - line thickness = move frequency
    - node color = win rate
- add controls for pruning moves from tree
    - move frequency
    - win rate
- prefetch node descendants
- onboarding / instructions modal
- improve node label typography
- mobile layout support

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lichess](https://lichess.org/) - Openings data
- [visx](https://airbnb.io/visx/) - React/D3 primatives
