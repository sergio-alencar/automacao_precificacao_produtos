# data_pipeline\tests\test_transform.py

import pytest
import pandas as pd
from transform import process_estban_data


def test_process_estban_data_success():
    mock_csv_bytes = b"""Lixo1
Lixo2
#DATA_BASE;UF;CODMUN;MUNICIPIO;CNPJ;NOME_INSTITUICAO;AGENCIA;VERBETE_711_CONTAS_CREDORAS
202509;MG;123;BELO HORIZONTE;000;BANCO A;001;150.50
202509;MG;123;BELO HORIZONTE;000;BANCO B;002;50.00
202509;SP;456;SAO PAULO;000;BANCO C;003;500.00
"""

    df_result = process_estban_data(mock_csv_bytes)

    assert len(df_result) == 2

    bh_row = df_result[
        (df_result["UF"] == "MG") & (df_result["MUNICIPIO"] == "BELO HORIZONTE")
    ]
    assert bh_row.iloc[0]["VERBETE_711_CONTAS_CREDORAS"] == 200.50


def test_process_estban_data_missing_columns():
    mock_csv_invalid = (
        b"""Lixo1\nLixo2\n#DATA_BASE;UF;COLUNA_ERRADA\n202509;MG;123"""
    )

    with pytest.raises(ValueError, match="Expected columns not found"):
        process_estban_data(mock_csv_invalid)
