import logging
from flask import jsonify, request
import flask_login
import mediacloud.error

from server import app, mc
from server.auth import user_mediacloud_client
from server.util.tags import COLLECTION_US_TOP_ONLINE
from server.util.request import form_fields_required, api_error_handler, json_error_response, arguments_required

from server.views.topics.topic import topic_summary

logger = logging.getLogger(__name__)
VERSION_1 = 1


@app.route('/api/topics/create', methods=['PUT'])
@flask_login.login_required
@form_fields_required('name', 'description', 'solr_seed_query', 'start_date', 'end_date')
@api_error_handler
def topic_create():
    user_mc = user_mediacloud_client()
    name = request.form['name']
    description = request.form['description']
    solr_seed_query = request.form['solr_seed_query']
    start_date = request.form['start_date']
    end_date = request.form['end_date']
    optional_args = {
        'max_iterations': request.form['max_iterations'] if 'max_iterations' in request.form and request.form['max_iterations'] != 'null' else None,
        'max_stories': request.form['max_stories'] if 'max_stories' in request.form and request.form['max_stories'] != 'null' else flask_login.current_user.profile['limits']['max_topic_stories'],
    }
    try:
        topic_result = user_mc.topicCreate(name=name, description=description, solr_seed_query=solr_seed_query,
                                           start_date=start_date, end_date=end_date,
                                           media_tags_ids=[COLLECTION_US_TOP_ONLINE],  # HACK: can't save without one of these in place (for now)
                                           **optional_args,
                                           )['topics'][0]
        topics_id = topic_result['topics_id']
        logger.info("Created new topic \"{}\" as {}".format(name, topics_id))
        # if this includes any of the US-centric collections, add the retweet partisanship subtopic by default
        # client will either make a empty snapshot, or a spidering one
        return topic_summary(topics_id)
    except mediacloud.error.MCException as e:
        logging.error("Topic creation failed {}".format(name))
        logging.exception(e)
        return json_error_response(e.message, e.status_code)
    except Exception as e:
        logging.error("Topic creation failed {}".format(name))
        logging.exception(e)
        return json_error_response(str(e), 500)


@app.route('/api/topics/name-exists', methods=['GET'])
@flask_login.login_required
@arguments_required('searchStr')
@api_error_handler
def topic_name_exists():
    # Check if topic with name exists already
    # Have to do this in a unique method, instead of in topic_search because we need to use an admin connection
    # to media cloud to list all topics, but we don't want to return topics a user can't see to them.
    # :return: boolean indicating if topic with this name exists for not (case insensive check)
    search_str = request.args['searchStr']
    topics_id = int(request.args['topicId']) if 'topicId' in request.args else None
    matching_topics = mc.topicList(name=search_str, limit=15)
    if topics_id:
        matching_topic_names = [t['name'].lower().strip() for t in matching_topics['topics']
                                if t['topics_id'] != topics_id]
    else:
        matching_topic_names = [t['name'].lower().strip() for t in matching_topics['topics']]
    name_in_use = search_str.lower() in matching_topic_names
    return jsonify({'nameInUse': name_in_use})
