# data_pipeline\src\etl\extract.py

import logging
from datetime import datetime
from dateutil.relativedelta import relativedelta

from data_pipeline.src.config import ExtractConfig
from data_pipeline.src.utils.http_client import fetch_url_bytes
from data_pipeline.src.utils.file_utils import extract_csv_from_bytes

logger = logging.getLogger(__name__)


def _generate_candidate_urls(date_obj: datetime) -> list[str]:
    year_month = date_obj.strftime("%Y%m")
    base_url = ExtractConfig.BASE_ESTBAN_URL

    return [
        f"{base_url}{year_month}{suffix}"
        for suffix in ExtractConfig.ESTBAN_FILE_SUFFIXES
    ]


def _download_and_extract_month(date_obj: datetime) -> bytes | None:
    for url in _generate_candidate_urls(date_obj):
        content = fetch_url_bytes(url, **ExtractConfig.REQUEST_KWARGS)

        if content:
            return extract_csv_from_bytes(content)

    return None


def _find_anchor_date() -> tuple[datetime, bytes]:
    logger.info("Searching for the latest available ESTBAN month...")
    current_date = datetime.now()

    for i in range(ExtractConfig.MAX_MONTHS_LOOKBACK):
        target_date = current_date - relativedelta(months=i)
        csv_content = _download_and_extract_month(target_date)

        if csv_content:
            logger.info(f"Anchor month found: {target_date.strftime('%Y-%m')}")
            return target_date, csv_content

    raise FileNotFoundError(
        f"Could not find any ESTBAN data in the last {ExtractConfig.MAX_MONTHS_LOOKBACK} months."
    )


def download_historical_estban() -> list[bytes]:
    total_months = ExtractConfig.TARGET_TOTAL_MONTHS
    anchor_date, anchor_content = _find_anchor_date()

    logger.info(
        f"Progress: [1/{total_months}] Downloaded anchor month {anchor_date.strftime('%Y-%m')}..."
    )
    all_csv_contents = [anchor_content]

    attempts = 1
    months_to_fetch = total_months - 1
    max_attempts = months_to_fetch + ExtractConfig.TOLERANCE_MISSING_MONTHS

    while len(all_csv_contents) < total_months and attempts <= max_attempts:
        previous_date = anchor_date - relativedelta(months=attempts)
        csv_content = _download_and_extract_month(previous_date)

        if csv_content:
            all_csv_contents.append(csv_content)
            logger.info(
                f"Progress: [{len(all_csv_contents)}/{total_months}] "
                f"Downloaded data for {previous_date.strftime('%Y-%m')}..."
            )
        else:
            logger.warning(
                f"Data for {previous_date.strftime('%Y-%m')} not found. Skipping..."
            )

        attempts += 1

    logger.info(
        f"Series complete: {len(all_csv_contents)} months of data collected."
    )
    return all_csv_contents
