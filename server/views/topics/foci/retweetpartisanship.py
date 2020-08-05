import logging
from flask import jsonify, request
import flask_login
import mediacloud.error

from server import app, TOOL_API_KEY
from server.util.request import api_error_handler, argument_is_valid, arguments_required, json_error_response, \
    form_fields_required
from server.views.topics.apicache import topic_story_count
from server.auth import user_mediacloud_key, user_mediacloud_client
from server.util.tags import tags_in_tag_set, TAG_SETS_ID_PARTISANSHIP_2016, \
    TAG_SETS_ID_PARTISANSHIP_2019, COLLECTION_SET_PARTISANSHIP_QUINTILES_2016, \
    COLLECTION_SET_PARTISANSHIP_QUINTILES_2019
from server.views.topics.foci import FOCAL_TECHNIQUE_BOOLEAN_QUERY

logger = logging.getLogger(__name__)

YEAR_2016 = "2016"
YEAR_2019 = "2019"
VALID_YEARS = [YEAR_2016, YEAR_2019]


@app.route('/api/topics/<topics_id>/focal-sets/retweet-partisanship/preview/story-counts', methods=['GET'])
@flask_login.login_required
@arguments_required('year')
@argument_is_valid('year', VALID_YEARS)
@api_error_handler
def retweet_partisanship_story_counts(topics_id):
    # TODO: add in overall timespan id here so it works in different snapshots
    tag_story_counts = []
    year = request.args['year']
    partisanship_tags = _cached_partisanship_tags(year)
    # grab the total stories
    try:
        total_stories = topic_story_count(user_mediacloud_key(), topics_id)['count']
    except mediacloud.error.MCException:
        total_stories = 0
    # make a count for each tag
    for tag in partisanship_tags:
        try:
            tagged_story_count = topic_story_count(user_mediacloud_key(), topics_id, q=tag['query'])['count']
            pct = float(tagged_story_count)/float(total_stories)
        except ZeroDivisionError:
            tagged_story_count = 0
            pct = 0
        except mediacloud.error.MCException:
            tagged_story_count = 0
            pct = 0
        tag_story_counts.append({
            'label': tag['label'],
            'tags_id': tag['tags_id'],
            'count': tagged_story_count,
            'pct': pct
        })
    # order them in the way a person would expect ( left to center to right)
    collection_set = {
        YEAR_2016: COLLECTION_SET_PARTISANSHIP_QUINTILES_2016,
        YEAR_2019: COLLECTION_SET_PARTISANSHIP_QUINTILES_2019
    }.get(year)
    ordered_tag_story_counts = list()
    for quintile in collection_set:
        ordered_tag_story_counts.append([t for t in tag_story_counts if t['tags_id'] == quintile][0])

    return jsonify({'story_counts': ordered_tag_story_counts})


@app.route('/api/topics/<topics_id>/focal-sets/retweet-partisanship/preview/coverage', methods=['GET'])
@flask_login.login_required
@arguments_required('year')
@argument_is_valid('year', VALID_YEARS)
@api_error_handler
def retweet_partisanship_coverage(topics_id):
    year = request.args['year']
    partisanship_tags = _cached_partisanship_tags(year)
    # grab the total stories
    try:
        total_stories = topic_story_count(user_mediacloud_key(), topics_id)['count']
    except mediacloud.error.MCException:
        total_stories = 0
    # count the stories in any media in tagged as partisan
    tags_ids = " ".join([str(t['tags_id']) for t in partisanship_tags])
    tags_ids_query_clause = "tags_id_media:({})".format(tags_ids)
    try:
        tagged_story_count = topic_story_count(user_mediacloud_key(), topics_id, q=tags_ids_query_clause)['count']
    except mediacloud.error.MCException:
        tagged_story_count = 0
    return jsonify({'counts': {'count': tagged_story_count, 'total': total_stories}})


def _get_tag_sets_id(year):
    return {
        YEAR_2016: TAG_SETS_ID_PARTISANSHIP_2016,
        YEAR_2019: TAG_SETS_ID_PARTISANSHIP_2019,
    }.get(year, None)


def _cached_partisanship_tags(year):
    tag_sets_id = _get_tag_sets_id(year)
    partisanship_tags = tags_in_tag_set(TOOL_API_KEY, tag_sets_id)
    for tag in partisanship_tags:
        tag['query'] = "tags_id_media:{}".format(tag['tags_id'])
    return partisanship_tags


@app.route('/api/topics/<topics_id>/focal-sets/retweet-partisanship/create', methods=['POST'])
@form_fields_required('focalSetName', 'focalSetDescription', 'year')
@flask_login.login_required
def create_retweet_partisanship_focal_set(topics_id):
    year = request.form['year']
    if year not in VALID_YEARS:
        return json_error_response('"{} is invalid.'.format(year))
    # grab the focalSetName and focalSetDescription and then make one
    focal_set_name = request.form['focalSetName']
    focal_set_description = request.form['focalSetDescription']
    return _add_retweet_partisanship_to_topic(topics_id, focal_set_name, focal_set_description, year)


def _add_retweet_partisanship_to_topic(topics_id, focal_set_name, focal_set_description, year):
    user_mc = user_mediacloud_client()
    focal_technique = FOCAL_TECHNIQUE_BOOLEAN_QUERY
    new_focal_set = user_mc.topicFocalSetDefinitionCreate(topics_id, focal_set_name, focal_set_description,
                                                          focal_technique)
    if 'focal_set_definitions_id' not in new_focal_set:
        return json_error_response('Unable to create the subtopic set')
    # now make the foci in it - one for each partisanship quintile
    partisanship_tags = _cached_partisanship_tags(year)
    for tag in partisanship_tags:
        name = tag['label']
        # TODO: needs updated description
        description = "Media sources that were retweeted more often during the {year} US election " \
                      "season by people on the {quintile}".format(year=year, quintile=tag['label'])
        query = tag['query']
        focal_set_definitions_id = new_focal_set['focal_set_definitions_id']
        # create a new boolean query subtopic based on the tag sets
        new_focus = user_mc.topicFocusDefinitionCreate(topics_id,
                                                       name=name, description=description, query=query,
                                                       focal_set_definitions_id=focal_set_definitions_id)
        if (len(new_focus) == 0) or ('focus_definitions_id' not in new_focus[0]):
            return json_error_response('Unable to create the {} subtopic'.format(name))
    return {'success': True}
