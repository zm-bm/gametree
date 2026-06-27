# Gametree Monorepo Migration Plan

Temporary planning document for folding `gametree-api` and the standalone
`infra` repo into `$GAMETREE_ROOT`, with a repo shape closer to
`$WEATHER_MAP_ROOT`.

Path variables used below:

```bash
CODE_ROOT="${CODE_ROOT:-$HOME/code}"
GAMETREE_ROOT="$CODE_ROOT/gametree"
GAMETREE_API_ROOT="$CODE_ROOT/gametree-api"
SHARED_INFRA_ROOT="$CODE_ROOT/infra"
WEATHER_MAP_ROOT="$CODE_ROOT/weather-map"
```

## Goal

Make `$GAMETREE_ROOT` the only active Gametree repo:

```text
gametree/
  frontend/        # current Vite/React app from the gametree repo
  backend/         # current FastAPI/RocksDB service from gametree-api
  infra/           # current Terraform repo contents
  scripts/         # repo-level dev/deploy scripts
  docs/            # project docs and migration notes
  compose.yml      # repo-level local dev stack
  README.md        # monorepo overview, like weather-map
```

The first migration should preserve behavior and Terraform state. Cleanups like
flattening Terraform stack names can happen after the moved repo validates from
the new path.

## Decisions

- Keep `gametree` as the surviving GitHub repository.
- Move the current root frontend into `frontend/` with `git mv`.
- Copy `gametree-api` into `backend/` without preserving its separate Git
  history.
- Copy `$SHARED_INFRA_ROOT` into `infra/` without preserving its separate
  Git history.
- Do not rename Terraform resources or state keys during the first pass.
- Keep the current root `LICENSE` in place during the migration. Imported repo
  licenses, if any, remain under their imported directories until licensing is
  reviewed deliberately.
- Accept temporary broken local/dev/deploy flows while paths and workflows are
  updated.

## Current Shape

Observed local repos:

- `$GAMETREE_ROOT`
  - Vite/React frontend at repo root.
  - `package.json`, `vite.config.ts`, `src/`, `public/`, `.github/workflows`.
  - Vite proxies `/api` to `http://localhost:8080`.
- `$GAMETREE_API_ROOT`
  - FastAPI service.
  - Python package in `src/gametree_api`.
  - Docker files under `docker/`.
  - Local compose file at `docker/docker-compose.yml`.
  - Make targets for install/test/build/run/ingest.
- `$SHARED_INFRA_ROOT`
  - Terraform modules in `modules/`.
  - Terraform stacks in `stacks/`.
  - Gametree-specific API stack at `stacks/gametree-api`.
  - Static site stack at `stacks/static-sites`.
  - Shared account stacks like `dns`, `certs`, `network`, `edge`, and
    `github-oidc`.
- `$WEATHER_MAP_ROOT`
  - Project code is grouped under `frontend/`, `backend/`, `infra/`, `scripts/`,
    `docs/`, plus root `compose.yml` and `README.md`.

## Phase 0: Baseline And Freeze

1. Confirm all three repos are clean or intentionally dirty:

   ```bash
   git -C $GAMETREE_ROOT status --short
   git -C $GAMETREE_API_ROOT status --short
   git -C $SHARED_INFRA_ROOT status --short
   ```

2. Record current remote URLs and branches:

   ```bash
   git -C $GAMETREE_ROOT remote -v
   git -C $GAMETREE_API_ROOT remote -v
   git -C $SHARED_INFRA_ROOT remote -v
   ```

3. Run current checks before moving anything:

   ```bash
   cd $GAMETREE_ROOT
   npm test -- --run
   npm run build

   cd $GAMETREE_API_ROOT
   make test

   cd $SHARED_INFRA_ROOT
   terraform -chdir=stacks/gametree-api fmt -check
   terraform -chdir=stacks/static-sites fmt -check
   ```

4. Create a branch in `gametree`:

   ```bash
   cd $GAMETREE_ROOT
   git switch -c monorepo-migration
   ```

## Phase 1: Move Frontend Into `frontend/`

Move the current frontend root files into a dedicated directory:

