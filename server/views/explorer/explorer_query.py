import logging
from flask import jsonify, request
import flask_login
import random
from server import app, mc
from server.auth import user_admin_mediacloud_client, user_has_auth_role, is_user_logged_in, ROLE_MEDIA_EDIT
from server.util.request import api_error_handler, arguments_required
from server.views.media_picker import ALL_MEDIA
from operator import itemgetter
import json
logger = logging.getLogger(__name__)


@app.route('/api/explorer/sources/list', methods=['GET'])
@flask_login.login_required
@arguments_required('sources[]')
@api_error_handler
def api_explorer_sources_by_ids():
    user_mc = user_admin_mediacloud_client()
    source_list = []
    source_id_array = request.args['sources[]'].split(',')
    for media_id in source_id_array:
        info = user_mc.media(media_id)
        info['id'] = int(media_id)
        source_list.append(info)
    return jsonify({"results": source_list})


@app.route('/api/explorer/collections/list', methods=['GET'])
@flask_login.login_required
@arguments_required('collections[]')
@api_error_handler
def api_explorer_collections_by_ids():
    client_mc = user_admin_mediacloud_client()
    querying_all_media = False
    try:
        if int(request.args['collections[]']) == -1:
            querying_all_media = True
    except ValueError:
        # ie. request.args['collections[]'] is not an int (ie. it is a list of collections like a normal query)
        querying_all_media = False
    if querying_all_media:
        collection_list = [{'tags_id': ALL_MEDIA, 'id': ALL_MEDIA, 'label': "All Media", 'tag_sets_id': ALL_MEDIA}]
    else:
        collection_ids = request.args['collections[]'].split(',')
        collection_list = []
        for tags_id in collection_ids:
            info = client_mc.tag(tags_id)
            info['id'] = int(tags_id)
            collection_list.append(info)
    return jsonify({"results": collection_list})


@app.route('/api/explorer/custom-searches/list', methods=['GET'])
@flask_login.login_required
@arguments_required('searches[]')
@api_error_handler
def api_explorer_searches_by_ids():

    user_mc = user_admin_mediacloud_client()
    searches_results = []
    searches_list = json.loads(request.args['searches[]'])
    for s in searches_list:
        keyword = s['media_keyword'] if 'media_keyword' not in ['undefined'] and 'media_keyword' in s else '*'
        tag_set_tag_obj = {'tags': {}}

        for key_tag_set in s.keys():  # grab tagsets and corresponding tags
            if 'media_keyword' in key_tag_set:
                continue
            tags = s[key_tag_set]
            metadata_tag = user_mc.tagSet(key_tag_set)
            metadata_tag['id'] = int(key_tag_set)
            tag_set_tag_obj['tags'][metadata_tag['name']] = []
            search_tags = []
            for t in tags:
                tag_info = user_mc.tag(t)
                tag_info['value'] = True  # test before
                search_tags.append(tag_info)
            tag_set_tag_obj['tags'][metadata_tag['name']] = search_tags
        tag_set_tag_obj['media_keyword'] = keyword or "search"
        tag_set_tag_obj['id'] = random.uniform(1, 10)
        searches_results.append(tag_set_tag_obj)

    return jsonify({"results": searches_results})


@app.route('/api/explorer/demo/sources/list', methods=['GET'])
@arguments_required('sources[]')
@api_error_handler
def api_explorer_demo_sources_by_ids():
    source_list = []
    source_id_array = request.args['sources[]'].split(',')
    for media_id in source_id_array:
        info = mc.media(media_id)
        info['id'] = int(media_id)
        source_list.append(info)
    return jsonify(source_list)


@app.route('/api/explorer/demo/collections/list', methods=['GET'])
@arguments_required('collections[]')
@api_error_handler
def api_explorer_demo_collections_by_ids():
    collection_ids = request.args['collections[]'].split(',')
    coll_list = []
    for tags_id in collection_ids:
        if len(tags_id) > 0:
            info = mc.tag(tags_id)
            info['id'] = tags_id
            coll_list.append(info)
    return jsonify({"results": coll_list})


# TODO use this or the other collection list retrieval?
@app.route('/api/explorer/set/<tag_sets_id>', methods=['GET'])
@api_error_handler
def api_explorer_collection_set(tag_sets_id):
    """
    Return a list of all the (public only or public and private, depending on user role) collections in a tag set.
    Not cached because this can change, and load time isn't terrible.
    :param tag_sets_id: the tag set to query for public collections
    :return: dict of info and list of collections in
    """
    if is_user_logged_in() and user_has_auth_role(ROLE_MEDIA_EDIT) is True:
        info = _tag_set_with_private_collections(tag_sets_id)
    else:
        info = _tag_set_with_public_collections(tag_sets_id)

    # add_user_favorite_flag_to_collections(info['collections'])
    return jsonify(info)


def _tag_set_with_collections(tag_sets_id, show_only_public_collections):
    # TODO use which mc or user_mc here
    tag_set = mc.tagSet(tag_sets_id)
    # page through tags
    more_tags = True
    all_tags = []
    last_tags_id = 0
    while more_tags:
        tags = mc.tagList(tag_sets_id=tag_set['tag_sets_id'], last_tags_id=last_tags_id, rows=100,
                          public_only=show_only_public_collections)
        all_tags = all_tags + tags
        if len(tags) > 0:
            last_tags_id = tags[-1]['tags_id']
        more_tags = len(tags) != 0
    # double check the show_on_media because that controls public or not
    collection_list = [t for t in all_tags if t['show_on_media'] == 1]
    collection_list = sorted(collection_list, key=itemgetter('label'))
    return {
        'name': tag_set['label'],
        'description': tag_set['description'],
        'collections': collection_list
    }


def _tag_set_with_private_collections(tag_sets_id):
    return _tag_set_with_collections(tag_sets_id, False)


def _tag_set_with_public_collections(tag_sets_id):
    return _tag_set_with_collections(tag_sets_id, True)
