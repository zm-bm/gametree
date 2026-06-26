# Gametree Monorepo Migration Plan

Temporary planning document for folding `gametree-api` and the standalone
`infra` repo into `/home/rick/code/gametree`, with a repo shape closer to
`/home/rick/code/weather-map`.

## Goal

Make `/home/rick/code/gametree` the only active Gametree repo:

```text
gametree/
  frontend/        # current Vite/React app from the gametree repo
  backend/         # current FastAPI/RocksDB service from gametree-api
  infra/           # current Terraform repo contents
  scripts/         # repo-level operator/dev scripts
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
- Copy `/home/rick/code/infra` into `infra/` without preserving its separate
  Git history.
- Do not rename Terraform resources or state keys during the first pass.
- Keep the current root `LICENSE` in place during the migration. Imported repo
  licenses, if any, remain under their imported directories until licensing is
  reviewed deliberately.
- Accept temporary broken local/dev/deploy flows while paths and workflows are
  updated.

## Current Shape

Observed local repos:

- `/home/rick/code/gametree`
  - Vite/React frontend at repo root.
  - `package.json`, `vite.config.ts`, `src/`, `public/`, `.github/workflows`.
  - Vite proxies `/api` to `http://localhost:8080`.
- `/home/rick/code/gametree-api`
  - FastAPI service.
  - Python package in `src/gametree_api`.
  - Docker files under `docker/`.
  - Local compose file at `docker/docker-compose.yml`.
  - Make targets for install/test/build/run/ingest.
- `/home/rick/code/infra`
  - Terraform modules in `modules/`.
  - Terraform stacks in `stacks/`.
  - Gametree-specific API stack at `stacks/gametree-api`.
  - Static site stack at `stacks/static-sites`.
  - Shared account stacks like `dns`, `certs`, `network`, `edge`, and
    `github-oidc`.
- `/home/rick/code/weather-map`
  - Project code is grouped under `frontend/`, `backend/`, `infra/`, `scripts/`,
    `docs/`, plus root `compose.yml` and `README.md`.

## Phase 0: Baseline And Freeze

1. Confirm all three repos are clean or intentionally dirty:

   ```bash
   git -C /home/rick/code/gametree status --short
   git -C /home/rick/code/gametree-api status --short
   git -C /home/rick/code/infra status --short
   ```

2. Record current remote URLs and branches:

   ```bash
   git -C /home/rick/code/gametree remote -v
   git -C /home/rick/code/gametree-api remote -v
   git -C /home/rick/code/infra remote -v
   ```

3. Run current checks before moving anything:

   ```bash
   cd /home/rick/code/gametree
   npm test -- --run
   npm run build

   cd /home/rick/code/gametree-api
   make test

   cd /home/rick/code/infra
   terraform -chdir=stacks/gametree-api fmt -check
   terraform -chdir=stacks/static-sites fmt -check
   ```

4. Create a branch in `gametree`:

   ```bash
   cd /home/rick/code/gametree
   git switch -c monorepo-migration
   ```

## Phase 1: Move Frontend Into `frontend/`

Move the current frontend root files into a dedicated directory:

```bash
cd /home/rick/code/gametree
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
cd /home/rick/code/gametree/frontend
npm ci
npm test -- --run
npm run build
```

## Phase 2: Copy `gametree-api` Into `backend/`

Copy the backend source files without importing the old repository history:

```bash
cd /home/rick/code/gametree
mkdir backend
rsync -a \
  --exclude='.git/' \
  --exclude='.venv/' \
  --exclude='.pytest_cache/' \
  --exclude='gametree_api.egg-info/' \
  --exclude='data/' \
  /home/rick/code/gametree-api/ \
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
cd /home/rick/code/gametree/backend
make install
make test
make run-dev BUILD=1

cd /home/rick/code/gametree
docker compose up --build
curl -i http://localhost:8080/api/health
```

## Phase 3: Copy Infra Into `infra/`

Copy the infra files without importing the old repository history:

```bash
cd /home/rick/code/gametree
mkdir infra
rsync -a \
  --exclude='.git/' \
  --exclude='.terraform/' \
  --exclude='*.tfstate' \
  --exclude='*.tfstate.*' \
  --exclude='*.tfvars' \
  --exclude='*.tfvars.json' \
  --exclude='.vscode/' \
  /home/rick/code/infra/ \
  infra/
```

Then review and stage the copied files:

