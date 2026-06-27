#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="${S3_BUCKET:-gametree-bucket}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
DRY_RUN="${DRY_RUN:-0}"

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

require_cmd npm
require_cmd aws

(
  cd "$FRONTEND_DIR"
  npm ci
  npm run build

  sync_args=(
    s3 sync dist/ "s3://${S3_BUCKET}"
    --delete
    --exclude ".gitignore"
    --exclude "*/.gitignore"
  )

  if is_truthy "$DRY_RUN"; then
    sync_args+=(--dryrun)
  fi

  aws --region "$AWS_REGION" "${sync_args[@]}"
)

if is_truthy "$DRY_RUN"; then
  echo "DRY_RUN=1; skipping CloudFront invalidation"
elif [[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
  aws --region "$AWS_REGION" cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"
else
  echo "CLOUDFRONT_DISTRIBUTION_ID is not set; skipping invalidation"
fi
