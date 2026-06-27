import importlib
import os

from fastapi.testclient import TestClient
from gametree_api.db import close_all_databases


def _configure_tmp_app(tmp_path):
    db_dir = tmp_path / "test.rocksdb"
    os.environ["DATABASE_URL"] = f"rocksdb:///{db_dir}"
    close_all_databases()

    import gametree_api.db as db_module
    import gametree_api.main as main_module
    import gametree_api.service as service_module

    importlib.reload(db_module)
    importlib.reload(service_module)
    importlib.reload(main_module)
    return service_module, main_module.app


def _seed_games(service_module) -> None:
    games = [
        service_module.GameIngestPayload(source="otb", moves=["e2e4", "e7e5"], winner="white", max_plies=8),
        service_module.GameIngestPayload(source="online", moves=["e2e4", "c7c5"], winner="black", max_plies=8),
    ]
    service_module.accumulate_games(games)


def test_get_totals_with_play_query_params(tmp_path):
    service_module, app = _configure_tmp_app(tmp_path)
    _seed_games(service_module)

    client = TestClient(app)
    response = client.get("/api/totals", params=[("play", "e2e4")])
    assert response.status_code == 200

    payload = response.json()
    assert payload["play"] == ["e2e4"]
    assert payload["otb"]["total"] == 1
    assert payload["online"]["total"] == 1
    moves = {row["uci"] for row in payload["moves"]}
    assert moves == {"e7e5", "c7c5"}


def test_get_totals_with_comma_separated_play_query(tmp_path):
    service_module, app = _configure_tmp_app(tmp_path)
    _seed_games(service_module)

    client = TestClient(app)
    response = client.get("/api/totals", params={"play": "e2e4,c7c5"})
    assert response.status_code == 200

    payload = response.json()
    assert payload["play"] == ["e2e4", "c7c5"]
    assert payload["otb"]["total"] == 0
    assert payload["online"]["total"] == 0


def test_get_totals_without_play_defaults_to_root(tmp_path):
    service_module, app = _configure_tmp_app(tmp_path)
    _seed_games(service_module)

    client = TestClient(app)
    response = client.get("/api/totals")
    assert response.status_code == 200

    payload = response.json()
    assert payload["play"] == []
    assert payload["otb"]["total"] == 1
    assert payload["online"]["total"] == 1
