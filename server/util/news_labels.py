import requests
import logging

from server import config

logger = logging.getLogger(__name__)


def predict(story_text):
    if story_text is None:  # maybe we didn't parse any text out?
        return {}
    url = "{}/predict.json".format(config.get('NYT_THEME_LABELLER_URL'))
    try:
        r = requests.post(url, json={'text': story_text})
        return r.json()
    except requests.exceptions.RequestException as e:
        logger.exception(e)
    return {}
