// Route gametree-api.zmbm.dev to CloudFront.
resource "aws_route53_record" "gametree_api_a" {
  zone_id = data.terraform_remote_state.dns.outputs.zmbm_zone_id
  name    = local.api_domain
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.edge.outputs.gametree_api_cloudfront_domain
    zone_id                = data.terraform_remote_state.edge.outputs.gametree_api_cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "gametree_api_aaaa" {
  zone_id = data.terraform_remote_state.dns.outputs.zmbm_zone_id
  name    = local.api_domain
  type    = "AAAA"

  alias {
    name                   = data.terraform_remote_state.edge.outputs.gametree_api_cloudfront_domain
    zone_id                = data.terraform_remote_state.edge.outputs.gametree_api_cloudfront_zone_id
    evaluate_target_health = false
  }
}
