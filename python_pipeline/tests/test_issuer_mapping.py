from python_pipeline.scripts.refresh_issuer_mapping import exact_legal_match, issuer_name_candidate


def record(name="KONE OYJ", country="FI", status="ACTIVE", lei="2138001CNF45JP5XZK38"):
    return {"id": lei, "attributes": {
        "entity": {"legalName": {"name": name}, "status": status,
                   "legalAddress": {"country": country}, "registeredAs": "1927400-1"},
        "registration": {"status": "ISSUED"},
    }}


def test_exact_legal_name_match_ignores_only_case_and_whitespace():
    assert exact_legal_match({"data": [record()]}, "KONE Oyj")["lei"] == "2138001CNF45JP5XZK38"
    assert exact_legal_match({"data": [record()]}, "Kone Corporation") is None


def test_multiple_or_incomplete_results_never_assert_unique_issuer():
    assert exact_legal_match({"data": [record(), record(lei="other")]}, "KONE OYJ") is None
    assert exact_legal_match({"data": [record()], "meta": {"pagination": {"total": 2}}}, "KONE OYJ") is None


def test_foreign_or_inactive_legal_entity_is_not_matched_by_finnish_name_fallback():
    assert exact_legal_match({"data": [record(country="SE")]}, "KONE OYJ") is None
    assert exact_legal_match({"data": [record(status="INACTIVE")]}, "KONE OYJ") is None


def test_share_class_label_changes_only_search_candidate():
    assert issuer_name_candidate("Company Oyj A") == "Company Oyj"
    assert issuer_name_candidate("Company AB") == "Company AB"
