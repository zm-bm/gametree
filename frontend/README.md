# Gametree

Explore chess openings as an interactive move tree.

<img width="640" height="356" alt="image" src="https://github.com/user-attachments/assets/5390631e-44d2-4349-8e37-4f9e9eb43652" />

[Live site](https://gametree.zmbm.dev)

## What It Does

- Renders an opening tree from the current move path.
- Loads move stats from `/api/totals` as you explore.
- Keeps the board, selected line, move stats, and opening notes in sync.
- Can run Stockfish in the browser for a quick eval and principal variation.

## Run It

From `frontend/`:

```bash
npm ci
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:8080`, so start the
backend too if you need live data.

## Checks

```bash
npm test -- --run
npm run build
```

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lumbra's GigaBase](https://lumbrasgigabase.com/) - Game data
- [visx](https://airbnb.io/visx/) - React/D3 primitives

## License

MIT. See [LICENSE](../LICENSE).
