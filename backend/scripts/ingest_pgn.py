#!/usr/bin/env python3
import argparse
import concurrent.futures
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from gametree_api.pgn import fixed_source_resolver, iter_pgn_payloads


def post_json(url: str, payload: dict | list[dict]) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url=url,
        data=body,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest PGN games into gametree-api.")
    parser.add_argument("pgn", type=Path, help="Path to PGN file")
    parser.add_argument(
        "--url",
        default="http://localhost:8080/api",
        help="Base URL of gametree-api service (default: http://localhost:8080/api)",
    )
    parser.add_argument(
        "--source",
        required=True,
        choices=["otb", "online", "lichess"],
        help="Dataset source label for these games",
    )
    parser.add_argument(
        "--max-plies",
        type=int,
        default=24,
        help="Max plies indexed per game (default: 24)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Stop after ingesting N games (0 = no limit)",
    )
    parser.add_argument(
        "--continue-on-error",
        action="store_true",
        help="Log failed games and continue instead of exiting",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Number of games per /games/batch request (default: 200)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of concurrent batch POST workers (default: 1)",
    )
    parser.add_argument(
        "--max-inflight-batches",
        type=int,
        default=0,
        help="Max number of in-flight batch requests (default: 2 * workers)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.pgn.exists():
        print(f"PGN file not found: {args.pgn}", file=sys.stderr)
        return 1

    ok = 0
    failed = 0
    skipped = 0
    indexed_plies = 0
    started = time.time()
    batch: list[dict] = []
    last_logged_ingested = -1
    skipped_counter = {"count": 0}
    max_inflight = args.max_inflight_batches if args.max_inflight_batches > 0 else max(1, args.workers * 2)
    pending: dict[concurrent.futures.Future[dict], int] = {}

    def drain_once(block: bool) -> None:
        nonlocal ok, failed, indexed_plies
        if not pending:
            return
        done, _ = concurrent.futures.wait(
            pending.keys(),
            timeout=None if block else 0,
            return_when=concurrent.futures.FIRST_COMPLETED,
        )
        for fut in done:
            batch_len = pending.pop(fut)
            try:
                result = fut.result()
                ok += batch_len
                indexed_plies += int(result.get("plies_indexed", 0))
            except (urllib.error.URLError, urllib.error.HTTPError) as exc:
                failed += batch_len
                print(f"failed batch ({batch_len} games): {exc}", file=sys.stderr)
                if not args.continue_on_error:
                    raise

    def submit_batch(executor: concurrent.futures.ThreadPoolExecutor) -> None:
        nonlocal ok, failed, indexed_plies, batch
        if not batch:
            return
        payload = batch
        batch = []
        while len(pending) >= max_inflight:
            drain_once(block=True)
        fut = executor.submit(post_json, f"{args.url.rstrip('/')}/games/batch", payload)
        pending[fut] = len(payload)

    def on_skip_result(_idx: int, result: str) -> None:
        skipped_counter["count"] += 1
        print(
            f"warning: skipping game with unsupported result '{result or '?'}'",
            file=sys.stderr,
        )

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
            try:
                for payload in iter_pgn_payloads(
                    args.pgn,
                    source_resolver=fixed_source_resolver(args.source),
                    max_plies=args.max_plies,
                    on_skip_result=on_skip_result,
                ):
                    skipped = skipped_counter["count"]
                    if args.limit and (ok + failed + skipped) >= args.limit:
                        break

                    batch.append(payload)
                    if len(batch) >= args.batch_size:
                        submit_batch(executor)

                    drain_once(block=False)
                    if ok and ok % 1000 == 0 and ok != last_logged_ingested:
                        elapsed = max(time.time() - started, 1e-9)
                        print(
                            f"ingested={ok} failed={failed} skipped={skipped} avg_plies={indexed_plies / ok:.1f} games_per_sec={ok / elapsed:.1f}",
                            flush=True,
                        )
                        last_logged_ingested = ok
            except (KeyError, ValueError) as exc:
                failed += 1
                print(f"failed game #{ok + failed}: {exc}", file=sys.stderr)
                if not args.continue_on_error:
                    return 2

            submit_batch(executor)
            while pending:
                drain_once(block=True)
    except (urllib.error.URLError, urllib.error.HTTPError):
        if not args.continue_on_error:
            return 2

    skipped = skipped_counter["count"]

    print(
        (
            f"done: ingested={ok} failed={failed} skipped={skipped} total_seen={ok + failed + skipped} avg_plies={(indexed_plies / ok):.1f}"
            if ok
            else f"done: ingested=0 failed={failed} skipped={skipped}"
        ),
        flush=True,
    )
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
