from python_pipeline.magicformula.financials import compute_enterprise_value, latest_numeric_value


class FakeSeries:
    def __init__(self, values):
        self._values = values

    def dropna(self):
        return FakeSeries([value for value in self._values if value is not None])

    @property
    def empty(self):
        return len(self._values) == 0

    def tolist(self):
        return list(self._values)


def test_latest_numeric_value_uses_first_non_null_value() -> None:
    assert latest_numeric_value(FakeSeries([None, 12.5, 8.0])) == 12.5


def test_compute_enterprise_value_prefers_reported_value() -> None:
    assert compute_enterprise_value(150.0, 100.0, 20.0, [5.0]) == 150.0


def test_compute_enterprise_value_falls_back_to_market_cap_plus_net_debt() -> None:
    assert compute_enterprise_value(None, 100.0, 20.0, [5.0, None]) == 115.0


def test_compute_enterprise_value_requires_positive_market_cap() -> None:
    assert compute_enterprise_value(None, 0.0, 20.0, [5.0]) is None