import importlib
import os
from pathlib import Path

from gametree_api.db import close_all_databases
from gametree_api.pgn import iter_pgn_payloads
from gametree_api.service import (
    GameIngestPayload,
    accumulate_game,
    accumulate_games,
    monitor_snapshot,
    query_aggregate,
    query_dual_aggregate,
)


def _reload_modules():
    import gametree_api.db as db_module
    import gametree_api.service as service_module

    importlib.reload(db_module)
    importlib.reload(service_module)


def _configure_tmp_db(tmp_path):
    db_dir = tmp_path / "test.rocksdb"
    os.environ["DATABASE_URL"] = f"rocksdb:///{db_dir}"
    close_all_databases()
    _reload_modules()
    return db_dir


def _split_source_by_index(idx: int, _game) -> str:
    return "otb" if idx < 3 else "online"


def _games_from_fixture(pgn_path: Path) -> list[GameIngestPayload]:
    return [
        GameIngestPayload(**payload)
        for payload in iter_pgn_payloads(
            pgn_path,
            source_resolver=_split_source_by_index,
            max_plies=60,
        )
    ]


def test_ingest_from_pgn_and_query_positions(tmp_path):
    _configure_tmp_db(tmp_path)

    data_pgn = Path(__file__).resolve().parent / "fixtures" / "test_data.pgn"
    games = _games_from_fixture(data_pgn)
    total_plies, _ = accumulate_games(games)
    assert total_plies > 0

    root = query_aggregate("all", [])
    by_uci = {row["uci"]: row for row in root["moves"]}
    assert root["total"] == 5
    assert by_uci["c2c4"]["total"] == 4
    assert by_uci["g1f3"]["total"] == 1

    after_c4 = query_aggregate("all", ["c2c4"])
    by_uci = {row["uci"]: row for row in after_c4["moves"]}
    assert after_c4["total"] == 4
    assert by_uci["c7c5"]["total"] == 2
    assert by_uci["e7e5"]["total"] == 1
    assert by_uci["g7g6"]["total"] == 1

    online_only = query_aggregate("online", ["c2c4"])
    by_uci = {row["uci"]: row for row in online_only["moves"]}
    assert online_only["total"] == 2
    assert set(by_uci) == {"c7c5"}
    assert by_uci["c7c5"]["draws"] == 1
    assert by_uci["c7c5"]["black"] == 1


def test_source_separation_and_all_merge(tmp_path):
    _configure_tmp_db(tmp_path)

    games = [
        GameIngestPayload(source="otb", moves=["e2e4", "e7e5"], winner="white", max_plies=8),
        GameIngestPayload(source="online", moves=["e2e4", "c7c5"], winner="black", max_plies=8),
        GameIngestPayload(source="lichess", moves=["d2d4", "d7d5"], winner="draw", max_plies=8),
    ]
    accumulate_games(games)

    assert query_aggregate("otb", [])["total"] == 1
    assert query_aggregate("online", [])["total"] == 1
    assert query_aggregate("lichess", [])["total"] == 1

    all_root = query_aggregate("all", [])
    by_uci = {row["uci"]: row for row in all_root["moves"]}
    assert all_root["total"] == 3
    assert by_uci["e2e4"]["total"] == 2
    assert by_uci["d2d4"]["total"] == 1


def test_dual_aggregate_shape_for_frontend(tmp_path):
    _configure_tmp_db(tmp_path)

    games = [
        GameIngestPayload(source="otb", moves=["e2e4", "e7e5"], winner="white", max_plies=8),
        GameIngestPayload(source="online", moves=["e2e4", "c7c5"], winner="black", max_plies=8),
    ]
    accumulate_games(games)

    payload = query_dual_aggregate(["e2e4"])
    assert set(payload.keys()) == {"play", "otb", "online", "moves"}

    assert payload["play"] == ["e2e4"]
    assert payload["otb"]["total"] == 1
    assert payload["online"]["total"] == 1

    by_uci = {row["uci"]: row for row in payload["moves"]}
    assert set(by_uci) == {"e7e5", "c7c5"}

    assert by_uci["e7e5"]["otb"]["total"] == 1
    assert by_uci["e7e5"]["online"]["total"] == 0

    assert by_uci["c7c5"]["otb"]["total"] == 0
    assert by_uci["c7c5"]["online"]["total"] == 1


def test_max_plies_and_illegal_move_truncation(tmp_path):
    _configure_tmp_db(tmp_path)

    plies, positions = accumulate_game(
        GameIngestPayload(
            source="otb",
            moves=["e2e4", "e2e5", "g1f3"],
            winner="white",
            max_plies=10,
        )
    )
    assert plies == 1
    assert positions == 1
    assert query_aggregate("otb", [])["total"] == 1
    assert query_aggregate("otb", ["e2e4"])["total"] == 0

    plies, positions = accumulate_game(
        GameIngestPayload(
            source="online",
            moves=["d2d4", "d7d5", "c2c4", "e7e6"],
            winner="draw",
            max_plies=2,
        )
    )
    assert plies == 2
    assert positions == 2
    assert query_aggregate("online", [])["total"] == 1
    assert query_aggregate("online", ["d2d4"])["total"] == 1
    assert query_aggregate("online", ["d2d4", "d7d5"])["total"] == 0


def test_query_ordering(tmp_path):
    _configure_tmp_db(tmp_path)

    games = [
        GameIngestPayload(source="otb", moves=["e2e4"], winner="white", max_plies=2),
        GameIngestPayload(source="otb", moves=["e2e4"], winner="black", max_plies=2),
        GameIngestPayload(source="online", moves=["d2d4"], winner="draw", max_plies=2),
        GameIngestPayload(source="lichess", moves=["c2c4"], winner="white", max_plies=2),
        GameIngestPayload(source="lichess", moves=["c2c4"], winner="white", max_plies=2),
    ]
    accumulate_games(games)

    root = query_aggregate("all", [])
    assert len(root["moves"]) == 3
    top = {row["uci"]: row["total"] for row in root["moves"]}
    assert set(top) == {"c2c4", "e2e4", "d2d4"}
    assert top["c2c4"] == 2
    assert top["e2e4"] == 2


def test_monitor_snapshot_basic_fields(tmp_path):
    _configure_tmp_db(tmp_path)
    accumulate_game(GameIngestPayload(source="online", moves=["g1f3", "d7d5"], winner="draw", max_plies=8))

    monitor = monitor_snapshot()
    assert "db_path" in monitor
    assert "db_metrics" in monitor
    assert "column_families" in monitor
    assert set(monitor["column_families"]) == {"otb", "online", "lichess"}
    assert monitor["column_families"]["online"]["estimate_num_keys"] >= 1
