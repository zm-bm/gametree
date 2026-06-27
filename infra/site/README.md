# Site Terraform

Terraform for `gametree.zmbm.dev`.

This is the future single-site stack for Gametree. It still reads shared edge
state for the `/api/*` ALB origin.

The static-site module source points at the shared infra checkout as a sibling
repo, so `../infra` must be present locally when running this stack.

## Validate

```bash
terraform init -backend=false
terraform validate
```

## State

The backend key is `gametree/site.tfstate`. Do not apply this stack until the
old `static-sites/prod.tfstate` ownership has been split or reconciled.
