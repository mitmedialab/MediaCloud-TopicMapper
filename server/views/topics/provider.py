import logging
from flask import jsonify
import flask_login
from typing import List, Dict
from operator import itemgetter

from server import app
from server.views import WORD_COUNT_SAMPLE_SIZE, WORD_COUNT_UI_NUM_WORDS
import server.util.csv as csv
from server.util.request import api_error_handler, safely_read_arg
from server.auth import user_mediacloud_key, user_mediacloud_client
from server.views.topics.stories import stream_story_list_csv
import server.views.topics.apicache as apicache
from server.util.stringutil import camel_to_snake, trim_solr_date
from server.views.topics.media import stream_media_list_csv

logger = logging.getLogger(__name__)


def _parse_optional_args(arg_names: List, custom_defaults: Dict = {}) -> Dict:
    parsed_args = {}
    for js_name in arg_names:
        python_name = camel_to_snake(js_name)
        # important to preserve None values here, rather than simple not adding the key,
        # because the None might be here to override a default value in the API call
        default = None if js_name not in custom_defaults.keys() else custom_defaults[js_name]
        parsed_args[python_name] = safely_read_arg(js_name, default)
    return parsed_args


def _parse_words_optional_arguments():
    """
    The user can override some of the defaults that govern any request for word lists within the topic. This method
    centralizes the parsing of those optional overrides from the request made.
    :return: a dict that can be spread as arguments to a call to topic_ngram_counts
    """
    return _parse_optional_args(['sample_size', 'ngramSize'],
                                {'sample_size': WORD_COUNT_SAMPLE_SIZE, 'ngramSize': 1})


@app.route('/api/topics/<topics_id>/provider/words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_words(topics_id):
    optional_args = _parse_words_optional_arguments()
    word_counts = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, **optional_args)
    results = {
        'words': word_counts[:WORD_COUNT_UI_NUM_WORDS],
        **optional_args
    }
    return jsonify(results)


@app.route('/api/topics/<topics_id>/provider/words.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_words_csv(topics_id):
    optional_args = _parse_words_optional_arguments()
    results = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, **optional_args)
    file_name = 'topic-{}-sampled-ngrams-{}-word'.format(topics_id, optional_args['ngram_size'])
    return csv.stream_response(results, apicache.WORD_COUNT_DOWNLOAD_COLUMNS, file_name)


def _parse_stories_optional_arguments():
    """
    The user can override some of the defaults that govern any request for a story list within the topic. This method
    centralizes the parsing of those optional overrides from the request made.
    :return: a dict that can be spread as arguments to a call to topic_story_list
    """
    return _parse_optional_args(
        # these ones are options to the story CSV download helper
        ['storyLimit', 'storyTags', 'mediaMetadata', 'platformUrlShares', 'socialShares']
    )


