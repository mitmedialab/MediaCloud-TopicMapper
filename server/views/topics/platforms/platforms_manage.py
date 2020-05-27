import logging
from flask import jsonify, request
import flask_login
import os

from server import app
from server.util.request import api_error_handler
from server.auth import user_mediacloud_client
from server.util.request import form_fields_required
import server.views.topics.apicache as apicache
from server.views.platforms import parse_open_web_media_from_channel
from server.platforms import PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_SOURCE_MEDIA_CLOUD, PLATFORM_GENERIC, \
    PLATFORM_SOURCE_CSV, PLATFORM_SOURCE_POSTGRES

logger = logging.getLogger(__name__)


def _available_platforms():
    """
    We hide the Generic/Postgresql source because it isn't viewable/editable
    :return:
    """
    info = apicache.topic_platform_info()
    return [{
        'platform': i['platform_name'],
        'source': i['source_name'],
        'query': '',
        'topic_seed_queries_id': -1,
    } for i in info['info']['topic_platforms_sources_map'] if i['source_name'] != PLATFORM_SOURCE_POSTGRES]


@app.route('/api/topics/<topics_id>/platforms/list', methods=['GET'])
@flask_login.login_required
def get_topic_platforms(topics_id):
    user_mc = user_mediacloud_client()
    available_platforms = _available_platforms()
    topic = user_mc.topic(topics_id)
    # and add in the open web query, which isn't stored in topic_seed_queries for historical reasons :-(
    if topic_has_seed_query(topic):
        for item in available_platforms:
            if (item['platform'] == PLATFORM_OPEN_WEB) and (item['source'] == PLATFORM_SOURCE_MEDIA_CLOUD):
                real_web_query = platform_for_web_seed_query(topic)
                for key in real_web_query:
                    item[key] = real_web_query[key]
                break
    # now fill in with any seed queries that have been created
    for seed_query in topic['topic_seed_queries']:
        match = [p for p in available_platforms if (p['platform'] == seed_query['platform'])
                 and (p['source'] == seed_query['source'])]
        if len(match) == 1:
            match[0]['query'] = seed_query['query']
            match[0]['topic_seed_queries_id'] = seed_query['topic_seed_queries_id']
    return jsonify({'results': available_platforms})


@app.route('/api/topics/<topics_id>/platforms/add', methods=['POST'])
@flask_login.login_required
@form_fields_required('platform_type', 'platform_query', 'platform_source', 'platform_channel')
@api_error_handler
def topic_add_platform(topics_id):
    user_mc = user_mediacloud_client()
    channel = request.form['platform_channel'] if 'platform_channel' in request.form else None
    source = request.form['platform_source'] if 'platform_source' in request.form else None
    query = request.form['platform_query'] if 'platform_query' in request.form else None
    platform = request.form['platform_type']
    result = {}
    # now preprocess anything you need to
    if (platform == PLATFORM_GENERIC) and (source == PLATFORM_SOURCE_CSV):
        # in this case the query field has been overloaded to hold the server temporary CSV filename
        with open(os.path.join(app.config['UPLOAD_FOLDER'], query), 'r') as csv_file:
            data = csv_file.read()
        query = data
    # and save the platform (media cloud isn't saved as a real platform)
    if (platform == PLATFORM_OPEN_WEB) and (source == PLATFORM_SOURCE_MEDIA_CLOUD):
        # channel has open web sources in it
        sources, collections = parse_open_web_media_from_channel(channel)
        user_mc.topicUpdate(topics_id, media_ids=sources, media_tags_ids=collections, solr_seed_query=query)
        result['success'] = 1
        result['id'] = 1  # web/mediacloud
    else:
        # TODO do we need to add dates?
        # TODO format channel properly for reddit (subreddit)
        # if twitter crimson_hexagon, id is in query field
        result = user_mc.topicAddSeedQuery(topics_id=topics_id, platform=platform, source=source, query=query)
        result['success'] = 1 if 'topic_seed_query' in result else 0
        result['id'] = result['topic_seed_query']['topic_seed_queries_id']
    return jsonify(result)  # topic_seed_queries_id


@app.route('/api/topics/<topics_id>/platforms/<platform_id>/update', methods=['POST'])
@flask_login.login_required
@form_fields_required('platform_type', 'platform_query', 'platform_source', 'platform_channel')
@api_error_handler
def topic_update_platform(topics_id, platform_id):
    user_mc = user_mediacloud_client()
    channel = request.form['platform_channel'] if 'platform_channel' in request.form else None
    source = request.form['platform_source'] if 'platform_source' in request.form else None
    query = request.form['platform_query'] if 'platform_query' in request.form else None
    platform = request.form['platform_type']
    result = {}
    if platform == PLATFORM_OPEN_WEB:
        # here we need to parse the sources and collections out of the 'channel'
        sources, collections = parse_open_web_media_from_channel(channel)
        user_mc.topicUpdate(topics_id, media_ids=sources, media_tags_ids=collections, solr_seed_query=query)
        result['success'] = 1
        result['id'] = platform_id #web_shim_ui
    else:
        result = user_mc.topicRemoveSeedQuery(topics_id, topic_seed_queries_id=platform_id)
        # Fake an update operation here by removing and then adding again
        if platform == PLATFORM_REDDIT:
            #TODO update this merge with correct info from Jason/Pushshift library
            query = "{} AND {}".format(query, channel)
        result = user_mc.topicAddSeedQuery(topics_id, platform, source, query)

        result['success'] = 1 if 'topic_seed_query' in result else 0
        result['id'] = result['topic_seed_query']['topic_seed_queries_id']

    return result  # topic_seed_queries_id


@app.route('/api/topics/<topics_id>/platforms/<topic_seed_queries_id>/remove', methods=['POST'])
@flask_login.login_required
@api_error_handler
def topic_remove_platform(topics_id, topic_seed_queries_id):
    user_mc = user_mediacloud_client()
    # Note: you can't delete the web/mediacloud type of platform
    result = user_mc.topicRemoveSeedQuery(topics_id, topic_seed_queries_id=topic_seed_queries_id)
    return jsonify(result)


def platform_for_web_seed_query(object_with_query):
    # parse out pieces
    if 'solr_seed_query' in object_with_query:
        seed_query = object_with_query['solr_seed_query']
    else:
        seed_query = object_with_query['topic']['solr_seed_query']
    if 'media' in object_with_query:
        sources = object_with_query['media'].copy()
    else:
        sources = object_with_query['topic_media'].copy()
    if 'media_tags' in object_with_query:
        collections = object_with_query['media_tags'].copy()
    else:
        collections = object_with_query['topic_media_tags'].copy()
    sources += collections
    web_seed_query = {'platform': PLATFORM_OPEN_WEB,
                      'source': PLATFORM_SOURCE_MEDIA_CLOUD,
                      'query': seed_query,
                      'channel': sources,
                      'topic_seed_queries_id': 1}
    return web_seed_query


def topic_has_seed_query(topic):
    # HACK: support our temporary hack for topics needing a query and media_id during creation
    return (topic['solr_seed_query'] not in [None, '']) and (topic['solr_seed_query'] != 'null')
