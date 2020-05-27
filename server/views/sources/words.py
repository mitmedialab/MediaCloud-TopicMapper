import logging

from server import mc
from server.views import WORD_COUNT_SAMPLE_SIZE, WORD_COUNT_UI_NUM_WORDS, WORD_COUNT_DOWNLOAD_NUM_WORDS
import server.util.csv as csv
from server.cache import cache
from server.auth import user_admin_mediacloud_client
import server.views.apicache as base_apicache

logger = logging.getLogger(__name__)


def stream_wordcount_csv(user_mc_key, filename, q, fq):
    response = _cached_word_count(user_mc_key, q, fq, WORD_COUNT_DOWNLOAD_NUM_WORDS, WORD_COUNT_SAMPLE_SIZE)
    props = ['count', 'term', 'stem']
    return csv.stream_response(response, props, filename)


def word_count(user_mc_key, q, fq, num_words=WORD_COUNT_UI_NUM_WORDS, sample_size=WORD_COUNT_SAMPLE_SIZE):
    return _cached_word_count(user_mc_key, q, fq, num_words, sample_size)


@cache.cache_on_arguments()
def _cached_word_count(user_mc_key, q, fq, num_words, sample_size=WORD_COUNT_SAMPLE_SIZE):
    api_client = mc if user_mc_key is None else user_admin_mediacloud_client()
    word_data = api_client.wordCount(q, fq, num_words=num_words, sample_size=sample_size)
    words = [w['term'] for w in word_data]
    word2vec_data = base_apicache.word2vec_google_2d(words)
    try:
        for i in range(len(word2vec_data)):
            word_data[i]['google_w2v_x'] = word2vec_data[i]['x']
            word_data[i]['google_w2v_y'] = word2vec_data[i]['y']
    except KeyError as e:
        logger.warn("Didn't get valid data back from word2vec call")
        logger.exception(e)
    return word_data
