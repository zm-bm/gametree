# Gametree

Explore chess openings as an interactive move tree.

## Layout

- `frontend/` is the React/Vite chess tree app.
- `backend/` is the FastAPI + RocksDB API.
- `infra/` is Terraform for the AWS pieces Gametree owns.
- `scripts/` has the repo-level commands used for setup and deploys.

## Development

Start everything with Docker Compose:

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

Run just the frontend on your host:

```bash
cd frontend
npm ci
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:8080` in local host
development. In Docker Compose, it proxies to the `backend` service.

Backend commands:

```bash
cd backend
make install
make test
make run-dev BUILD=1
```

## Scripts

Bootstrap backend dev dependencies:

```bash
./scripts/bootstrap.sh
```

Deploy the backend image and API Terraform stack:

```bash
./scripts/backend-deploy.sh
```

Deploy the frontend to S3/CloudFront:

```bash
./scripts/deploy-frontend.sh
```

## Checks

Frontend:

```bash
cd frontend
npm test -- --run
npm run build
```

Backend:

```bash
cd backend
make test
```

## Docs

- [frontend/README.md](frontend/README.md): frontend app overview and commands.
- [backend/README.md](backend/README.md): backend service overview and commands.
- [infra/README.md](infra/README.md): Terraform layout and deploy notes.

## License

MIT. See [LICENSE](LICENSE).
