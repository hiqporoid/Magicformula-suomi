from pathlib import Path

import pytest

from python_pipeline.scripts import import_nordic_universe as mod


def test_normalize_ticker_prefers_local() -> None:
    assert mod.normalize_ticker('nokia', 'NOKIA.HE') == 'NOKIA'
    assert mod.normalize_ticker('', 'NOKIA.HE') == 'NOKIA'


def test_import_fails_if_universe_too_small(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    input_path = tmp_path / 'nordic.csv'
    input_path.write_text(
        'ticker_yf,ticker_local,company,sector,country,exchange\n'
        'NOKIA.HE,NOKIA,Nokia,Tech,Finland,HEL\n'
        'ERIC-B.ST,ERIC-B,Ericsson,Tech,Sweden,STO\n',
        encoding='utf-8',
    )
    hel_path = tmp_path / 'hel.csv'
    sto_path = tmp_path / 'sto.csv'

    monkeypatch.setattr(mod, 'INPUT_PATH', input_path)
    monkeypatch.setattr(mod, 'HEL_PATH', hel_path)
    monkeypatch.setattr(mod, 'STO_PATH', sto_path)

    with pytest.raises(SystemExit, match='Universe incomplete'):
        mod.main()
