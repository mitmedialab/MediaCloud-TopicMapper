import logging
from flask import jsonify, request
import flask_login

from server import app
from server.views import TAG_COUNT_SAMPLE_SIZE
from server.util.request import api_error_handler, json_error_response, form_fields_required, arguments_required
from server.views.topics.apicache import topic_story_count
from server.auth import user_mediacloud_key, user_mediacloud_client
from server.views.topics.apicache import topic_tag_coverage, _cached_topic_tag_counts, cached_topic_timespan_list
from server.views.topics.foci import FOCAL_TECHNIQUE_BOOLEAN_QUERY
from server.util.tags import NYT_LABELS_TAG_SET_ID
import json

logger = logging.getLogger(__name__)


def get_top_themes_by_story_tag_counts(topics_id, num_themes):
    nyt_counts = []

    #get overall timespan
    timespans = cached_topic_timespan_list(topics_id)
    overall_timespan = [t for t in timespans if t['period'] == "overall"]
    overall_timespan = next(iter(overall_timespan))
    timespan_query = "timespans_id:{}".format(overall_timespan['timespans_id'])

    # get the top themes by the story counts iwth overall timespan
    top_nyt_tags = _cached_topic_tag_counts(user_mediacloud_key(), topics_id, NYT_LABELS_TAG_SET_ID, timespan_query)
    # get the total stories for a topic
    total_stories = topic_story_count(user_mediacloud_key(), topics_id)['count']

    top_nyt_tags = top_nyt_tags[:num_themes]
    # for each country, set up the requisite info for UI
    for tag in top_nyt_tags:
        nyt_counts.append({
            'label': tag['label'],
            'geo_tag': tag['tag'],
            'tags_id': tag['tags_id'],
            'count': tag['count'],
            'pct': float(tag['count']) / float(total_stories), #story_tag_count / total story per topic count
        })

    return nyt_counts


@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/preview/story-counts', methods=['GET'])
@flask_login.login_required
@arguments_required('numThemes')
@api_error_handler
def nyt_theme_story_counts(topics_id):
    num_themes = int(request.args['numThemes'])
    return jsonify({'story_counts': get_top_themes_by_story_tag_counts(topics_id, num_themes)})


@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/preview/coverage', methods=['GET'])
@flask_login.login_required
@arguments_required('numThemes')
@api_error_handler
def nyt_theme_coverage(topics_id):
    num_themes = int(request.args['numThemes'])

    nyt_top_themes = get_top_themes_by_story_tag_counts(topics_id, num_themes)
    tag_list = [i['tags_id'] for i in nyt_top_themes]
    query_nyt_tags = "({})".format(" ".join(map(str, tag_list)))
    coverage = topic_tag_coverage(topics_id, query_nyt_tags)   # gets count and total

    if coverage is None:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})
    return jsonify(coverage)


@app.route('/api/topics/<topics_id>/focal-sets/nyt-theme/create', methods=['POST'])
@form_fields_required('focalSetName', 'focalSetDescription', 'data[]')
@flask_login.login_required
def create_nyt_theme_focal_set(topics_id):
    user_mc = user_mediacloud_client()

    # grab the focalSetName and focalSetDescription and then make one
    focal_set_name = request.form['focalSetName']
    focal_set_description = request.form['focalSetDescription']
    theme_data= json.loads(request.form['data[]'])
    focal_technique = FOCAL_TECHNIQUE_BOOLEAN_QUERY # is this right?
    new_focal_set = user_mc.topicFocalSetDefinitionCreate(topics_id, focal_set_name, focal_set_description, focal_technique)
    if 'focal_set_definitions_id' not in new_focal_set:
        return json_error_response('Unable to create the subtopic set')
    # now make the foci in it - one for each country
    for tag in theme_data:
        params = {
            'name': tag['label'],
            'description': "Stories about {}".format(tag['label']),
            'query': "tags_id_stories:{}".format(tag['tags_id']) ,
            'focal_set_definitions_id' : new_focal_set['focal_set_definitions_id'],
        }
        user_mc = user_mediacloud_client()
        user_mc.topicFocusDefinitionCreate(topics_id, **params)

    return {'success': True}
