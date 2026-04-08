# Gametree

visualize, explore, and learn about the game tree of chess.

<img width="640" height="356" alt="image" src="https://github.com/user-attachments/assets/5390631e-44d2-4349-8e37-4f9e9eb43652" />

[demo](https://gametree.zmbm.dev)

## Technical summary

- The app renders an interactive opening tree from the current move path, where each node represents a legal next move and its observed frequency.
- Tree data comes from `gametree-api` (`/api/totals`) and is loaded incrementally as you explore positions.
- A synchronized board + sidebar show the selected position, opening context, and move-level stats.
- Optional in-browser Stockfish analysis updates evaluation and principal variation for the current position.
- Theory snippets are fetched from Wikibooks to add human-readable opening notes alongside the tree.

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

### Backend note

This frontend calls [gametree-api](https://github.com/zm-bm/gametree-api/) for `/api/*`.
For local dev, run `gametree-api` separately on `http://localhost:8080` (Vite proxies `/api` there).

## Acknowledgments

- [chessground](https://github.com/lichess-org/chessground) - Chess board
- [chess.js](https://github.com/jhlywa/chess.js/tree/master) - Chess logic
- [Stockfish](https://github.com/official-stockfish/Stockfish) - Chess engine
- [Lumbra's GigaBase](https://lumbrasgigabase.com/) - Game data
- [visx](https://airbnb.io/visx/) - React/D3 primitives

## License

MIT. See [LICENSE](./LICENSE).
