# data_pipeline\extract.py

import io
import zipfile
import requests
import logging
from datetime import datetime
from dateutil.relativedelta import relativedelta
from config import ESTBAN_URL_TEMPLATES, MAX_MONTHS_LOOKBACK, REQUEST_KWARGS

logger = logging.getLogger(__name__)


def _try_download_url(url: str) -> bytes | None:
    try:
        response = requests.get(url, **REQUEST_KWARGS)

        if response.status_code == 200:
            logger.info(f"Success! File downloaded from: {url}")
            return response.content
        else:
            logger.debug(
                f"File not found. HTTP status: {response.status_code} for {url}"
            )
            return None

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed for {url}: {e}")
        return None


def download_latest_estban_zip() -> bytes:
    current_date = datetime.now()

    for _ in range(MAX_MONTHS_LOOKBACK):
        year_month = current_date.strftime("%Y%m")
        extensions_to_try = [".zip", ".ZIP"]

        for template in ESTBAN_URL_TEMPLATES:
            for ext in extensions_to_try:
                url = template.format(year_month=year_month, ext=ext)
                content = _try_download_url(url)

                if content:
                    return content

        current_date -= relativedelta(months=1)

    raise FileNotFoundError(
        f"Failed to fetch recent ESTBAN data in the last {MAX_MONTHS_LOOKBACK} months."
    )


def extract_csv_from_zip(zip_content: bytes) -> bytes:
    with zipfile.ZipFile(io.BytesIO(zip_content)) as archive:
        csv_filename = archive.namelist()[0]

        with archive.open(csv_filename) as file:
            return file.read()
