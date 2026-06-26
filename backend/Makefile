PYTHON ?= python3
VENV ?= .venv
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest
COMPOSE := docker compose -f docker/docker-compose.yml
BUILD ?=
BUILD_FLAG := $(if $(filter 1 true yes,$(BUILD)),--build,)
URL ?= http://localhost:8080/api

.PHONY: help venv install test build run-dev run-prod down ingest

help:
	@echo "Targets:"
	@echo "  make install                       Create venv and install dev deps"
	@echo "  make test                          Run backend tests"
	@echo "  make build                         Build Docker images (dev + prod profiles)"
	@echo "  make run-dev                       Run dev profile"
	@echo "  make run-prod                      Run prod profile (detached)"
	@echo "  make down                          Stop dev + prod profile containers"
	@echo "  make ingest PGN=... SOURCE=...     Ingest PGN into API"
	@echo ""
	@echo "Optional: add BUILD=1 to run commands to force --build"

venv:
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip

install: venv
	$(PIP) install -e ".[dev]"

test:
	$(PYTEST) -q

build:
	$(COMPOSE) --profile dev --profile prod build

run-dev:
	$(COMPOSE) --profile dev up $(BUILD_FLAG)

run-prod:
	$(COMPOSE) --profile prod up -d $(BUILD_FLAG)

down:
	$(COMPOSE) --profile dev --profile prod down

ingest:
	$(VENV)/bin/python scripts/ingest_pgn.py $(PGN) --source $(SOURCE) --url $(URL)
