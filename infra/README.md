# Gametree Infrastructure

Terraform for the AWS bits this repo owns.

## Layout

- `api/`: EC2/ASG stack for the backend API.
- `site/`: static site stack for `gametree.zmbm.dev`.

Shared DNS, certificates, networking, edge routing, and GitHub OIDC still live
in the sibling `../infra` repo. The stacks here read those outputs through
remote state.

The site stack expects the shared infra checkout to be available as a sibling
repo at `../infra`.

## API

Validate:

```bash
terraform -chdir=infra/api init -backend=false
terraform -chdir=infra/api validate
```

Apply:

```bash
cd infra/api
terraform init
terraform plan
terraform apply
```

For app deploys, use `./scripts/backend-deploy.sh` from the repo root. See
[api/README.md](api/README.md) for details.

## Site

Validate:

```bash
terraform -chdir=infra/site init -backend=false
terraform -chdir=infra/site validate
```

The site stack uses a new `gametree/site.tfstate` backend key. Do not apply it
until the old multi-site `static-sites/prod.tfstate` ownership has been split
or otherwise reconciled.