```bash
cd $GAMETREE_ROOT
mkdir frontend
git mv README.md frontend/README.md
git mv src public index.html package.json package-lock.json \
  tsconfig.json tsconfig.node.json vite.config.ts \
  eslint.config.ts eslint.config.cjs postcss.config.js tailwind.config.js \
  frontend/
```

If `dist/`, `node_modules/`, or other generated files are present, leave them
ignored and do not move them.

Then update path-sensitive files:

- `.github/workflows/node.js.yml`
  - Set `defaults.run.working-directory: frontend`.
  - Set `actions/setup-node` cache dependency path to
    `frontend/package-lock.json`.
  - Re-enable test/build steps if desired.
- `.github/workflows/deploy.yml`
  - Run `npm ci` and `npm run build` from `frontend/`.
  - Sync `frontend/dist/` to S3 instead of root `dist/`.
- Root `.gitignore`
  - Keep Node ignores.
  - Add Python, Terraform, and local data ignores from the other repos.
- Root `README.md`
  - Rewrite as a monorepo overview.
  - Link to `frontend/README.md`, `backend/README.md`, and `infra/README.md`.
- `frontend/README.md`
  - Move the existing frontend-specific content here.
- `frontend/Dockerfile`
  - Add a small dev image if the root compose stack should build the frontend:

    ```Dockerfile
    FROM node:22-bookworm

    WORKDIR /app

    COPY package*.json ./
    RUN npm ci

    COPY . .

    EXPOSE 5173

    CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
    ```

Validation:

```bash
cd $GAMETREE_ROOT/frontend
npm ci
npm test -- --run
npm run build
```

## Phase 2: Copy `gametree-api` Into `backend/`

Copy the backend source files without importing the old repository history:

```bash
cd $GAMETREE_ROOT
mkdir backend
rsync -a \
  --exclude='.git/' \
  --exclude='.venv/' \
  --exclude='.pytest_cache/' \
  --exclude='gametree_api.egg-info/' \
  --exclude='data/' \
  $GAMETREE_API_ROOT/ \
  backend/
```

Then review and stage the copied files:

```bash
git status --short
git add backend
```

After copying, update backend paths for the monorepo:

- Keep the Python package at `backend/src/gametree_api`.
- Keep backend-specific docs at `backend/README.md`.
- Keep backend Docker files at `backend/docker/`.
- Decide on local RocksDB data location:
  - Recommended first pass: keep it under `backend/data/` to minimize backend
    changes.
  - Later cleanup option: move runtime data to root `data/`, similar to
    weather-map's root `artifacts/`.
- Update backend README examples from `cd gametree-api` to `cd backend`.
- Update `backend/Makefile` only if commands should be runnable from repo root.
  For the first pass, keeping `make` commands run from `backend/` is fine.

Add a repo-level `compose.yml` similar to weather-map:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./backend/src:/app/src
      - ./backend/data:/data
    environment:
      - DATABASE_URL=rocksdb:///data/gametree.rocksdb
    command: uvicorn gametree_api.main:app --host 0.0.0.0 --port 8080 --reload --reload-dir /app/src

  frontend:
    build:
      context: ./frontend
    command: npm run dev -- --host 0.0.0.0
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
    depends_on:
      - backend

volumes:
  frontend_node_modules:
```

If the frontend keeps using Vite directly outside Docker, no Vite API proxy
change is required for the first pass because the backend remains on
`http://localhost:8080`.

Validation:

```bash
cd $GAMETREE_ROOT/backend
make install
make test
make run-dev BUILD=1

cd $GAMETREE_ROOT
docker compose up --build
curl -i http://localhost:8080/api/health
```

## Phase 3: Copy Project Infra Into `infra/`

Move only the Gametree-specific infra pieces into a project-local layout that is
closer to `weather-map/infra`:

```text
infra/
  README.md
  LICENSE
  api/
  site/
```

Copy only:

- `$SHARED_INFRA_ROOT/stacks/gametree-api/` to `infra/api/`
- `$SHARED_INFRA_ROOT/templates/gametree-api-userdata.sh.tmpl` to
  `infra/api/templates/gametree-api-userdata.sh.tmpl`
