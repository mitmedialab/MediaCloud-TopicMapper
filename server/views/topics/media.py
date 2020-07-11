import logging
from flask import jsonify, request, Response
import flask_login

from server import app
from server.auth import user_mediacloud_key, user_admin_mediacloud_client
from server.util import csv
from server.views.topics import TOPIC_MEDIA_CSV_PROPS
import server.views.topics.apicache as apicache
from server.util.request import filters_from_args, api_error_handler
from server.views.topics.stories import platform_csv_column_header_prefix


logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/media', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_media(topics_id):
    media_list = apicache.topic_media_list(user_mediacloud_key(), topics_id)
    return jsonify(media_list)


@app.route('/api/topics/<topics_id>/media/<media_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media(topics_id, media_id):
    user_mc = user_admin_mediacloud_client()
    combined_media_info = apicache.topic_media_list(user_mediacloud_key(), topics_id, media_id=media_id)['media'][0]
    media_info = user_mc.media(media_id)
    for key in list(media_info.keys()):
        if key not in list(combined_media_info.keys()):
            combined_media_info[key] = media_info[key]
    return jsonify(combined_media_info)


def stream_media_list_csv(user_mc_key, topic, filename, **kwargs):
    filename = topic['name'] + '-' + filename
    # we have to make a separate call to the media info if the user wants to inlcude the media metadata
    include_media_metadata = ('media_metadata' in kwargs) and (kwargs['media_metadata'] == '1')
    # if the focusId is a URL Sharing subtopic, then we have platform-specific post/author/channel share counts
    include_platform_url_shares = kwargs['include_platform_url_shares'] if 'include_platform_url_shares' in kwargs else False
    # if this topic includes platforms, then we have URL sharing counts (post/author/channel) for each platform
    include_all_url_shares = kwargs['include_all_url_shares'] if 'include_all_url_shares' in kwargs else False
    params = kwargs.copy()
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'timespans_id': timespans_id,
        'snapshots_id': snapshots_id,
        'foci_id': foci_id,
        'q': q,
        'sort': request.args.get('sort') if 'sort' in request.args else None,
    }
    params.update(merged_args)
    # do a check to see if the user has added in a real query or not
    if 'q' in params:
        params['q'] = params['q'] if 'q' not in [None, '', 'null', 'undefined'] else None
    params['limit'] = 1000  # an arbitrary value to let us page through with big topics (note, this is the page size)
    # set up the dict keys / column headers that the user cares about for this download
    props = TOPIC_MEDIA_CSV_PROPS
    if include_platform_url_shares:
        props += ['post_count', 'channel_count', 'author_count']
    if include_all_url_shares:
        # if the user requested to download all the url sharing counts by platform, we need to grab the config for that
        # which is held in the platform seed query objects
        topic_seed_queries = topic['topic_seed_queries']
        extra_columns = []
        for tsq in topic_seed_queries:
            prefix = platform_csv_column_header_prefix(tsq)
            extra_columns += [prefix+'post_count', prefix+'channel_count', prefix+'author_count']
        props += extra_columns
        params['topic_seed_queries'] = topic_seed_queries
    if include_media_metadata:
        props += ['media_pub_country', 'media_pub_state', 'media_language', 'media_about_country', 'media_media_type']
    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    return Response(_stream_media_by_page(user_mc_key, topic['topics_id'], props, **params),
                    mimetype='text/csv; charset=utf-8', headers=headers)


def _stream_media_by_page(user_mc_key, topics_id, props, **kwargs):
    yield ','.join(props) + '\n'  # first send the column names
    more_media = True
    while more_media:
        page = apicache.topic_media_list_page(user_mc_key, topics_id, **kwargs)
        page_media = page['media']
        for m in page_media:
            row = csv.dict2row(props, m)
            row_string = ','.join(row) + '\n'
            yield row_string
        if 'next' in page['link_ids']:
            kwargs['link_id'] = page['link_ids']['next']
            more_media = True
        else:
            more_media = False
