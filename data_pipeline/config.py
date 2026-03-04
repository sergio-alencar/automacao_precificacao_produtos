# data_pipeline\config.py

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

CREDENTIALS_FILE = BASE_DIR / "credentials.json"
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "")
SHEET_NAME_DESTINATION = os.getenv("SHEET_NAME_DESTINATION", "")

REQUEST_KWARGS = {
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    "timeout": 15,
}

ESTBAN_URL_TEMPLATES = [
    "https://www.bcb.gov.br/content/estatisticas/estatistica_bancaria_estban/agencia/{year_month}_ESTBAN_AG.csv{ext}",
    "https://www4.bcb.gov.br/fis/cosif/cont/estban/agencia/{year_month}_ESTBAN_AG{ext}",
    "https://www.bcb.gov.br/content/estatisticas/estban/estban_ag/{year_month}_ESTBAN_AG{ext}",
]

MAX_MONTHS_LOOKBACK = 12

COL_UF = "UF"
COL_MUNICIPIO = "MUNICIPIO"
COL_VERBETE_CREDORAS = "VERBETE_711_CONTAS_CREDORAS"
TARGET_COLUMNS: List[str] = [COL_UF, COL_MUNICIPIO, COL_VERBETE_CREDORAS]

CSV_DELIMITER = ";"
CSV_ENCODING = "latin1"
CSV_SKIPROWS = 2

OUTPUT_FILENAME = BASE_DIR / "current_processed_estban.csv"
LOG_FILENAME = BASE_DIR / "latest_execution.log"
