# data_pipeline\src\etl\load.py

import logging
import pandas as pd
import gspread
from gspread.exceptions import WorksheetNotFound

from data_pipeline.src.config import AppConfig, LoadConfig

logger = logging.getLogger(__name__)


def _get_authenticated_client() -> gspread.Client:
    if not AppConfig.CREDENTIALS_FILE.exists():
        error_msg = (
            f"Credentials file not found at {AppConfig.CREDENTIALS_FILE}."
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)

    logger.info("Authenticating with Google Sheets API...")
    return gspread.service_account(filename=str(AppConfig.CREDENTIALS_FILE))


def _get_or_create_worksheet(
    google_sheet: gspread.Spreadsheet,
    sheet_name: str,
    required_rows: int,
    required_cols: int,
) -> gspread.Worksheet:
    try:
        worksheet = google_sheet.worksheet(sheet_name)
        logger.info(f'Worksheet "{sheet_name}" found. Clearing old data...')
        worksheet.clear()
        return worksheet
    except WorksheetNotFound:
        logger.info(
            f'Worksheet "{sheet_name}" not found. Creating it dynamically...'
        )
        return google_sheet.add_worksheet(
            title=sheet_name,
            rows=required_rows,
            cols=required_cols,
        )


def _prepare_data_for_upload(df: pd.DataFrame) -> list[list]:
    return [df.columns.values.tolist()] + df.values.tolist()


def load_data_to_sheets(df: pd.DataFrame) -> None:
    if not LoadConfig.SPREADSHEET_ID or not LoadConfig.SHEET_NAME_DESTINATION:
        raise ValueError(
            "Missing SPREADSHEET_ID or SHEET_NAME_DESTINATION in environment variables."
        )

    try:
        gspread_client = _get_authenticated_client()

        logger.info(f"Opening spreadsheet ID: {LoadConfig.SPREADSHEET_ID}")
        google_sheet = gspread_client.open_by_key(LoadConfig.SPREADSHEET_ID)

        total_rows, total_cols = df.shape

        worksheet = _get_or_create_worksheet(
            google_sheet=google_sheet,
            sheet_name=LoadConfig.SHEET_NAME_DESTINATION,
            required_rows=total_rows + 1,
            required_cols=total_cols,
        )

        logger.info("Uploading processed data to Google Sheets...")
        data_to_upload = _prepare_data_for_upload(df)

        worksheet.update(values=data_to_upload)

        logger.info("Upload to Google Sheets complete.")

    except Exception as e:
        logger.error(f"Failed to upload data to Google Sheets: {e}")
        raise
