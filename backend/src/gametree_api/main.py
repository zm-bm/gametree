import atexit

from fastapi import APIRouter, FastAPI, HTTPException, Query

from .db import close_all_databases, monitor_store
from .service import (
    GameIngestPayload,
    QueryPayload,
    accumulate_game,
    accumulate_games,
    monitor_snapshot,
    query_aggregate,
    query_dual_aggregate,
)

atexit.register(close_all_databases)
app = FastAPI(title="gametree-api", version="0.1.0")
api = APIRouter()


@api.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@api.post("/games")
def create_game_aggregate(game: GameIngestPayload) -> dict[str, int | str]:
    plies_indexed, positions_written = accumulate_game(game)
    return {
        "status": "ok",
        "plies_indexed": plies_indexed,
        "positions_written": positions_written,
    }


@api.post("/games/batch")
def create_game_aggregates(games: list[GameIngestPayload]) -> dict[str, int | str]:
    total_plies, total_positions = accumulate_games(games)
    return {
        "status": "ok",
        "games": len(games),
        "plies_indexed": total_plies,
        "positions_written": total_positions,
    }


@api.post("/otb")
def query_otb(payload: QueryPayload) -> dict:
    return query_aggregate("otb", payload.play)


@api.post("/online")
def query_online(payload: QueryPayload) -> dict:
    return query_aggregate("online", payload.play)


@api.post("/lichess")
def query_lichess(payload: QueryPayload) -> dict:
    return query_aggregate("lichess", payload.play)


@api.post("/totals")
def query_totals(payload: QueryPayload) -> dict:
    return query_dual_aggregate(payload.play)


def _parse_play_query(play: list[str]) -> list[str]:
    parsed: list[str] = []
    for value in play:
        parsed.extend(move.strip() for move in value.split(",") if move.strip())
    return parsed


@api.get("/totals")
def query_totals_get(play: list[str] = Query(default_factory=list)) -> dict:
    return query_dual_aggregate(_parse_play_query(play))


@api.get("/monitor")
def monitor() -> dict:
    return monitor_snapshot()


@api.get("/monitor/cf/{cf}/stats")
def monitor_cf_stats(cf: str) -> dict[str, str]:
    try:
        store = monitor_store(cf)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown column family: {cf}") from exc

    value = store.property_value("rocksdb.stats")
    if value is None:
        raise HTTPException(status_code=404, detail="rocksdb.stats unavailable")
    return {"cf": cf, "property": "rocksdb.stats", "value": value}


@api.get("/monitor/cf/{cf}/{prop}")
def monitor_cf_property(cf: str, prop: str):
    try:
        store = monitor_store(cf)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown column family: {cf}") from exc

    int_value = store.property_int_value(prop)
    if int_value is not None:
        return int_value

    value = store.property_value(prop)
    if value is not None:
        return value

    raise HTTPException(status_code=404, detail=f"Unknown property: {prop}")


app.include_router(api, prefix="/api")
