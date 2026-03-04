# data_pipeline\transform.py

import io
import logging
import pandas as pd
from config import (
    CSV_DELIMITER,
    CSV_SKIPROWS,
    CSV_ENCODING,
    TARGET_COLUMNS,
    COL_VERBETE_CREDORAS,
    COL_UF,
    COL_MUNICIPIO,
)

logger = logging.getLogger(__name__)


def process_estban_data(csv_content: bytes) -> pd.DataFrame:
    df = pd.read_csv(
        io.BytesIO(csv_content),
        sep=CSV_DELIMITER,
        skiprows=CSV_SKIPROWS,
        encoding=CSV_ENCODING,
        engine="python",
    )
    df.columns = df.columns.str.strip()

    missing_cols = [col for col in TARGET_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Expected columns not found: {missing_cols}")

    filtered_df = df[TARGET_COLUMNS].copy()
    filtered_df[COL_VERBETE_CREDORAS] = pd.to_numeric(
        filtered_df[COL_VERBETE_CREDORAS],
        errors="coerce",
    ).fillna(0)

    grouped_df = (
        filtered_df.groupby([COL_UF, COL_MUNICIPIO])[COL_VERBETE_CREDORAS]
        .sum()
        .reset_index()
    )

    return grouped_df
