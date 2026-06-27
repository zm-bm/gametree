variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "ssh_cidr" {
  description = "CIDR block allowed to SSH to gametree-api instances (for example, 203.0.113.10/32)."
  type        = string
}

variable "ssh_key_name" {
  description = "EC2 key pair name for SSH access."
  type        = string
  default     = "weather-map-key"
}

variable "rocksdb_s3_bucket" {
  description = "S3 bucket that stores the uploaded RocksDB data."
  type        = string
}

variable "rocksdb_s3_prefix" {
  description = "Optional prefix under rocksdb_s3_bucket that contains RocksDB data."
  type        = string
  default     = ""
}

variable "api_image" {
  description = "Container image for gametree-api (for example, <account>.dkr.ecr.us-east-1.amazonaws.com/gametree-api:latest)."
  type        = string
}

variable "cors_allow_origin" {
  description = "Value for Access-Control-Allow-Origin returned by nginx."
  type        = string
  default     = "https://gametree.zmbm.dev"
}

provider "aws" {
  region = var.aws_region
}
