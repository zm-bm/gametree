PYTHON ?= python3
VENV ?= .venv
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest
COMPOSE := docker compose -f ../compose.yml
BUILD ?=
BUILD_FLAG := $(if $(filter 1 true yes,$(BUILD)),--build,)
URL ?= http://localhost:8080/api

.PHONY: help venv install test build run-dev down ingest

help:
	@echo "Targets:"
	@echo "  make install                       Create venv and install dev deps"
	@echo "  make test                          Run backend tests"
	@echo "  make build                         Build the root Compose backend service"
	@echo "  make run-dev                       Run the backend service from root Compose"
	@echo "  make down                          Stop the root Compose stack"
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
	$(COMPOSE) build backend

run-dev:
	$(COMPOSE) up $(BUILD_FLAG) backend

down:
	$(COMPOSE) down

ingest:
	$(VENV)/bin/python scripts/ingest_pgn.py $(PGN) --source $(SOURCE) --url $(URL)
