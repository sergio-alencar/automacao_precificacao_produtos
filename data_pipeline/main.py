# data_pipeline\main.py

import logging
from data_pipeline.src.config import AppConfig
from data_pipeline.src.etl.extract import download_historical_estban
from data_pipeline.src.etl.transform import process_estban_series
from data_pipeline.src.etl.load import load_data_to_sheets

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[
        logging.FileHandler(AppConfig.LOG_FILENAME, mode="w", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def run_pipeline() -> None:
    try:
        logger.info("=== ESTBAN extraction pipeline started ===")

        csv_contents_list = download_historical_estban()

        final_df = process_estban_series(csv_contents_list)
        final_df.to_csv(AppConfig.OUTPUT_FILENAME, index=False)

        load_data_to_sheets(final_df)

        logger.info("=== ESTBAN extraction pipeline finished successfully ===")

    except Exception:
        logger.exception("An error occurred during the pipeline execution.")


if __name__ == "__main__":
    run_pipeline()
