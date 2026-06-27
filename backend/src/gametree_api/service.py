import struct
from threading import Lock
from typing import Literal

import chess
import chess.polyglot
from fastapi import HTTPException
from pydantic import BaseModel, Field
from rocksdict import Rdict

from .constants import KNOWN_SOURCES, ROW_SIZE
from .db import all_source_stores, db, db_path, new_write_batch, source_cf_handle, source_store, write_batch

_INGEST_LOCK = Lock()


class GameIngestPayload(BaseModel):
    source: Literal["otb", "online", "lichess"]
    moves: list[str]
    winner: Literal["white", "black", "draw"]
    max_plies: int = Field(default=24, ge=1, le=200)


class QueryPayload(BaseModel):
    play: list[str] = Field(default_factory=list)


def _position_hash(board: chess.Board) -> int:
    return chess.polyglot.zobrist_hash(board)


def _aggregate_key(position_hash: int) -> bytes:
    return b"a" + position_hash.to_bytes(8, "big")


def _pack_move(move: chess.Move) -> int:
    promotion_code = {
        None: 0,
        chess.KNIGHT: 1,
        chess.BISHOP: 2,
        chess.ROOK: 3,
        chess.QUEEN: 4,
    }[move.promotion]
    return move.from_square | (move.to_square << 6) | (promotion_code << 12)


def _unpack_move(encoded: int) -> str:
    from_sq = encoded & 63
    to_sq = (encoded >> 6) & 63
    promo = (encoded >> 12) & 7
    promo_char = {0: "", 1: "n", 2: "b", 3: "r", 4: "q"}.get(promo, "")
    return f"{chess.square_name(from_sq)}{chess.square_name(to_sq)}{promo_char}"


def _decode_counts(buf: bytes | None) -> dict[int, list[int]]:
    if not buf:
        return {}

    out: dict[int, list[int]] = {}
    i = 0
    while i + ROW_SIZE <= len(buf):
        packed_move, white, draws, black = struct.unpack_from("<HIII", buf, i)
        out[packed_move] = [white, draws, black]
        i += ROW_SIZE
    return out


def _encode_counts(counts: dict[int, list[int]]) -> bytes:
    buf = bytearray(ROW_SIZE * len(counts))
    i = 0
    for packed_move, (white, draws, black) in sorted(counts.items()):
        struct.pack_into("<HIII", buf, i, packed_move, white, draws, black)
        i += ROW_SIZE
    return bytes(buf)


def _outcome_delta(winner: str) -> tuple[int, int, int]:
    if winner == "white":
        return 1, 0, 0
    if winner == "black":
        return 0, 0, 1
    return 0, 1, 0


def accumulate_game(game: GameIngestPayload) -> tuple[int, int]:
    with _INGEST_LOCK:
        source_totals: dict[str, dict[bytes, dict[int, list[int]]]] = {source: {} for source in KNOWN_SOURCES}
        plies, positions = _accumulate_game_into_pending(source_totals[game.source], source_store(game.source), game)
        _flush_pending(source_totals)
        return plies, positions


def accumulate_games(games: list[GameIngestPayload]) -> tuple[int, int]:
    with _INGEST_LOCK:
        total_plies = 0
        total_positions = 0
        source_totals: dict[str, dict[bytes, dict[int, list[int]]]] = {source: {} for source in KNOWN_SOURCES}
        for game in games:
            plies, positions = _accumulate_game_into_pending(source_totals[game.source], source_store(game.source), game)
            total_plies += plies
            total_positions += positions
        _flush_pending(source_totals)
        return total_plies, total_positions


def _accumulate_game_into_pending(
    pending: dict[bytes, dict[int, list[int]]], store: Rdict, game: GameIngestPayload
) -> tuple[int, int]:
    board = chess.Board()
    delta = _outcome_delta(game.winner)
    applied = 0

    # If a game revisits a position, keep the latest move from that game.
    seen: dict[int, int] = {}

    for uci in game.moves[: game.max_plies]:
        try:
            move = chess.Move.from_uci(uci)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid UCI move: {uci}") from exc

        if move not in board.legal_moves:
            break

        seen[_position_hash(board)] = _pack_move(move)
        board.push(move)
        applied += 1

    for pos_hash, packed_move in seen.items():
        key = _aggregate_key(pos_hash)
        agg = pending.get(key)
        if agg is None:
            agg = _decode_counts(store.get(key))
            pending[key] = agg
        row = agg.get(packed_move, [0, 0, 0])
        row[0] += delta[0]
        row[1] += delta[1]
        row[2] += delta[2]
        agg[packed_move] = row

    return applied, len(seen)


