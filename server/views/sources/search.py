import logging
from flask import jsonify, request
import flask_login
from server.views.media_search import media_search, collection_search

from server import app
from server.util.request import api_error_handler, arguments_required
from server.util.tags import VALID_COLLECTION_TAG_SETS_IDS
from server.auth import user_has_auth_role, ROLE_MEDIA_EDIT, user_mediacloud_client
from server.views.favorites import add_user_favorite_flag_to_sources, add_user_favorite_flag_to_collections

logger = logging.getLogger(__name__)

MAX_SOURCES = 50
MAX_COLLECTIONS = 50


@app.route('/api/sources/search/<search_str>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_media_search(search_str):
    tags = None
    cleaned_search_str = None if search_str == '*' else search_str
    if 'tags[]' in request.args:
        tags = request.args['tags[]'].split(',')
    if tags is None:
        source_list = media_search(cleaned_search_str)[:MAX_SOURCES]
    else:
        source_list = media_search(cleaned_search_str, tags_id=tags[0])[:MAX_SOURCES]
    add_user_favorite_flag_to_sources(source_list)
    return jsonify({'list': source_list})


@app.route('/api/collections/search/<search_str>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_search(search_str):
    public_only = False if user_has_auth_role(ROLE_MEDIA_EDIT) else True
    results = collection_search(search_str, public_only, VALID_COLLECTION_TAG_SETS_IDS)
    trim_count = MAX_COLLECTIONS if len(results) > 20 else len(results)
    trimmed = results[:trim_count]
    add_user_favorite_flag_to_collections(trimmed)
    return jsonify({'list': trimmed})


@app.route('/api/sources/search/name-exists', methods=['GET'])
@flask_login.login_required
@arguments_required('searchStr')
@api_error_handler
def api_sources_name_exists():
    """
    Check if source with name/url exists already
    :return: boolean indicating if source with this name exists or not (case insensive check)
    """
    mc = user_mediacloud_client()
    search_str = request.args['searchStr']
    media_id = int(request.args['id']) if 'id' in request.args else None
    matching_sources = mc.mediaList(name_like=search_str)[:MAX_SOURCES]
    if id:
        matching_source_names = [s['name'].lower().strip() for s in matching_sources
                                 if s['media_id'] != media_id
                                 and s['name'].strip().lower() != search_str.strip().lower()]
    else:
        matching_source_names = [s['name'].lower().strip() for s in matching_sources]

    name_in_use = search_str.lower() in matching_source_names
    return jsonify({'nameInUse': name_in_use})


@app.route('/api/collections/search/name-exists', methods=['GET'])
@flask_login.login_required
@arguments_required('searchStr')
@api_error_handler
def api_collections_name_exists():
    """
    Check if source with name/url exists already
    :return: boolean indicating if source with this name exists or not (case insensive check)
    """
    search_str = request.args['searchStr']
    tags_id = int(request.args['id']) if 'id' in request.args else None
    matching_collections = collection_search(search_str, False, VALID_COLLECTION_TAG_SETS_IDS)[:MAX_SOURCES]
    if tags_id:
        matching_collections_names = [s['label'].lower().strip() for s in matching_collections
                                      if s['tags_id'] != tags_id]
    else:
        matching_collections_names = [s['label'].lower().strip() for s in matching_collections]

    name_in_use = search_str.lower() in matching_collections_names
    return jsonify({'nameInUse': name_in_use})
