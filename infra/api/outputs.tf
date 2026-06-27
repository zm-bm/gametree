output "api_security_group_id" {
  value = aws_security_group.api.id
}

output "api_asg_name" {
  value = aws_autoscaling_group.api.name
}

output "api_domain" {
  value = local.api_domain
}

output "rocksdb_s3_uri" {
  value = local.rocksdb_s3_uri
}
