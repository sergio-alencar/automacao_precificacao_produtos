# data_pipeline\src\etl\transform.py

import io
import logging
import pandas as pd
from data_pipeline.src.config import TransformConfig

logger = logging.getLogger(__name__)


def _parse_single_csv(csv_content: bytes) -> pd.DataFrame:
    df = pd.read_csv(
        io.BytesIO(csv_content),
        sep=TransformConfig.CSV_DELIMITER,
        skiprows=TransformConfig.CSV_SKIPROWS,
        encoding=TransformConfig.CSV_ENCODING,
        engine="python",
    )

    df.columns = df.columns.str.replace(
        TransformConfig.COL_CLEANUP_CHAR, ""
    ).str.strip()

    missing_cols = [
        col for col in TransformConfig.TARGET_COLUMNS if col not in df.columns
    ]
    if missing_cols:
        raise ValueError(f"Expected columns not found: {missing_cols}")

    subset = df[TransformConfig.TARGET_COLUMNS].copy()

    subset[TransformConfig.COL_VERBETE_CREDORAS] = pd.to_numeric(
        subset[TransformConfig.COL_VERBETE_CREDORAS], errors="coerce"
    ).fillna(TransformConfig.FILL_NA_VALUE)

    return subset


def _aggregate_monthly_branches(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.groupby(
            [
                TransformConfig.COL_UF,
                TransformConfig.COL_MUNICIPIO,
                TransformConfig.COL_DATA_BASE,
            ]
        )[TransformConfig.COL_VERBETE_CREDORAS]
        .sum()
        .reset_index()
    )


def _calculate_historical_metrics(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.groupby([TransformConfig.COL_UF, TransformConfig.COL_MUNICIPIO])
        .agg(
            {
                TransformConfig.COL_VERBETE_CREDORAS: "mean",
                TransformConfig.COL_DATA_BASE: ["min", "max", "count"],
            }
        )
        .reset_index()
    )


def _format_final_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [
        TransformConfig.COL_UF,
        TransformConfig.COL_MUNICIPIO,
        f"{TransformConfig.COL_VERBETE_CREDORAS}_AVG",
        TransformConfig.COL_DATA_START,
        TransformConfig.COL_DATA_END,
        TransformConfig.COL_MONTHS_COUNT,
    ]
    return df


def process_estban_series(csv_contents: list[bytes]) -> pd.DataFrame:
    if not csv_contents:
        raise ValueError("No CSV content provided for transformation.")

    logger.info(
        f"Starting transformation for {len(csv_contents)} months of data..."
    )

    monthly_dfs = [_parse_single_csv(content) for content in csv_contents]
    master_df = pd.concat(monthly_dfs, ignore_index=True)

    monthly_totals = _aggregate_monthly_branches(master_df)
    historical_metrics = _calculate_historical_metrics(monthly_totals)
    final_df = _format_final_columns(historical_metrics)

    logger.info("Transformation complete. Average calculated per municipality.")
    return final_df
