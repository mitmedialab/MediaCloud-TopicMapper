import flask_login
import logging
from flask import jsonify, request

from server import app, user_db
from server.auth import user_mediacloud_client, user_name, user_admin_mediacloud_client,\
    user_is_admin
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
    # save a costly set of paging queries when the user is admin
    if user_is_admin():
        return jsonify([])
    # non-admin, so do the real check
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


def topics_user_can_access(topics, user_email, is_admin):
    # we can't see all the permissions for a topic in topicList results, so we have to use some guesses here.
    # pull out just the topics this user has permissions for (ie. remove public ones they don't own)
    user_topics = []
    for t in topics:
        user_is_owner = user_email in [o['email'] for o in t['owners']]
        # admins can see all topics, so to make this more manageable only show admins ones they own
        ok_to_show = user_is_owner if is_admin else user_is_owner or (not t['is_public'])
        if ok_to_show:
            user_topics.append(t)
    return user_topics


@app.route('/api/topics/personal', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_personal():
    user_mc = user_mediacloud_client()
    link_id = request.args.get('linkId')
    results = user_mc.topicList(link_id=link_id, limit=1000)
    user_accessible_topics = topics_user_can_access(results['topics'], flask_login.current_user.profile['email'],
                                                    user_is_admin())
    # update this in place so the results['link_ids'] don't change (for paging support)
    results['topics'] = add_user_favorite_flag_to_topics(user_accessible_topics)
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


def add_user_favorite_flag_to_topics(topics):
    user_favorited = user_db.get_users_lists(user_name(), 'favoriteTopics')
    for t in topics:
        t['isFavorite'] = t['topics_id'] in user_favorited
    return topics
