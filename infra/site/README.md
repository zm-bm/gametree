# Gametree Site Stack

Static site and CloudFront infrastructure for `gametree.zmbm.dev`.

This stack is intentionally project-specific and replaces the old multi-site
configuration for Gametree only. It still depends on shared edge state for the
ALB origin used by `/api/*`.

## Validate

```bash
terraform init -backend=false
terraform validate
```

## State Note

The backend key is `gametree/site.tfstate`. Do not apply this stack until the
old `static-sites/prod.tfstate` ownership has been split or reconciled.
