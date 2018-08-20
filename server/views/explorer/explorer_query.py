# -*- coding: utf-8 -*-
import logging
from flask import jsonify, request
import flask_login
from server import app, mc, db
from server.auth import user_admin_mediacloud_client, user_name, user_has_auth_role, \
    is_user_logged_in, ROLE_MEDIA_EDIT
from server.util.request import form_fields_required, api_error_handler, arguments_required
from server.views.explorer import read_sample_searches
from operator import itemgetter

logger = logging.getLogger(__name__)


@app.route('/api/explorer/sample-searches', methods=['GET'])
@api_error_handler
def api_explorer_sample_searches():
    return read_sample_searches()


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
    return jsonify(source_list)


@app.route('/api/explorer/collections/list', methods=['GET'])
@flask_login.login_required
@arguments_required('collections[]')
@api_error_handler
def api_explorer_collections_by_ids():
    client_mc = user_admin_mediacloud_client()
    collection_ids = request.args['collections[]'].split(',')
    collection_list = []
    for tags_id in collection_ids:
        info = client_mc.tag(tags_id)
        info['id'] = int(tags_id)
        collection_list.append(info)
    return jsonify(collection_list)


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
        tags_id = tags_id.encode('ascii', 'ignore') # if empty, the unicode char will cause an error
        if len (tags_id) > 0:
            info = mc.tag(tags_id)
            info['id'] = tags_id
        # info['tag_set'] = _tag_set_info(mc, info['tag_sets_id'])
            coll_list.append(info)
    return jsonify(coll_list)


@app.route('/api/explorer/save-searches', methods=['GET'])
@flask_login.login_required
@arguments_required('queryName', 'timestamp', 'queryParams')
def save_user_search():
    username = user_name()
    db.add_item_to_users_list(username, 'searches', request.args)
    return jsonify({'savedQuery': request.args['queryName']})


@app.route('/api/explorer/load-user-searches', methods=['GET'])
@flask_login.login_required
def load_user_searches():
    username = user_name()
    search_list = db.get_users_lists(username, 'searches')
    return jsonify({'list': search_list})


@app.route('/api/explorer/delete-search', methods=['GET'])
@flask_login.login_required
@arguments_required('queryName', 'timestamp', 'queryParams')
def delete_user_search():
    username = user_name()
    result = db.remove_item_from_users_list(username, 'searches', {'timestamp': int(request.args['timestamp'])})
    return jsonify({'success': result.raw_result })


# TODO use this or the other collection list retrieval?
@app.route('/api/explorer/set/<tag_sets_id>', methods=['GET'])
@api_error_handler
def api_explorer_collection_set(tag_sets_id):
    '''
    Return a list of all the (public only or public and private, depending on user role) collections in a tag set.  Not cached because this can change, and load time isn't terrible.
    :param tag_sets_id: the tag set to query for public collections
    :return: dict of info and list of collections in
    '''
    info = []
    if is_user_logged_in() and user_has_auth_role(ROLE_MEDIA_EDIT) == True:
        info = _tag_set_with_private_collections(tag_sets_id)
    else:
        info = _tag_set_with_public_collections(tag_sets_id)

    #_add_user_favorite_flag_to_collections(info['collections'])
    return jsonify(info)


def _tag_set_with_collections(tag_sets_id, show_only_public_collections):

    # TODO use which mc or user_mc here
    tag_set = mc.tagSet(tag_sets_id)
    # page through tags
    more_tags = True
    all_tags = []
    last_tags_id = 0
    while more_tags:
        tags = mc.tagList(tag_sets_id=tag_set['tag_sets_id'], last_tags_id=last_tags_id, rows=100, public_only=show_only_public_collections)
        all_tags = all_tags + tags
        if len(tags) > 0:
            last_tags_id = tags[-1]['tags_id']
        more_tags = len(tags) != 0
    collection_list = [t for t in all_tags if t['show_on_media'] is 1]  # double check the show_on_media because that controls public or not
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


@app.route('/api/explorer/themes', methods=['POST'])
@flask_login.login_required
@form_fields_required('q')
@api_error_handler
def api_explorer_themes():
    return jsonify()

