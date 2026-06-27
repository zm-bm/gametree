locals {
  # Global naming / config
  environment = "prod"
  api_domain  = "gametree-api.zmbm.dev"

  # Remote state settings
  state_bucket = "zmbm-tf-state-bucket"
  state_region = "us-east-1"
  state_keys = {
    network = "network.tfstate"
    edge    = "edge.tfstate"
    dns     = "dns.tfstate"
  }

  # Compute defaults
  api_port       = 80
  instance_type  = "t3.small"
  asg_min        = 1
  asg_max        = 1
  asg_desired    = 1
  root_volume_gb = 30
  al2023_ami_id  = data.aws_ami.al2023.id

  # RocksDB data location
  rocksdb_s3_prefix = trim(var.rocksdb_s3_prefix, "/")
  rocksdb_s3_uri    = local.rocksdb_s3_prefix == "" ? "s3://${var.rocksdb_s3_bucket}" : "s3://${var.rocksdb_s3_bucket}/${local.rocksdb_s3_prefix}"

  tags = {
    app       = "gametree-api"
    ManagedBy = "terraform"
    Stack     = "gametree-api"
  }
}
