#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-gametree-api}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$REPO_ROOT" rev-parse --short HEAD)}"
PUSH="${PUSH:-1}"

is_truthy() {
  case "${1,,}" in
    1 | true | yes | y | on) return 0 ;;
    *) return 1 ;;
  esac
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd aws

AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "Building $IMAGE_URI"
docker build -f "$BACKEND_DIR/docker/Dockerfile" -t "$IMAGE_URI" "$BACKEND_DIR"

if is_truthy "$PUSH"; then
  echo "Logging in to $ECR_REGISTRY"
  aws ecr get-login-password --region "$AWS_REGION" \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY"

  echo "Pushing $IMAGE_URI"
  docker push "$IMAGE_URI"
else
  echo "PUSH=0; skipping ECR login and push"
fi

cat <<EOF

Image URI:
$IMAGE_URI

Terraform reminder:
  Update api_image in /home/rick/code/gametree/infra/api/terraform.tfvars
  Then run terraform plan/apply from /home/rick/code/gametree/infra/api
EOF
