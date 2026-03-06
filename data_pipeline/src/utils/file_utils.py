# data_pipeline\src\utils\file_utils.py

import io
import zipfile
import logging

logger = logging.getLogger(__name__)


def extract_csv_from_bytes(file_content: bytes) -> bytes:
    content_io = io.BytesIO(file_content)

    if not zipfile.is_zipfile(content_io):
        logger.debug("File is not a ZIP. Assuming raw CSV format.")
        return file_content

    with zipfile.ZipFile(content_io) as archive:
        all_files = archive.namelist()
        csv_files = [
            name for name in all_files if name.lower().endswith(".csv")
        ]

        if not csv_files:
            error_msg = f"No CSV file found inside the ZIP archive. Contents: {all_files}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        target_csv = csv_files[0]

        if len(csv_files) > 1:
            logger.warning(
                f"Multiple CSVs found in ZIP. Extracting the first one: {target_csv}"
            )

        with archive.open(target_csv) as file:
            return file.read()
