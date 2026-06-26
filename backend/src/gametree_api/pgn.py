from collections.abc import Callable, Iterator
from pathlib import Path
from typing import Any

import chess.pgn

SourceResolver = Callable[[int, chess.pgn.Game], str]
SkipHandler = Callable[[int, str], None]


def result_to_winner(result: str) -> str | None:
    if result == "1-0":
        return "white"
    if result == "0-1":
        return "black"
    if result == "1/2-1/2":
        return "draw"
    return None


def fixed_source_resolver(source: str) -> SourceResolver:
    return lambda _idx, _game: source


def iter_pgn_payloads(
    pgn_path: Path,
    *,
    source_resolver: SourceResolver,
    max_plies: int,
    on_skip_result: SkipHandler | None = None,
) -> Iterator[dict[str, Any]]:
    with pgn_path.open("r", encoding="utf-8", errors="ignore") as handle:
        idx = 0
        while True:
            game = chess.pgn.read_game(handle)
            if game is None:
                break

            result = game.headers.get("Result", "")
            winner = result_to_winner(result)
            if winner is None:
                if on_skip_result:
                    on_skip_result(idx, result)
                idx += 1
                continue

            moves = [move.uci() for move in game.mainline_moves()]
            yield {
                "source": source_resolver(idx, game),
                "moves": moves,
                "winner": winner,
                "max_plies": max_plies,
            }
            idx += 1
