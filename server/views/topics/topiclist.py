import flask_login
import logging
from flask import jsonify, request

from server import app, user_db, mc
from server.auth import user_mediacloud_client, user_name, user_admin_mediacloud_client, is_user_logged_in
from server.util.request import form_fields_required, arguments_required, api_error_handler

logger = logging.getLogger(__name__)


@app.route('/api/topics/search', methods=['GET'])
@flask_login.login_required
@arguments_required('searchStr')
@api_error_handler
def topic_search():
    search_str = request.args['searchStr']
    mode = request.args['mode'] if 'mode' in request.args else 'list'
    user_mc = user_admin_mediacloud_client()
    results = user_mc.topicList(name=search_str, limit=50)
    if mode == 'full':
        matching_topics = results['topics']
    else:
        # matching_topics = [{'name': x['name'], 'id': x['topics_id']} for x in results['topics']]
        matching_topics = results['topics']
    return jsonify({'topics': matching_topics})


@app.route('/api/topics/admin/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_admin_list():
    user_mc = user_admin_mediacloud_client()
    # if a non-admin user calls this, using user_mc grantees this won't be a security hole
    # but for admins this will return ALL topics
    topics = user_mc.topicList(limit=500)['topics']
    # we also want snapshot info
    # topics = _add_snapshots_info_to_topics(topics)
    topics = sorted(topics, key=lambda t: t['topics_id'], reverse=True)
    return jsonify(topics)


@app.route('/api/topics/favorites', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_favorites():
    user_mc = user_mediacloud_client()
    favorite_topic_ids = user_db.get_users_lists(user_name(), 'favoriteTopics')
    favorited_topics = [user_mc.topic(tid) for tid in favorite_topic_ids]
    for t in favorited_topics:
        t['isFavorite'] = True
    return jsonify({'topics': favorited_topics})


@app.route('/api/topics/queued-and-running', methods=['GET'])
@flask_login.login_required
@api_error_handler
def does_user_have_a_running_topic():
    user_mc = user_mediacloud_client()
    queued_and_running_topics = []
    more_topics = True
    link_id = None
    while more_topics:
        results = user_mc.topicList(link_id=link_id, limit=100)
        topics = results['topics']
        queued_and_running_topics += [t for t in topics if t['state'] in ['running', 'queued']
                                      and t['user_permission'] in ['admin']]
        more_topics = 'next' in results['link_ids']
        if more_topics:
            link_id = results['link_ids']['next']
    return jsonify(queued_and_running_topics)


@app.route('/api/topics/public', methods=['GET'])
@api_error_handler
def public_topics_list():
    public_topics = sorted_public_topic_list()
    if is_user_logged_in():
        public_topics = add_user_favorite_flag_to_topics(public_topics)
    return jsonify({"topics": public_topics})


def topics_user_owns(topics, user_email):
    # pull out just the topics this user has permissions for (ie. remove public ones)
    user_topics = []
    for t in topics:
        topic_users = [o['email'] for o in t['owners']]
        if user_email in topic_users:
            user_topics.append(t)
    return user_topics


@app.route('/api/topics/personal', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_personal():
    user_mc = user_mediacloud_client()
    link_id = request.args.get('linkId')
    results = user_mc.topicList(link_id=link_id, limit=1000)
    user_owned_topics = topics_user_owns(results['topics'], flask_login.current_user.profile['email'])
    results['topics'] = add_user_favorite_flag_to_topics(user_owned_topics)
    return jsonify(results)


@app.route('/api/topics/<topics_id>/favorite', methods=['PUT'])
@flask_login.login_required
@form_fields_required('favorite')
@api_error_handler
def topic_set_favorited(topics_id):
    favorite = int(request.form["favorite"])
    username = user_name()
    if favorite == 1:
        user_db.add_item_to_users_list(username, 'favoriteTopics', int(topics_id))
    else:
        user_db.remove_item_from_users_list(username, 'favoriteTopics', int(topics_id))
    return jsonify({'isFavorite': favorite == 1})


def sorted_public_topic_list():
    # needs to support logged in or not
    if is_user_logged_in():
        local_mc = user_mediacloud_client()
    else:
        local_mc = mc
    public_topics = local_mc.topicList(public=True, limit=51)['topics']
    return sorted(public_topics, key=lambda t: t['name'].lower())


def add_user_favorite_flag_to_topics(topics):
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteTopics')
    for t in topics:
        t['isFavorite'] = t['topics_id'] in user_favorited
    return topics