```bash
git status --short
git add infra
```

Keep the initial copied layout intact:

```text
infra/
  modules/
  stacks/
  templates/
  README.md
```

This keeps existing Terraform relative paths valid, for example:

- `infra/stacks/static-sites` can still use
  `source = "../../modules/static-site"`.
- `infra/stacks/gametree-api` can still use
  `../../templates/gametree-api-userdata.sh.tmpl`.

Update docs and commands that point at old absolute paths:

- Replace `/home/rick/code/infra/stacks/gametree-api` with
  `/home/rick/code/gametree/infra/stacks/gametree-api`.
- Replace old app repo paths in deploy instructions with:
  - frontend: `/home/rick/code/gametree/frontend`
  - backend: `/home/rick/code/gametree/backend`
  - infra: `/home/rick/code/gametree/infra`
- Update backend image build instructions:

  ```bash
  cd /home/rick/code/gametree/backend
  docker build -f docker/Dockerfile -t "${ECR_REPO}:${IMAGE_TAG}" .
  ```

Terraform state notes:

- Keep existing S3 backend keys such as `gametree-api/prod.tfstate`,
  `static-sites/prod.tfstate`, `edge.tfstate`, and `network.tfstate`.
- Moving the working directory does not require `terraform state mv`.
- Avoid resource renames in the first pass so plans should be path-only/doc-only
  unless input variables change.

Validation:

```bash
cd /home/rick/code/gametree
terraform -chdir=infra/stacks/gametree-api fmt -check
terraform -chdir=infra/stacks/static-sites fmt -check
terraform -chdir=infra/stacks/edge fmt -check

terraform -chdir=infra/stacks/gametree-api init
terraform -chdir=infra/stacks/gametree-api validate

terraform -chdir=infra/stacks/static-sites init
terraform -chdir=infra/stacks/static-sites validate
```

Use `terraform plan` only after confirming the real `terraform.tfvars` files are
available locally. Do not commit `.tfvars` unless they are intentionally already
tracked and non-sensitive.

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

Update existing workflows for the new paths:

- Frontend CI:
  - `working-directory: frontend`
  - `cache-dependency-path: frontend/package-lock.json`
  - `npm ci`
  - `npm test -- --run`
  - `npm run build`

- Frontend deploy:
  - Build from `frontend/`.
  - Sync `frontend/dist/`.
  - Existing `AWS_DEPLOY_ROLE_ARN` and `CLOUDFRONT_DISTRIBUTION_ID` secrets can
    remain if the static-site deployment role still trusts `zm-bm/gametree`.

- Backend CI:
  - Add Python setup.
  - Install `backend[dev]`.
  - Run `pytest` against `backend/tests`.

- Backend deploy:
  - Keep manual local backend deploy for the first migration unless you want to
    add ECR push permissions now.
  - If moving backend image publishing into GitHub Actions, add/update the
    required OIDC trust and ECR permissions in Terraform first.

## Phase 6: Production Cutover

Because downtime is acceptable, use the simple order:

1. Merge the monorepo migration to `gametree/main`.
2. Run frontend deploy from the updated workflow.
3. Build and push a backend image from `backend/`:

   ```bash
   cd /home/rick/code/gametree/backend

   export AWS_REGION=us-east-1
   export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
   export ECR_REPO="${ECR_REGISTRY}/gametree-api"
   export IMAGE_TAG=$(git -C /home/rick/code/gametree rev-parse --short HEAD)

   aws ecr get-login-password --region "$AWS_REGION" \
     | docker login --username AWS --password-stdin "$ECR_REGISTRY"

   docker build -f docker/Dockerfile -t "${ECR_REPO}:${IMAGE_TAG}" .
   docker push "${ECR_REPO}:${IMAGE_TAG}"
   ```

4. Update `api_image` in the real, uncommitted
   `infra/stacks/gametree-api/terraform.tfvars`.
5. Apply the API stack:

   ```bash
   cd /home/rick/code/gametree/infra/stacks/gametree-api
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
- Terraform validates from `infra/stacks/gametree-api` and
  `infra/stacks/static-sites`.
- A backend image can be built from `backend/` and deployed through the moved
  Terraform stack.
- `https://gametree.zmbm.dev` and
  `https://gametree-api.zmbm.dev/api/health` verify after cutover.
- Old `gametree-api` and `infra` repos are archived or clearly marked as moved.