def _flush_pending(source_totals: dict[str, dict[bytes, dict[int, list[int]]]]) -> None:
    batch = new_write_batch()
    for source, pending in source_totals.items():
        if not pending:
            continue
        cf_handle = source_cf_handle(source)
        for key, agg in pending.items():
            batch.put(key, _encode_counts(agg), cf_handle)
    if not batch.is_empty():
        write_batch(batch)


def query_aggregate(source: Literal["otb", "online", "lichess", "all"], play: list[str]) -> dict:
    board = chess.Board()
    for uci in play:
        try:
            move = chess.Move.from_uci(uci)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid UCI move: {uci}") from exc
        if move not in board.legal_moves:
            raise HTTPException(status_code=400, detail=f"Illegal move in play: {uci}")
        board.push(move)

    key = _aggregate_key(_position_hash(board))
    source_names = KNOWN_SOURCES if source == "all" else (source,)

    merged: dict[int, list[int]] = {}
    stores = all_source_stores()
    for one_source in source_names:
        agg = _decode_counts(stores[one_source].get(key))
        for packed_move, counts in agg.items():
            row = merged.setdefault(packed_move, [0, 0, 0])
            row[0] += int(counts[0])
            row[1] += int(counts[1])
            row[2] += int(counts[2])

    rows = sorted(
        ((packed_move, counts[0], counts[1], counts[2]) for packed_move, counts in merged.items()),
        key=lambda row: (row[1] + row[2] + row[3]),
        reverse=True,
    )

    total_white = sum(counts[0] for counts in merged.values())
    total_draws = sum(counts[1] for counts in merged.values())
    total_black = sum(counts[2] for counts in merged.values())

    return {
        "source": source,
        "play": play,
        "white": total_white,
        "draws": total_draws,
        "black": total_black,
        "total": total_white + total_draws + total_black,
        "moves": [
            {
                "uci": _unpack_move(packed_move),
                "white": white,
                "draws": draws,
                "black": black,
                "total": white + draws + black,
            }
            for packed_move, white, draws, black in rows
        ],
    }


def _totals_from_row(row: dict | None) -> dict[str, int]:
    if not row:
        return {
            "white": 0,
            "draws": 0,
            "black": 0,
            "total": 0,
        }

    white = int(row.get("white", 0))
    draws = int(row.get("draws", 0))
    black = int(row.get("black", 0))

    return {
        "white": white,
        "draws": draws,
        "black": black,
        "total": int(row.get("total", white + draws + black)),
    }


def _totals_from_aggregate(aggregate: dict) -> dict[str, int]:
    return {
        "white": int(aggregate["white"]),
        "draws": int(aggregate["draws"]),
        "black": int(aggregate["black"]),
        "total": int(aggregate["total"]),
    }


def query_dual_aggregate(play: list[str]) -> dict:
    otb = query_aggregate("otb", play)
    online = query_aggregate("online", play)

    otb_by_uci = {row["uci"]: row for row in otb["moves"]}
    online_by_uci = {row["uci"]: row for row in online["moves"]}

    moves = []
    for uci in sorted(set(otb_by_uci) | set(online_by_uci)):
        otb_totals = _totals_from_row(otb_by_uci.get(uci))
        online_totals = _totals_from_row(online_by_uci.get(uci))
        moves.append(
            {
                "uci": uci,
                "otb": otb_totals,
                "online": online_totals,
                "total": otb_totals["total"] + online_totals["total"],
            }
        )

    moves.sort(key=lambda row: (-int(row["total"]), row["uci"]))

    return {
        "play": play,
        "otb": _totals_from_aggregate(otb),
        "online": _totals_from_aggregate(online),
        "moves": moves,
    }


def _cf_metric_snapshot(store: Rdict) -> dict[str, int]:
    props = {
        "estimate_num_keys": "rocksdb.estimate-num-keys",
        "live_sst_files_size": "rocksdb.live-sst-files-size",
        "total_sst_files_size": "rocksdb.total-sst-files-size",
        "cur_size_active_mem_table": "rocksdb.cur-size-active-mem-table",
        "cur_size_all_mem_tables": "rocksdb.cur-size-all-mem-tables",
        "num_running_compactions": "rocksdb.num-running-compactions",
        "num_running_flushes": "rocksdb.num-running-flushes",
    }
    out = {}
    for name, prop in props.items():
        value = store.property_int_value(prop)
        out[name] = int(value) if value is not None else 0
    return out


def monitor_snapshot() -> dict:
    return {
        "db_path": db_path(),
        "db_metrics": _cf_metric_snapshot(db()),
        "column_families": {name: _cf_metric_snapshot(store) for name, store in all_source_stores().items()},
    }