- `$SHARED_INFRA_ROOT/LICENSE` to `infra/LICENSE`

Exclude `.git`, `.terraform`, `*.tfstate*`, `*.tfvars*`, `.vscode`, and other
local-only files. Do not copy the old shared stacks for `network`, `dns`,
`certs`, `edge`, `github-oidc`, `tankdle`, or `zmbm_site`.

Adapt `infra/api`:

- Keep backend key `gametree-api/prod.tfstate`.
- Keep remote-state dependencies on existing shared `network`, `edge`, and
  `dns` state.
- Update userdata lookup to `templates/gametree-api-userdata.sh.tmpl`.
- Update README paths to `$GAMETREE_ROOT/backend` and
  `$GAMETREE_ROOT/infra/api`.

Create `infra/site`:

- Use `source = "../../../infra/modules/static-site"` so the stack reads the
  shared module from the sibling infra checkout without embedding an absolute
  local path.
- Hard-code the existing `gametree` site config from the old
  `stacks/static-sites/terraform.tfvars`.
- Preserve COEP/COOP response headers and `/api/*` proxy with
  `app_header_value = "gametree-api"`.
- Read the shared edge ALB DNS name from existing `edge.tfstate`.
- Use backend key `gametree/site.tfstate`.

Terraform state notes:

- `infra/api` keeps the existing API state key and can be applied later without
  a state move.
- `infra/site` uses a new state key and must not be applied until the old
  multi-site `static-sites/prod.tfstate` ownership has been split or
  reconciled.
- The old shared infra repo/state must remain active because Gametree still
  depends on shared `network`, `dns`, and `edge` state.

Validation:

```bash
cd $GAMETREE_ROOT
terraform -chdir=infra/api fmt -check
terraform -chdir=infra/site fmt -check

terraform -chdir=infra/api init -backend=false
terraform -chdir=infra/api validate

terraform -chdir=infra/site init -backend=false
terraform -chdir=infra/site validate
```

Do not commit `.tfvars`, local `.terraform/` directories, or state files.

## Phase 4: Root Docs And Scripts

Create or update:

- `README.md`
  - Short overview.
  - Layout section matching weather-map's style.
  - Local development commands.
  - Test/build commands for frontend and backend.
  - Infra docs links.
- `scripts/bootstrap.sh`
  - Create root `.venv`.
  - Install backend in editable dev mode:

    ```bash
    .venv/bin/python -m pip install -e "backend[dev]"
    ```

- `scripts/backend-build-image.sh`
  - Optional helper for ECR build/push.
  - Keeps the long image-tag commands out of docs.
- `scripts/deploy-frontend.sh`
  - Optional local helper if manual S3 deploys are useful.

Do not overbuild scripts in the first pass. The minimum useful root commands
are:

```bash
docker compose up --build
cd frontend && npm test -- --run && npm run build
cd backend && make test
```

## Phase 5: GitHub Actions

Update existing workflows for the new monorepo layout:

- Frontend CI:
  - `working-directory: frontend`
  - `cache-dependency-path: frontend/package-lock.json`
  - `npm ci`
  - `npm test -- --run`
  - `npm run build`
  - Include the Vitest Request compatibility shim needed for RTK Query tests in
    the jsdom environment.

- Frontend deploy:
  - Build from `frontend/`.
  - Sync `frontend/dist/`.
  - Existing `AWS_DEPLOY_ROLE_ARN` and `CLOUDFRONT_DISTRIBUTION_ID` secrets can
    remain if the static-site deployment role still trusts `zm-bm/gametree`.

- Backend CI:
  - Python 3.12 setup.
  - Install `backend[dev]`.
  - Run `python -m pytest -q backend/tests`.

- Backend deploy:
  - Keep manual local backend deploy for the first migration.
  - Do not add ECR push permissions or backend image publishing to GitHub
    Actions in this phase.

## Phase 6: Production Cutover

Because downtime is acceptable, use the simple order:

