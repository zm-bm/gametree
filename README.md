# Gametree

Visualize, explore, and learn about the game tree of chess.

## Layout

- `frontend/` is the React/Vite chess tree app.
- `backend/` is the FastAPI/RocksDB opening-tree API service.
- `infra/` has project infrastructure and deployment configuration.
- `scripts/` has repo-level operator and development entrypoints.
- `docs/` has project docs and migration notes.

## Development

Start the frontend dev container:

```bash
docker compose up --build frontend
```

Run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:8080` in local host
development. In Docker Compose, it defaults to
`http://host.docker.internal:8080` so it can reach a backend running on the
host.

## Frontend Checks

Run from `frontend/`:

```bash
npm test -- --run
npm run build
```

## Docs

- [frontend/README.md](frontend/README.md): frontend app overview and commands.
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md): temporary monorepo migration plan.
- `backend/README.md`: backend service docs after Phase 2.
- `infra/README.md`: infrastructure docs after Phase 3.

## License

MIT. See [LICENSE](LICENSE).
