variable "site_name" {
  description = "Short name used for resource naming and tagging"
  type        = string
}

variable "domain" {
  description = "Primary domain for the static site (e.g., zmbm.dev or tankdle.zmbm.dev)"
  type        = string
}

variable "alt_domains" {
  description = "Additional domains (e.g., www.zmbm.dev) that alias to the distribution"
  type        = list(string)
  default     = []
}

variable "zone_name" {
  description = "Route53 hosted zone name (e.g., zmbm.dev)"
  type        = string
}

variable "cert_domain" {
  description = "Domain used to lookup the ACM certificate (ignored if cert_arn is provided)"
  type        = string
  default     = null
}

variable "cert_arn" {
  description = "Existing ACM certificate ARN (overrides cert_domain lookup)"
  type        = string
  default     = null
}

variable "bucket_name" {
  description = "Optional explicit S3 bucket name (defaults to <site_name>-bucket)"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "GitHub repository in owner/name form that deploys the site"
  type        = string
}

variable "github_refs" {
  description = "List of allowed refs (e.g., refs/heads/main) for OIDC trust"
  type        = list(string)
  default     = ["refs/heads/main", "refs/tags/v*"]
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "enabled" {
  description = "Whether the CloudFront distribution should serve traffic."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Optional extra tags applied to resources that support tagging"
  type        = map(string)
  default     = {}
}

variable "www_redirect_domain" {
  description = "If set, redirect this host to the canonical domain (commonly www.<domain>)"
  type        = string
  default     = null
}

variable "response_headers" {
  description = "Custom response headers to attach to CloudFront responses."
  type        = map(string)
  default     = {}
}

variable "spa_fallback_enabled" {
  description = "Whether CloudFront should map S3 403/404 responses to /index.html. Defaults to true unless artifact_origin is set."
  type        = bool
  default     = null
}

variable "api_proxy" {
  description = "Optional API proxy configuration for routing a path pattern to an ALB/custom origin."
  type = object({
    origin_domain    = string
    app_header_value = string
    path_pattern     = optional(string, "/api/*")
  })
  default = null
}

variable "artifact_origin" {
  description = "Optional S3 artifact origin served by path-based CloudFront behaviors."
  type = object({
    bucket_name   = string
    path_patterns = list(string)
    min_ttl       = optional(number, 0)
    default_ttl   = optional(number, 3600)
    max_ttl       = optional(number, 86400)
  })
  default = null
}