@app.route('/api/topics/<topics_id>/provider/stories', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_stories(topics_id):
    optional_args = _parse_stories_optional_arguments()
    results = apicache.topic_story_list(user_mediacloud_key(), topics_id, **optional_args)
    return jsonify(results)


@app.route('/api/topics/<topics_id>/provider/stories.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_stories_csv(topics_id):
    optional_args = _parse_stories_optional_arguments()
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    del optional_args['link_id']  # we do this do make sure this helper can page through the results
    return stream_story_list_csv(user_mediacloud_key(), 'stories', topic, **optional_args)


@app.route('/api/topics/<topics_id>/provider/count-over-time', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_count_over_time(topics_id):
    results = apicache.topic_split_story_counts(user_mediacloud_key(), topics_id)
    return jsonify(results)


@app.route('/api/topics/<topics_id>/provider/count-over-time.csv', methods=['GET'])
@flask_login.login_required
def topic_provider_count_over_time_csv(topics_id):
    results = apicache.topic_split_story_counts(user_mediacloud_key(), topics_id)
    return _stream_topic_split_story_counts_csv(results, 'topic-{}-count-over-time'.format(topics_id))


def _stream_topic_split_story_counts_csv(results, filename):
    clean_results = [{'date': trim_solr_date(item['date']), 'stories': item['count']} for item in results['counts']]
    sorted_results = sorted(clean_results, key=itemgetter('date'))
    props = ['date', 'stories']
    return csv.stream_response(sorted_results, props, filename)


def _parse_count_optional_arguments():
    """
    The user can override some of the defaults that govern any request for a story list within the topic. This method
    centralizes the parsing of those optional overrides from the request made.
    :return: a dict that can be spread as arguments to a call to topic_story_list
    """
    return _parse_optional_args(
        # these ones are options to the story CSV download helper
        ['subQuery']
    )


def _matching_ratio(topics_id, query_clause):
    total = apicache.topic_story_count(user_mediacloud_key(), topics_id)
    sub_query_clause = None
    if query_clause:
        sub_query_clause = apicache.add_to_user_query(query_clause)
    matching = apicache.topic_story_count(user_mediacloud_key(), topics_id, q=sub_query_clause)
    return {'count': matching['count'], 'total': total['count']}


@flask_login.login_required
@api_error_handler
@app.route('/api/topics/<topics_id>/provider/count', methods=['GET'])
def topic_provider_count(topics_id):
    optional_args = _parse_count_optional_arguments()
    return _matching_ratio(topics_id, optional_args['sub_query'] if 'sub_query' in optional_args else None)


def _parse_tag_count_optional_arguments():
    """
    The user can override some of the defaults that govern any request for a story list within the topic. This method
    centralizes the parsing of those optional overrides from the request made.
    :return: a dict that can be spread as arguments to a call to story_tag_count
    """
    args = _parse_optional_args([
        'tagSetsId',  # top tags within this tagset will be returned
        'tagsId',  # this is what tag to use to check coverage (ie. how many stories out of total have this tag)
    ])
    args['tags_id'] = args['tags_id'].split(",")
    return args


def _tag_use_data(topics_id):
    """
    Helper so JSON and CSV handlers can return same data without extra work
    :param topics_id:
    :return:
    """
    optional_args = _parse_tag_count_optional_arguments()
    tag_use = apicache.topic_tag_counts(user_mediacloud_key(), topics_id, optional_args['tag_sets_id'])
    coverage = _matching_ratio(topics_id,
                               "tags_id_stories:({})".format(" ".join(optional_args['tags_id'])) if 'tags_id' in optional_args else None)
    for t in tag_use:
        try:
            t['pct'] = float(t['count']) / float(coverage['count'])
        except ZeroDivisionError:
            t['pct'] = 0
    return {'list': tag_use, 'coverage': coverage}


@flask_login.login_required
@api_error_handler
@app.route('/api/topics/<topics_id>/provider/tag-use', methods=['GET'])
def topic_provider_tag_use(topics_id):
    """
    What are the most frequent tags (in the tag set specified)
    :param topics_id:
    :return:
    """
    return jsonify(_tag_use_data(topics_id))


@flask_login.login_required
@api_error_handler
@app.route('/api/topics/<topics_id>/provider/tag-use.csv', methods=['GET'])
def topic_provider_tag_use_csv(topics_id):
    data = _tag_use_data(topics_id)
    return csv.stream_response(data['list'],
                               ['tags_id', 'label', 'count', 'pct'],
                               'topic-{}-tag-use'.format(topics_id))


def _parse_media_optional_arguments():
    """
    The user can override some of the defaults that govern any request for a story list within the topic. This method
    centralizes the parsing of those optional overrides from the request made.
    :return: a dict that can be spread as arguments to a call to story_tag_count
    """
    args = _parse_optional_args([
        'mediaMetadata',
        'includePlatformUrlShares',
        'includeAllUrlShares',
    ])
    return args


@app.route('/api/topics/<topics_id>/provider/media', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_media(topics_id):
    media_list = apicache.topic_media_list(user_mediacloud_key(), topics_id)
    return jsonify(media_list)


@app.route('/api/topics/<topics_id>/provider/media.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_provider_media_csv(topics_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_media_list_csv(user_mediacloud_key(), topic, 'media')
