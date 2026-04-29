from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
RANKING_PATH = REPO_ROOT / "src" / "data" / "ranking-v1.json"


def load_dataset(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def summarize(dataset: dict) -> dict:
    raw = dataset["raw_universe"]
    rows = dataset["rows"]
    excluded = dataset["excluded"]

    exchange_counts = Counter(item.get("exchange", "UNKNOWN") for item in raw)
    excluded_reason_counts = Counter()
    for item in excluded:
        for reason in item.get("reasons", []):
            excluded_reason_counts[reason] += 1

    ranks = [int(item["rank"]) for item in rows]
    expected = list(range(1, len(rows) + 1))
    rank_ok = sorted(ranks) == expected and len(set(ranks)) == len(ranks)

    return {
        "raw_count": len(raw),
        "ranked_count": len(rows),
        "excluded_count": len(excluded),
        "exchange_counts": dict(sorted(exchange_counts.items())),
        "excluded_reason_counts": dict(sorted(excluded_reason_counts.items(), key=lambda x: (-x[1], x[0]))),
        "rank_sequence_ok": rank_ok,
    }


def main() -> None:
    dataset = load_dataset(RANKING_PATH)
    report = summarize(dataset)

    print("Universe audit")
    print(f"- Raw universe: {report['raw_count']}")
    print(f"- Ranked: {report['ranked_count']}")
    print(f"- Excluded: {report['excluded_count']}")
    print(f"- Rank sequence contiguous/unique: {'OK' if report['rank_sequence_ok'] else 'FAIL'}")

    print("\nBy exchange")
    for exchange, count in report["exchange_counts"].items():
        print(f"- {exchange}: {count}")

    print("\nTop exclusion reasons")
    for reason, count in report["excluded_reason_counts"].items():
        print(f"- {count}x {reason}")

    if not report["rank_sequence_ok"]:
        raise SystemExit("Ranking sequence is invalid")


if __name__ == "__main__":
    main()
