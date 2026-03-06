# data_pipeline\src\utils\http_client.py

import requests
import logging

logger = logging.getLogger(__name__)


def fetch_url_bytes(url: str, **kwargs) -> bytes | None:
    try:
        response = requests.get(url, **kwargs)

        if response.status_code == requests.codes.ok:
            logger.debug(f"Success! Downloaded from: {url}")
            return response.content

        logger.debug(
            f"File not found. HTTP status: {response.status_code} for {url}"
        )
        return None

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed for {url}: {e}")
        return None
