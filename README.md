# Gametree

Visualize, explore, and learn about the game tree of chess.

## Layout

- `frontend/` is the React/Vite chess tree app.
- `backend/` is the FastAPI/RocksDB opening-tree API service.
- `infra/` has project infrastructure and deployment configuration.
- `scripts/` has repo-level operator and development entrypoints.
- `docs/` has project docs and migration notes.

## Development

Start the dev stack:

```bash
docker compose up --build
```

If another app is already using Vite's default port, override it:

```bash
FRONTEND_PORT=5174 docker compose up --build
```

Services:

- `frontend` on `http://localhost:5173`
- `backend` on `http://localhost:8080`

Run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:8080` in local host
development. In Docker Compose, it proxies to the `backend` service.

Backend commands:

```bash
cd backend
make install
make test
```

## Scripts

Bootstrap backend dev dependencies from the repo root:

```bash
./scripts/bootstrap.sh
```

Build and push a backend image for the manual API deploy flow:

```bash
./scripts/backend-build-image.sh
```

Deploy the frontend manually to S3/CloudFront:

```bash
./scripts/deploy-frontend.sh
```

## Frontend Checks

Run from `frontend/`:

```bash
npm test -- --run
npm run build
```

## Docs

- [frontend/README.md](frontend/README.md): frontend app overview and commands.
- [backend/README.md](backend/README.md): backend service overview and commands.
- [infra/README.md](infra/README.md): project infrastructure layout and commands.
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md): temporary monorepo migration plan.

## License

MIT. See [LICENSE](LICENSE).
