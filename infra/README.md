# Gametree Infrastructure

Project-specific infrastructure for Gametree.

## Layout

- `api`: single-instance `gametree-api` deployment behind the shared edge ALB
  and CloudFront distribution.
- `site`: static site and CloudFront infrastructure for `gametree.zmbm.dev`.
- `modules/static-site`: local copy of the static-site Terraform module used by
  the site stack.

Shared account foundations such as DNS, certificates, network, edge ALB, and
GitHub OIDC remain in the shared infra repo/state.

## API

Validate the API stack:

```bash
terraform -chdir=infra/api init -backend=false
terraform -chdir=infra/api validate
```

Apply API infrastructure from this repo:

```bash
cd infra/api
terraform init
terraform plan
terraform apply
```

See [api/README.md](api/README.md) for API deploy and instance replacement
commands.

## Site

Validate the site stack:

```bash
terraform -chdir=infra/site init -backend=false
terraform -chdir=infra/site validate
```

The site stack uses a new `gametree/site.tfstate` backend key. Do not apply it
until the old multi-site `static-sites/prod.tfstate` ownership has been split
or otherwise reconciled.
