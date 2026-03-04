# data_pipeline\load.py

import logging
import pandas as pd
import gspread
from config import CREDENTIALS_FILE, SPREADSHEET_ID, SHEET_NAME_DESTINATION

logger = logging.getLogger(__name__)


def _get_or_create_worksheet(
    google_sheet: gspread.Spreadsheet,
    sheet_name: str,
) -> gspread.Worksheet:
    try:
        worksheet = google_sheet.worksheet(sheet_name)
        logger.info(f'Worksheet "{sheet_name}" found. Clearing old data...')
        worksheet.clear()
        return worksheet
    except gspread.exceptions.WorksheetNotFound:
        logger.info(f'Worksheet "{sheet_name}" not found. Creating it...')
        return google_sheet.add_worksheet(title=sheet_name, rows=100, cols=5)


def load_data_to_sheets(df: pd.DataFrame) -> None:
    logger.info("Authenticating with Google Sheets...")

    if not CREDENTIALS_FILE.exists():
        error_msg = f"Credentials file not found at {CREDENTIALS_FILE}."
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)

    if not SPREADSHEET_ID:
        raise ValueError("SPREADSHEET_ID is missing from .env file.")

    try:
        gspread_client = gspread.service_account(filename=str(CREDENTIALS_FILE))
        logger.info(f"Opening spreadsheet ID: {SPREADSHEET_ID}")

        google_sheet = gspread_client.open_by_key(SPREADSHEET_ID)
        worksheet = _get_or_create_worksheet(
            google_sheet, SHEET_NAME_DESTINATION
        )

        logger.info("Uploading processed data to Google Sheets...")
        data_to_upload = [df.columns.values.tolist()] + df.values.tolist()
        worksheet.update(data_to_upload)

        logger.info("Upload to Google Sheets complete.")

    except Exception as e:
        logger.error(f"Failed to upload data to Google Sheets: {e}")
        raise
