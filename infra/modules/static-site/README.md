# static site terraform module

Reusable module that provisions an S3 + CloudFront static site and an IAM role
for GitHub Actions deployments. This README is focused on module usage and
inputs/outputs. Deployment workflow steps live in `static-sites/README.md`.

## Usage

```hcl
module "static_site" {
  source = "../modules/static-site"

  site_name           = "example"
  domain              = "example.zmbm.dev"
  alt_domains         = []
  zone_name           = "zmbm.dev"
  cert_domain         = "zmbm.dev"
  bucket_name         = "example-bucket"
  github_repo         = "zm-bm/example"
  github_refs         = ["refs/heads/main", "refs/tags/v*"]
  price_class         = "PriceClass_100"
  www_redirect_domain = ""
  response_headers = {
    "Cross-Origin-Opener-Policy"   = "same-origin"
    "Cross-Origin-Embedder-Policy" = "require-corp"
  }
  api_proxy = {
    origin_domain    = "zmbm-edge-xxxxxxxx.us-east-1.elb.amazonaws.com"
    app_header_value = "gametree-api"
    path_pattern     = "/api/*"
  }
  artifact_origin = {
    bucket_name   = "example-artifacts-bucket"
    path_patterns = ["/manifests/*", "/fields/*"]
    default_ttl   = 3600
    max_ttl       = 86400
  }
  tags = {
    Env = "prod"
  }
}
```

## Inputs

- `site_name`: Short name used for resource naming.
- `domain`: Primary domain for the site.
- `alt_domains`: Alternate domain names to include on the cert.
- `zone_name`: Route53 hosted zone name.
- `cert_domain`: Certificate domain name (often same as `zone_name`).
- `bucket_name`: S3 bucket name for site assets.
- `github_repo`: GitHub repo in `owner/repo` format for OIDC trust.
- `github_refs`: Git refs allowed to assume the deploy role.
- `price_class`: CloudFront price class (default `PriceClass_100`).
- `www_redirect_domain`: Optional redirect domain.
- `response_headers`: Map of custom response headers to attach via a response headers policy.
- `spa_fallback_enabled`: Optional override for `403/404 -> /index.html`. Defaults to disabled when `artifact_origin` is set, otherwise enabled.
- `api_proxy`: Optional path-based API proxy configuration for forwarding routes (for example `/api/*`) to a custom origin such as the shared ALB.
- `artifact_origin`: Optional S3 artifact origin with path patterns served by CloudFront without the frontend viewer-request rewrite.
- `tags`: Map of tags applied to resources.

## Outputs

- `bucket_name`
- `distribution_id`
- `distribution_domain_name`
- `deploy_role_arn`

## Future improvements

- Access logging: enable CloudFront and S3 access logs with a dedicated log bucket plus lifecycle rules for retention.
- Modern cache policies: replace legacy `forwarded_values` with explicit cache/origin request policies for clearer caching behavior.
- Default security headers: provide a baseline set (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, etc.) with per-site overrides.
- Certificate override at root: surface `cert_arn` in the root module for per-site ACM selection without relying on lookup.
