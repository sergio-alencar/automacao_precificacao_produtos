# data_pipeline\main.py

import logging
from config import LOG_FILENAME, OUTPUT_FILENAME
from extract import download_latest_estban_zip, extract_csv_from_zip
from transform import process_estban_data
from load import load_data_to_sheets

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILENAME, mode="w", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def run_pipeline() -> None:
    try:
        logger.info("=== ESTBAN extraction pipeline started ===")

        zip_content = download_latest_estban_zip()
        csv_content = extract_csv_from_zip(zip_content)

        final_df = process_estban_data(csv_content)
        final_df.to_csv(OUTPUT_FILENAME, index=False)

        load_data_to_sheets(final_df)

        logger.info("=== ESTBAN extraction pipeline finished successfully ===")

    except Exception:
        logger.exception("An error occurred during the pipeline execution.")


if __name__ == "__main__":
    run_pipeline()
