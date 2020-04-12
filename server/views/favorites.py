import logging
from flask import jsonify
import flask_login
from server import app, user_db
from server.util.request import api_error_handler
from server.auth import user_mediacloud_client, user_name

logger = logging.getLogger(__name__)


def add_user_favorite_flag_to_sources(sources):
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteSources')
    for s in sources:
        s['isFavorite'] = int(s['media_id']) in user_favorited
    return sources


def add_user_favorite_flag_to_collections(collections):
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteCollections')
    for c in collections:
        c['isFavorite'] = int(c['tags_id']) in user_favorited
    return collections


@app.route('/api/favorites/collections', methods=['GET'])
@flask_login.login_required
@api_error_handler
def favorite_collections():
    user_mc = user_mediacloud_client()
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteCollections')
    favorited_collections = [user_mc.tag(tag_id) for tag_id in user_favorited]
    for s in favorited_collections:
        s['isFavorite'] = True
    return jsonify({'list': favorited_collections})


@app.route('/api/favorites/sources', methods=['GET'])
@flask_login.login_required
@api_error_handler
def favorite_sources():
    user_mc = user_mediacloud_client()
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteSources')
    favorited_s = [user_mc.media(media_id) for media_id in user_favorited]
    for s in favorited_s:
        s['isFavorite'] = True
    return jsonify({'list': favorited_s})
