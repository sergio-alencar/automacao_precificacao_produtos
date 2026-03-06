# data_pipeline\tests\test_transform.py

import pytest
from data_pipeline.src.etl.transform import process_estban_series
from data_pipeline.src.config import TransformConfig


@pytest.fixture
def valid_csv_contents() -> list[bytes]:
    month_1 = b"""Lixo1
Lixo2
#DATA_BASE;UF;MUNICIPIO;VERBETE_711_CONTAS_CREDORAS
202509;MG;BELO HORIZONTE;150.00
202509;MG;BELO HORIZONTE;50.00
202509;SP;SAO PAULO;1000.00
"""

    month_2 = b"""Lixo1
Lixo2
#DATA_BASE;UF;MUNICIPIO;VERBETE_711_CONTAS_CREDORAS
202508;MG;BELO HORIZONTE;400.00
202508;SP;SAO PAULO;2000.00
"""
    return [month_1, month_2]


def test_process_estban_data_success(valid_csv_contents: list[bytes]):
    df_result = process_estban_series(valid_csv_contents)

    assert len(df_result) == 2

    bh_row = df_result[
        df_result[TransformConfig.COL_MUNICIPIO] == "BELO HORIZONTE"
    ].iloc[0]

    avg_col_name = f"{TransformConfig.COL_VERBETE_CREDORAS}_AVG"

    assert bh_row[avg_col_name] == 300.0

    assert bh_row[TransformConfig.COL_MONTHS_COUNT] == 2
    assert bh_row[TransformConfig.COL_DATA_START] == 202508
    assert bh_row[TransformConfig.COL_DATA_END] == 202509


def test_process_estban_series_missing_columns():
    invalid_month = b"""Lixo1
Lixo2
DATA_BASE;UF;COLUNA_INVENTADA
202509;MG;123
"""

    with pytest.raises(ValueError, match="Expected columns not found"):
        process_estban_series([invalid_month])


def test_process_estban_series_empty_list():
    with pytest.raises(ValueError, match="No CSV content provided"):
        process_estban_series([])
