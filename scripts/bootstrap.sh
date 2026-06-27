#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
VENV_DIR="${GAMETREE_VENV_DIR:-$REPO_ROOT/.venv}"
HOST_PYTHON_BIN="${GAMETREE_BOOTSTRAP_PYTHON:-python3}"
VENV_PYTHON_BIN="$VENV_DIR/bin/python"

if ! command -v "$HOST_PYTHON_BIN" >/dev/null 2>&1; then
  echo "Error: required command not found: $HOST_PYTHON_BIN" >&2
  exit 1
fi

if [[ ! -x "$VENV_PYTHON_BIN" ]]; then
  echo "Creating Python virtual environment: $VENV_DIR"
  "$HOST_PYTHON_BIN" -m venv "$VENV_DIR"
fi

echo "Installing backend dev package"
"$VENV_PYTHON_BIN" -m pip install --upgrade pip "setuptools>=68" wheel
"$VENV_PYTHON_BIN" -m pip install -e "$BACKEND_DIR[dev]"

echo "Bootstrap complete: $VENV_DIR"
