import logging
from flask import jsonify, request
import flask_login
import json

from server import app
from server.util.request import api_error_handler, form_fields_required
import server.util.dates as date_util
from server.platforms import provider_for, PLATFORM_REDDIT, PLATFORM_OPEN_WEB, PLATFORM_SOURCE_MEDIA_CLOUD, \
    PLATFORM_TWITTER, PLATFORM_SOURCE_CRIMSON_HEXAGON, PLATFORM_GENERIC, PLATFORM_SOURCE_CSV

logger = logging.getLogger(__name__)

PLATFORM_PREVIEW_FIELDS = ['platform_type', 'platform_source', 'platform_channel',
                         'platform_query', 'start_date', 'end_date']


def _info_from_request():
    """
    Load all the info we need out of the request so we can make every preview method as generic as possible
    :return:
    """
    platform = request.form['platform_type']
    source = request.form['platform_source']
    provider = provider_for(platform, source)
    query = request.form['platform_query']
    channel = request.form['platform_channel'] if 'platform_channel' in request.form else ''
    start_date, end_date = _parse_query_dates()
    options = {}
    if platform == PLATFORM_REDDIT:
        options = {'subreddits': json.loads(channel)}
    elif (platform == PLATFORM_OPEN_WEB) and (source == PLATFORM_SOURCE_MEDIA_CLOUD):
        media = json.loads(channel)
        sources = media['sources[]'] if 'sources[]' in media and 'sources' not in [None, ''] else ''
        collections = media['collections[]'] if 'collections[]' in media else ''
        options = {'sources': sources, 'collections': collections}
    elif (platform == PLATFORM_TWITTER) and (source == PLATFORM_SOURCE_CRIMSON_HEXAGON):
        options = {'monitor_id': query}
        query = ''
    elif (platform == PLATFORM_GENERIC) and (source == PLATFORM_SOURCE_CSV):
        # in this case, the temp server filename is stored in the query field
        options = {}
        provider.set_filename(query)
        query = ''
    return provider, query, start_date, end_date, options


@app.route('/api/platforms/sample', methods=['POST'])
@form_fields_required(*PLATFORM_PREVIEW_FIELDS)
@flask_login.login_required
@api_error_handler
def api_platforms_preview_sample():
    provider, query, start_date, end_date, options = _info_from_request()
    try:
        content_list = provider.sample(query, start_date, end_date, **options)
        supported = True
    except NotImplementedError:  # if this provider doesn't support previewing the data, let the client know
        content_list = []
        supported = False
    return jsonify({'list': content_list, 'supported': supported})


@app.route('/api/platforms/count', methods=['POST'])
@form_fields_required(*PLATFORM_PREVIEW_FIELDS)
@flask_login.login_required
@api_error_handler
def api_platforms_preview_total_content():
    provider, query, start_date, end_date, options = _info_from_request()
    try:
        content_count = provider.count(query, start_date, end_date, **options)
        supported = True
    except NotImplementedError:  # if this provider doesn't support previewing the data, let the client know
        content_count = 0
        supported = False
    return jsonify({'count': content_count, 'supported': supported})


@app.route('/api/platforms/count-over-time', methods=['POST'])
@form_fields_required(*PLATFORM_PREVIEW_FIELDS)
@flask_login.login_required
@api_error_handler
def api_platforms_preview_split_story_count():
    provider, query, start_date, end_date, options = _info_from_request()
    try:
        content_count_over_time = provider.count_over_time(query, start_date, end_date, **options)
        # sum the total for display
        total_stories = 0
        if 'counts' in content_count_over_time:
            for c in content_count_over_time['counts']:
                total_stories += c['count']
        content_count_over_time['total_story_count'] = total_stories
        supported = True
    except NotImplementedError:  # if this provider doesn't support previewing the data, let the client know
        content_count_over_time = {}
        supported = False
    return jsonify({'results': content_count_over_time, 'supported': supported})


@app.route('/api/platforms/words', methods=['POST'])
@form_fields_required(*PLATFORM_PREVIEW_FIELDS)
@flask_login.login_required
@api_error_handler
def api_platforms_preview_top_words():
    provider, query, start_date, end_date, options = _info_from_request()
    try:
        content_words = provider.words(query, start_date, end_date, **options)
        supported = True
    except NotImplementedError:  # if this provider doesn't support previewing the data, let the client know
        content_words = []
        supported = False
    return jsonify({'results': content_words, 'supported': supported})


def _parse_query_dates():
    data = request.form
    if 'startDate' in data:
        start_date = date_util.solr_date_to_date(data['startDate'])
    elif 'start_date' in data:
        start_date = date_util.solr_date_to_date(data['start_date'])
    if 'endDate' in data:
        end_date = date_util.solr_date_to_date(data['endDate'])
    elif 'end_date' in data:
        end_date = date_util.solr_date_to_date(data['end_date'])
    return start_date, end_date


def parse_open_web_media_from_channel(channel):
    media = json.loads(channel)
    sources = media['sources[]'] if 'sources[]' in media and 'sources' not in [None, ''] else ''
    collections = media['collections[]'] if 'collections[]' in media else ''
    return sources, collections
