#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_API_DIR="$REPO_ROOT/infra/api"

AWS_PROFILE="${AWS_PROFILE:-admin}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-gametree-api}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$REPO_ROOT" rev-parse --short HEAD)}"
TFVARS_PATH="${TFVARS_PATH:-infra/api/terraform.tfvars}"
PLAN_ONLY="${PLAN_ONLY:-0}"
PUSH="${PUSH:-1}"
ASG_NAME="${ASG_NAME:-gametree-api-asg}"
HEALTH_URL="${HEALTH_URL:-https://gametree-api.zmbm.dev/api/health}"
INSTANCE_REFRESH_TIMEOUT_SECONDS="${INSTANCE_REFRESH_TIMEOUT_SECONDS:-3600}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-600}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-15}"

if [[ "$TFVARS_PATH" = /* ]]; then
  TFVARS_ABS="$TFVARS_PATH"
else
  TFVARS_ABS="$REPO_ROOT/$TFVARS_PATH"
fi

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

require_cmd aws
require_cmd curl
require_cmd docker
require_cmd python3
require_cmd terraform

if ! is_truthy "$PLAN_ONLY" && ! is_truthy "$PUSH"; then
  echo "Error: PUSH=0 requires PLAN_ONLY=1 so a no-push run cannot apply production infrastructure." >&2
  exit 1
fi

if [[ ! -f "$TFVARS_ABS" ]]; then
  echo "Error: missing $TFVARS_ABS" >&2
  echo "Create an ignored local tfvars file before deploying, for example:" >&2
  echo "  cp ../infra/stacks/gametree-api/terraform.tfvars infra/api/terraform.tfvars" >&2
  exit 1
fi

case "$TFVARS_ABS" in
  "$REPO_ROOT"/*)
    TFVARS_REL="${TFVARS_ABS#"$REPO_ROOT"/}"
    if ! git -C "$REPO_ROOT" check-ignore -q "$TFVARS_REL"; then
      echo "Error: $TFVARS_REL is not ignored by git; refusing to update local secrets." >&2
      exit 1
    fi
    ;;
esac

if ! aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text >/dev/null 2>&1; then
  echo "Error: AWS auth for profile '$AWS_PROFILE' is not available." >&2
  echo "Run: aws sso login --profile $AWS_PROFILE" >&2
  exit 1
fi

AWS_ACCOUNT_ID="$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

PLAN_FILE="$(mktemp -t gametree-api.XXXXXX.tfplan)"
PLAN_JSON="$(mktemp -t gametree-api.XXXXXX.json)"
CHANGES_FILE="$(mktemp -t gametree-api-changes.XXXXXX.txt)"
trap 'rm -f "$PLAN_FILE" "$PLAN_JSON" "$CHANGES_FILE"' EXIT

terraform_with_profile_creds() {
  local profile="$AWS_PROFILE"
  local credential_env

  if ! credential_env="$(aws configure export-credentials --profile "$profile" --format env-no-export)"; then
    echo "Error: unable to export AWS credentials for profile '$profile'." >&2
    echo "Run: aws sso login --profile $profile" >&2
    exit 1
  fi

  (
    set -a
    # shellcheck disable=SC1090
    source <(printf '%s\n' "$credential_env")
    set +a
    unset AWS_PROFILE AWS_DEFAULT_PROFILE AWS_SDK_LOAD_CONFIG
    terraform -chdir="$INFRA_API_DIR" "$@"
  )
}

update_tfvars_image() {
  python3 - "$TFVARS_ABS" "$IMAGE_URI" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
image_uri = sys.argv[2]
text = path.read_text()
text, count = re.subn(
    r'(?m)^api_image\s*=\s*"[^"]*"',
    f'api_image = "{image_uri}"',
    text,
)
if count != 1:
    raise SystemExit(f"expected exactly one api_image assignment in {path}, found {count}")
path.write_text(text)
PY
}

check_plan_safety() {
  python3 - "$PLAN_JSON" "$CHANGES_FILE" <<'PY'
from pathlib import Path
import json
import sys

plan_path = Path(sys.argv[1])
changes_path = Path(sys.argv[2])
allowed = {"aws_launch_template.api", "aws_autoscaling_group.api"}
plan = json.loads(plan_path.read_text())
bad = []
changed = []

for change in plan.get("resource_changes", []):
    if change.get("mode") == "data":
        continue
    address = change.get("address")
    actions = change.get("change", {}).get("actions", [])
    if actions == ["no-op"]:
        continue
    if actions == ["update"] and address in allowed:
        changed.append(address)
        continue
    bad.append((address, actions))

if bad:
    print("Unsafe Terraform plan; refusing to apply.", file=sys.stderr)
    for address, actions in bad:
        print(f"  {address}: {','.join(actions)}", file=sys.stderr)
    raise SystemExit(1)

changes_path.write_text("\n".join(sorted(set(changed))))
if changed:
    print("Safe Terraform changes:")
    for address in sorted(set(changed)):
        print(f"  {address}")
else:
    print("Terraform plan has no resource changes.")
PY
}

latest_instance_refresh() {
  aws autoscaling describe-instance-refreshes \
    --profile "$AWS_PROFILE" \
    --auto-scaling-group-name "$ASG_NAME" \
    --region "$AWS_REGION" \
    --max-records 1 \
    --query 'InstanceRefreshes[0].[InstanceRefreshId,Status,PercentageComplete]' \
    --output text 2>/dev/null || true
}

wait_for_instance_refresh() {
  local before_id="$1"
  local deadline=$((SECONDS + INSTANCE_REFRESH_TIMEOUT_SECONDS))
  local line refresh_id status percent

  echo "Waiting for ASG instance refresh on $ASG_NAME"
  while (( SECONDS < deadline )); do
    line="$(latest_instance_refresh)"
    read -r refresh_id status percent <<<"$line"
    refresh_id="${refresh_id:-None}"
    status="${status:-None}"
    percent="${percent:-0}"

    if [[ "$refresh_id" == "None" || "$refresh_id" == "$before_id" ]]; then
      sleep "$POLL_INTERVAL_SECONDS"
      continue
    fi

    echo "Instance refresh $refresh_id: $status ${percent}%"
    case "$status" in
      Successful)
        return 0
        ;;
      Failed | Cancelled | RollbackFailed | RollbackSuccessful)
        echo "Error: instance refresh $refresh_id ended with status $status" >&2
        return 1
        ;;
    esac

    sleep "$POLL_INTERVAL_SECONDS"
  done

  echo "Error: timed out waiting for ASG instance refresh" >&2
  return 1
}

wait_for_health() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))

  echo "Polling $HEALTH_URL"
  while (( SECONDS < deadline )); do
    if curl -fsS "$HEALTH_URL" >/dev/null; then
      echo "Backend health check passed"
      return 0
    fi
    sleep "$POLL_INTERVAL_SECONDS"
  done

  echo "Error: timed out waiting for backend health" >&2
  return 1
}

echo "Deploying $IMAGE_URI"
AWS_PROFILE="$AWS_PROFILE" \
AWS_REGION="$AWS_REGION" \
ECR_REPOSITORY="$ECR_REPOSITORY" \
IMAGE_TAG="$IMAGE_TAG" \
PUSH="$PUSH" \
PRINT_TERRAFORM_REMINDER=0 \
  "$SCRIPT_DIR/backend-build-image.sh"

update_tfvars_image

echo "Planning infra/api"
terraform_with_profile_creds init -input=false -reconfigure -backend-config='profile='
terraform_with_profile_creds plan -input=false -out="$PLAN_FILE" -no-color
terraform_with_profile_creds show -json "$PLAN_FILE" > "$PLAN_JSON"
check_plan_safety

if is_truthy "$PLAN_ONLY"; then
  echo "PLAN_ONLY=1; not applying Terraform and not waiting for instance refresh"
  exit 0
fi

mapfile -t CHANGED_ADDRESSES < "$CHANGES_FILE"
NEEDS_REFRESH=0
for address in "${CHANGED_ADDRESSES[@]}"; do
  if [[ "$address" == "aws_launch_template.api" ]]; then
    NEEDS_REFRESH=1
  fi
done

BEFORE_REFRESH_ID="None"
if (( NEEDS_REFRESH )); then
  read -r BEFORE_REFRESH_ID _ <<<"$(latest_instance_refresh)"
  BEFORE_REFRESH_ID="${BEFORE_REFRESH_ID:-None}"
fi

if ((${#CHANGED_ADDRESSES[@]})); then
  terraform_with_profile_creds apply -input=false "$PLAN_FILE"
else
  echo "No Terraform changes to apply"
fi

if (( NEEDS_REFRESH )); then
  wait_for_instance_refresh "$BEFORE_REFRESH_ID"
else
  echo "No launch-template change detected; skipping instance refresh wait"
fi

wait_for_health
