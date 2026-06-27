locals {
  state_bucket = "zmbm-tf-state-bucket"
  state_region = "us-east-1"
  state_keys = {
    edge = "edge.tfstate"
  }
}

data "terraform_remote_state" "edge" {
  backend = "s3"
  config = {
    bucket = local.state_bucket
    key    = local.state_keys.edge
    region = local.state_region
  }
}

module "static_site" {
  source = "../../../infra/modules/static-site"

  site_name   = "gametree"
  domain      = "gametree.zmbm.dev"
  alt_domains = []
  zone_name   = "zmbm.dev"
  cert_domain = "zmbm.dev"
  bucket_name = "gametree-bucket"
  github_repo = "zm-bm/gametree"
  github_refs = ["refs/heads/main", "refs/tags/v*"]
  price_class = "PriceClass_100"
  response_headers = {
    "Cross-Origin-Embedder-Policy" = "require-corp"
    "Cross-Origin-Opener-Policy"   = "same-origin"
  }
  api_proxy = {
    origin_domain    = data.terraform_remote_state.edge.outputs.alb_dns_name
    app_header_value = "gametree-api"
    path_pattern     = "/api/*"
  }
  www_redirect_domain = ""
  tags = {
    Env       = "prod"
    ManagedBy = "terraform"
    Stack     = "gametree-site"
  }
}
