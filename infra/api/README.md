# gametree-api stack

Terraform stack for a single-instance `gametree-api` deployment behind the shared edge ALB + CloudFront.

## What this stack creates

- EC2 launch template + ASG (`desired=1`)
- Security group allowing ALB -> instance on port 80
- IAM role/profile with:
  - `s3:ListBucket` + `s3:GetObject` for RocksDB restore
  - SSM core policy
  - ECR read-only policy
- Route53 `A`/`AAAA` for `gametree-api.zmbm.dev`

Bootstrapping happens in userdata:

1. Install Docker + AWS CLI + Docker Compose plugin.
2. `aws s3 sync` RocksDB files into `/opt/gametree-api/data`.
3. Start `api-prod` + `nginx` via Docker Compose.

## Prerequisites

- shared `network` state applied in the shared infra repo
- shared `edge` state applied in the shared infra repo, including `gametree_api_*` outputs
- shared `dns` state applied in the shared infra repo
- API container image pushed to `api_image`
- RocksDB data uploaded to S3 (`rocksdb_s3_bucket` + `rocksdb_s3_prefix`)

## Usage

Create an untracked local `terraform.tfvars` with the required values, or pass
them with `-var` flags:

```bash
cd infra/api
terraform init
terraform apply
```

Required non-default variables are `ssh_cidr`, `rocksdb_s3_bucket`, and
`api_image`. Set `rocksdb_s3_prefix` if the RocksDB files live under a bucket
prefix.

## Deploying gametree-api app changes

Use this flow when you changed code in `backend/` and want prod to run the new version.

1. Build and push a new image tag from the app repo.

```bash
cd /home/rick/code/gametree
./scripts/backend-build-image.sh
```

2. Update `api_image` in `infra/api/terraform.tfvars` to that immutable tag (or digest), then apply Terraform.

```bash
cd /home/rick/code/gametree/infra/api
terraform plan
terraform apply
```

3. Replace the running instance so it boots with the new launch template/userdata and pulls the new image.

```bash
cd /home/rick/code/gametree/infra/api

ASG_NAME=$(terraform output -raw api_asg_name)
INSTANCE_ID=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names "$ASG_NAME" \
  --region us-east-1 \
  --query 'AutoScalingGroups[0].Instances[0].InstanceId' \
  --output text)

aws autoscaling terminate-instance-in-auto-scaling-group \
  --instance-id "$INSTANCE_ID" \
  --no-should-decrement-desired-capacity \
  --region us-east-1
```

4. Verify health.

```bash
curl -i https://gametree-api.zmbm.dev/api/health
```

Notes:

- The ASG is currently `min=max=desired=1`, so replacing the instance causes a short outage.
- Avoid reusing `:latest` for deploys; use unique tags or digests so each deploy is explicit and repeatable.

## AMI refresh process

If by "update the AMI" you mean OS/base-image refresh:

- This stack does **not** use a custom Packer AMI for `gametree-api` today.
- `launch-template.tf` points to `data.aws_ami.al2023` (latest Amazon Linux 2023 AMI from AWS).

To roll to a newer AL2023 AMI:

1. Run `terraform plan` and `terraform apply` in `infra/api`.
2. Replace the running instance using the same ASG terminate command above.

That is the AMI update path for this stack right now.
