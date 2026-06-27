data "aws_caller_identity" "current" {}

data "aws_route53_zone" "zone" {
  name         = var.zone_name
  private_zone = false
}

data "aws_acm_certificate" "cert" {
  count       = var.cert_arn == null ? 1 : 0
  domain      = coalesce(var.cert_domain, var.domain)
  statuses    = ["ISSUED"]
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

locals {
  bucket_name        = coalesce(var.bucket_name, "${var.site_name}-bucket")
  site_origin_id     = "${var.site_name}-s3"
  artifact_origin_id = var.artifact_origin == null ? null : "${var.site_name}-artifacts-s3"
  all_domains        = concat([var.domain], var.alt_domains)
  www_redirect_domain = var.www_redirect_domain != null ? var.www_redirect_domain : (
    length([for d in var.alt_domains : d if startswith(d, "www.")]) > 0 ?
    [for d in var.alt_domains : d if startswith(d, "www.")][0] :
    null
  )
  certificate_arn     = var.cert_arn != null ? var.cert_arn : data.aws_acm_certificate.cert[0].arn
  api_proxy_origin_id = "${var.site_name}-api-proxy"
  spa_fallback_enabled = (
    var.spa_fallback_enabled != null ?
    var.spa_fallback_enabled :
    var.artifact_origin == null
  )
}

data "aws_s3_bucket" "artifact" {
  count  = var.artifact_origin == null ? 0 : 1
  bucket = var.artifact_origin.bucket_name
}

resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name

  tags = merge(
    {
      Project   = var.site_name
      ManagedBy = "terraform"
    },
    var.tags
  )
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.site_name}-oac"
  description                       = "OAC for ${var.domain} static site bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "viewer_request" {
  name    = "${var.site_name}-viewer-req"
  runtime = "cloudfront-js-1.0"
  comment = "Redirect + pretty URL rewrite for ${var.domain}"
  publish = true

  code = templatefile("${path.module}/viewer-request.js.tpl", {
    canonical_domain  = var.domain
    redirect_www_from = local.www_redirect_domain != null ? local.www_redirect_domain : ""
  })
}

resource "aws_cloudfront_response_headers_policy" "custom" {
  count = length(var.response_headers) > 0 ? 1 : 0
  name  = "${var.site_name}-response-headers"

  custom_headers_config {
    dynamic "items" {
      for_each = var.response_headers
      content {
        header   = items.key
        value    = items.value
        override = true
      }
    }
  }
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = var.enabled
  comment             = "${var.domain} static site"
  default_root_object = "index.html"
  price_class         = var.price_class
  is_ipv6_enabled     = true

  aliases = local.all_domains

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = local.site_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  dynamic "origin" {
    for_each = var.artifact_origin == null ? [] : [var.artifact_origin]
    content {
      domain_name              = data.aws_s3_bucket.artifact[0].bucket_regional_domain_name
      origin_id                = local.artifact_origin_id
      origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
    }
  }

  dynamic "origin" {
    for_each = var.api_proxy == null ? [] : [var.api_proxy]
    content {
      domain_name = origin.value.origin_domain
      origin_id   = local.api_proxy_origin_id

      custom_header {
        name  = "X-App-Name"
        value = origin.value.app_header_value
      }

      custom_origin_config {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "http-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.api_proxy == null ? [] : [var.api_proxy]
    content {
      path_pattern           = ordered_cache_behavior.value.path_pattern
      target_origin_id       = local.api_proxy_origin_id
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"]
      cached_methods  = ["GET", "HEAD"]

      compress    = true
      min_ttl     = 0
      default_ttl = 0
      max_ttl     = 0

      forwarded_values {
        query_string = true
        headers      = ["*"]
        cookies {
          forward = "all"
        }
      }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.artifact_origin == null ? [] : var.artifact_origin.path_patterns
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = local.artifact_origin_id
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD"]
      cached_methods  = ["GET", "HEAD"]

      compress    = true
      min_ttl     = var.artifact_origin.min_ttl
      default_ttl = var.artifact_origin.default_ttl
      max_ttl     = var.artifact_origin.max_ttl

      forwarded_values {
        query_string = false

        cookies {
          forward = "none"
        }
      }

      response_headers_policy_id = length(var.response_headers) > 0 ? aws_cloudfront_response_headers_policy.custom[0].id : null
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.site_origin_id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = length(var.response_headers) > 0 ? aws_cloudfront_response_headers_policy.custom[0].id : null

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  dynamic "custom_error_response" {
    for_each = local.spa_fallback_enabled ? [403, 404] : []
    content {
      error_code         = custom_error_response.value
      response_code      = 200
      response_page_path = "/index.html"
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = local.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "bucket" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.site.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.bucket.json

  depends_on = [
    aws_s3_bucket_public_access_block.site,
    aws_s3_bucket_ownership_controls.site,
    aws_cloudfront_distribution.cdn,
  ]
}

data "aws_iam_policy_document" "artifact_bucket" {
  count = var.artifact_origin == null ? 0 : 1

  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${data.aws_s3_bucket.artifact[0].arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "artifact" {
  count  = var.artifact_origin == null ? 0 : 1
  bucket = data.aws_s3_bucket.artifact[0].id
  policy = data.aws_iam_policy_document.artifact_bucket[0].json

  depends_on = [
    aws_cloudfront_distribution.cdn,
  ]
}

resource "aws_route53_record" "aliases_a" {
  for_each = toset(local.all_domains)
  zone_id  = data.aws_route53_zone.zone.zone_id
  name     = each.value
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "aliases_aaaa" {
  for_each = toset(local.all_domains)
  zone_id  = data.aws_route53_zone.zone.zone_id
  name     = each.value
  type     = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

data "aws_iam_openid_connect_provider" "github" {
  arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

resource "aws_iam_role" "deploy" {
  name = "${var.site_name}-gh-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              for ref in var.github_refs : "repo:${var.github_repo}:ref:${ref}"
            ]
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "deploy" {
  role = aws_iam_role.deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.site.arn,
          "${aws_s3_bucket.site.arn}/*",
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = aws_cloudfront_distribution.cdn.arn
      }
    ]
  })
}
