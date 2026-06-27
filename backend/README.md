# Gametree Backend

FastAPI service for the [Gametree](https://gametree.zmbm.dev) frontend.

It ingests PGN games and serves opening-tree stats from RocksDB. Public routes
live under `/api`, for example `/api/health` and `/api/totals`.

## How It Works

- RocksDB stores aggregated move outcomes by source.
- Positions are keyed by a deterministic position hash.
- Each position stores next-move counters for white wins, draws, and black wins.
- Query endpoints resolve a move path, merge sources if needed, and return the
  top next moves.
- Ingest walks each game and increments every visited position.

## Run It

```bash
cd backend
make install
make run-dev BUILD=1
```

From the monorepo root, the frontend and backend can also be started together:

```bash
docker compose up --build
```

## Common Commands

- `make help` — print available targets
- `make build` — build Docker images
- `make run-dev` — start local dev profile
- `make down` — stop containers from both profiles
- `make test` — run backend tests

## Demo

Get a PGN file from [PGN Mentor](https://www.pgnmentor.com/files.html).

Ingest games from a PGN file:

```bash
make ingest PGN=./path/to/downloaded.pgn SOURCE=online URL=http://localhost:8080/api
```

Query:

```bash
curl -sS 'http://localhost:8080/api/totals?play=e2e4,c7c5' \
  -H 'content-type: application/json' \
  -d '{"play":["e2e4","c7c5"]}' \
| jq '{play, otb: .otb.total, online: .online.total, top_moves: (.moves[:5] | map({uci, total}))}'
```

Example output:

```json
{
  "play": ["e2e4", "c7c5"],
  "otb": 2121275,
  "online": 1323912,
  "top_moves": [
    { "uci": "g1f3", "total": 2581703 },
    { "uci": "b1c3", "total": 368804 },
    { "uci": "c2c3", "total": 229522 },
    { "uci": "d2d4", "total": 92105 },
    { "uci": "f2f4", "total": 26774 }
  ]
}
```

## Production notes

- Write/admin endpoints are blocked from public ingress in prod.
- Prod data comes from [Lumbra's GigaBase](https://lumbrasgigabase.com/en/).
