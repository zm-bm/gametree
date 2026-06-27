// Remote state dependencies (shared stacks).
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = local.state_bucket
    key    = local.state_keys.network
    region = local.state_region
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

data "terraform_remote_state" "dns" {
  backend = "s3"
  config = {
    bucket = local.state_bucket
    key    = local.state_keys.dns
    region = local.state_region
  }
}

// Latest Amazon Linux 2023 AMI for EC2.
data "aws_ami" "al2023" {
  most_recent = true

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["amazon"]
}
