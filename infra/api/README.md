# API Terraform

This stack runs the backend API on a single EC2 instance behind the shared edge
ALB and CloudFront.

## What It Manages

- EC2 launch template + ASG (`desired=1`)
- Security group allowing ALB -> instance on port 80
- IAM role/profile for S3 data restore, SSM, and ECR pulls
- Route53 `A`/`AAAA` for `gametree-api.zmbm.dev`

The instance userdata installs Docker, syncs RocksDB data from S3, and starts
the API + nginx through a Docker Compose file generated on the instance. It
does not use a checked-in Compose file from this repo.

## Before You Apply

- shared `network`, `edge`, and `dns` state already exist in the shared infra repo
- API container image pushed to `api_image`
- RocksDB data uploaded to S3

## Usage

Create an ignored local `terraform.tfvars`, or pass values with `-var`:

```bash
cd infra/api
terraform init
terraform apply
```

Required non-default variables are `ssh_cidr`, `rocksdb_s3_bucket`, and
`api_image`. Set `rocksdb_s3_prefix` if the RocksDB files live under a bucket
prefix.

## Deploy App Changes

From the repo root:

```bash
./scripts/backend-deploy.sh
```

That builds and pushes a backend image, updates local `terraform.tfvars`,
applies this stack, waits for the ASG refresh, and checks health.

If AWS SSO is expired, refresh it first:

```bash
aws sso login --profile admin
```

Notes:

- The ASG is currently `min=max=desired=1`, so instance refresh causes a short outage.
- Avoid reusing `:latest` for deploys; use unique tags or digests so each deploy is explicit and repeatable.

## AMI refresh process

The launch template uses the latest Amazon Linux 2023 AMI from AWS. To roll to
a newer AMI:

1. Run `terraform plan` and `terraform apply` in `infra/api`.
2. Let the ASG instance refresh replace the running instance.
