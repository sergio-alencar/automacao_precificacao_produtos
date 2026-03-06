# data_pipeline\src\config.py

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class AppConfig:
    BASE_DIR = BASE_DIR
    CREDENTIALS_FILE = BASE_DIR / "credentials.json"
    OUTPUT_FILENAME = BASE_DIR / "current_processed_estban.csv"
    LOG_FILENAME = BASE_DIR / "latest_execution.log"


class ExtractConfig:
    BASE_ESTBAN_URL = "https://www.bcb.gov.br/content/estatisticas/estatistica_bancaria_estban/agencia/"
    MAX_MONTHS_LOOKBACK = 12

    TARGET_TOTAL_MONTHS = 60
    TOLERANCE_MISSING_MONTHS = 12

    ESTBAN_FILE_SUFFIXES = [
        "_ESTBAN_AG.csv.zip",
        "_ESTBAN_AG.csv.ZIP",
        "_ESTBAN_AG.zip",
        "_ESTBAN_AG.ZIP",
        "_ESTBAN_AG.csv",
    ]

    REQUEST_KWARGS = {
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        "timeout": 15,
    }


class TransformConfig:
    CSV_DELIMITER = ";"
    CSV_ENCODING = "latin1"
    CSV_SKIPROWS = 2

    COL_DATA_BASE = "DATA_BASE"
    COL_UF = "UF"
    COL_MUNICIPIO = "MUNICIPIO"
    COL_VERBETE_CREDORAS = "VERBETE_711_CONTAS_CREDORAS"
    TARGET_COLUMNS: List[str] = [
        COL_DATA_BASE,
        COL_UF,
        COL_MUNICIPIO,
        COL_VERBETE_CREDORAS,
    ]

    COL_CLEANUP_CHAR = "#"
    FILL_NA_VALUE = 0

    COL_DATA_START = "DATA_START"
    COL_DATA_END = "DATA_END"
    COL_MONTHS_COUNT = "MONTHS_COUNT"


class LoadConfig:
    SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "")
    SHEET_NAME_DESTINATION = os.getenv("SHEET_NAME_DESTINATION", "")
