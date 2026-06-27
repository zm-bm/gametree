output "bucket_name" {
  description = "S3 bucket name for the site"
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.cdn.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.cdn.arn
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions deployments"
  value       = aws_iam_role.deploy.arn
}