1. Merge the monorepo migration to `gametree/main`.
2. Run frontend deploy from the updated workflow.
3. Build and push a backend image from `backend/`:

   ```bash
   cd $GAMETREE_ROOT/backend

   export AWS_REGION=us-east-1
   export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
   export ECR_REPO="${ECR_REGISTRY}/gametree-api"
   export IMAGE_TAG=$(git -C $GAMETREE_ROOT rev-parse --short HEAD)

   aws ecr get-login-password --region "$AWS_REGION" \
     | docker login --username AWS --password-stdin "$ECR_REGISTRY"

   docker build -f docker/Dockerfile -t "${ECR_REPO}:${IMAGE_TAG}" .
   docker push "${ECR_REPO}:${IMAGE_TAG}"
   ```

4. Update `api_image` in the real, uncommitted
   `infra/api/terraform.tfvars`.
5. Apply the API stack:

   ```bash
   cd $GAMETREE_ROOT/infra/api
   terraform plan
   terraform apply
   ```

6. Replace the ASG instance so it boots the new image:

   ```bash
   ASG_NAME=$(terraform output -raw api_asg_name)
   INSTANCE_ID=$(aws autoscaling describe-auto-scaling-groups \
     --auto-scaling-group-names "$ASG_NAME" \
     --region us-east-1 \
     --query 'AutoScalingGroups[0].Instances[0].InstanceId' \
     --output text)

   aws autoscaling terminate-instance-in-auto-scaling-group \
     --instance-id "$INSTANCE_ID" \
     --no-should-decrement-desired-capacity \
     --region us-east-1
   ```

7. Verify:

   ```bash
   curl -i https://gametree-api.zmbm.dev/api/health
   curl -I https://gametree.zmbm.dev
   ```

8. Open the frontend and verify that `/api/totals` still works through the
   deployed site.

## Phase 7: Archive Old Repos

After the monorepo is deployed and verified:

- Update `gametree-api` README to say the repo has moved to
  `zm-bm/gametree/backend`.
- Update `infra` README to say the repo has moved to `zm-bm/gametree/infra`.
- Archive old GitHub repos or make them read-only.
- Disable old CI/deploy workflows in archived repos.
- Remove or update local clones only after the new repo has been used for at
  least one frontend deploy and one backend deploy.

## Phase 8: Optional Post-Migration Cleanup

Do this only after the monorepo path works.

### Flatten Infra Toward Weather-Map Style

Possible target:

```text
infra/
  api/          # from stacks/gametree-api
  site/         # from stacks/static-sites, eventually narrowed to gametree
  edge/         # shared edge if it truly belongs here
  modules/
  templates/
```

Be careful:

- Directory renames alone do not change Terraform state.
- Resource/module address changes do change Terraform state.
- If converting `stacks/static-sites` from a multi-site `for_each` stack into a
  single `site` stack, expect state moves or resource replacement unless handled
  deliberately.
- CloudFront replacement can be slow and disruptive. Avoid it unless there is a
  real payoff.

### Simplify Backend Deployment

Later options:

- Add a backend deploy workflow in GitHub Actions.
- Push immutable ECR tags from `gametree/main`.
- Have Terraform consume a tag/digest passed through a variable or checked-in
  release metadata file.

### Unify Local Dev

Later options:

- Move local RocksDB data to root `data/`.
- Replace backend's nested `docker/docker-compose.yml` with the root
  `compose.yml`.
- Add root `make` targets only if they reduce actual command friction.

## Definition Of Done

- `gametree` contains `frontend/`, `backend/`, and `infra/`.
- Root README explains the full repo layout.
- `frontend` tests and build pass from the new path.
- `backend` tests pass from the new path.
- Root `docker compose up --build` starts frontend and backend together.
- Frontend deploy workflow builds from `frontend/` and syncs `frontend/dist/`.
- Terraform validates from `infra/api` and `infra/site`.
- A backend image can be built from `backend/` and deployed through the moved
  Terraform stack.
- `https://gametree.zmbm.dev` and
  `https://gametree-api.zmbm.dev/api/health` verify after cutover.
- Old `gametree-api` and `infra` repos are archived or clearly marked as moved.
