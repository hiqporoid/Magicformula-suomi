from python_pipeline.scripts.audit_universe import summarize


def test_summarize_counts_and_rank_sequence() -> None:
    dataset = {
        "raw_universe": [
            {"ticker": "AAA", "exchange": "HEL"},
            {"ticker": "BBB", "exchange": "STO"},
            {"ticker": "CCC", "exchange": "HEL"},
        ],
        "rows": [
            {"ticker": "AAA", "rank": 1},
            {"ticker": "BBB", "rank": 2},
        ],
        "excluded": [
            {"ticker": "CCC", "reasons": ["missing_financial_statements"]},
        ],
    }

    report = summarize(dataset)
    assert report["raw_count"] == 3
    assert report["ranked_count"] == 2
    assert report["excluded_count"] == 1
    assert report["exchange_counts"] == {"HEL": 2, "STO": 1}
    assert report["rank_sequence_ok"] is True
