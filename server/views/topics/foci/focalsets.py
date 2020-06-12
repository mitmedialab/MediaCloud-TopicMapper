import logging
from flask import jsonify, request
import flask_login

from server import app
from server.util.request import arguments_required, api_error_handler, filters_from_args, json_error_response
from server.auth import user_mediacloud_client, user_mediacloud_key
from server.views.topics import apicache as apicache

logger = logging.getLogger(__name__)

URL_SHARING_FOCAL_SET_NAME = "URL Sharing"


def is_url_sharing_focal_set(fs):
    return fs['name'] == URL_SHARING_FOCAL_SET_NAME


@app.route('/api/topics/<topics_id>/focal-sets/list', methods=['GET'])
@arguments_required('snapshotId')
@flask_login.login_required
@api_error_handler
def topic_focal_set_list(topics_id):
    snapshots_id, _timespans_id, _foci_id, _q = filters_from_args(request.args)
    include_story_counts = request.args.get('includeStoryCounts')
    focal_sets = apicache.topic_focal_sets_list(user_mediacloud_key(), topics_id, snapshots_id)
    # now mark the ones that are the magically added URL sharing platform ones
    for fs in focal_sets:
        fs['is_url_sharing'] = is_url_sharing_focal_set(fs)
    if include_story_counts and (include_story_counts == u'1'):
        _add_story_counts_to_foci(topics_id, focal_sets)
    return jsonify(focal_sets)


@app.route('/api/topics/<topics_id>/focal-set-definitions/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_focal_set_definitions_list(topics_id):
    user_mc = user_mediacloud_client()
    definitions = user_mc.topicFocalSetDefinitionList(topics_id)
    return jsonify(definitions)


@app.route('/api/topics/<topics_id>/focal-set-definitions/<focal_set_definitions_id>/delete', methods=['DELETE'])
@flask_login.login_required
@api_error_handler
def topic_focal_set_definition_delete(topics_id, focal_set_definitions_id):
    user_mc = user_mediacloud_client()
    # to be extra safe, first delete all the foci_defs inside it
    definitions = user_mc.topicFocalSetDefinitionList(topics_id)
    for focal_set_def in definitions:
        if focal_set_def['focal_set_definitions_id'] == int(focal_set_definitions_id):
            if 'focus_definitions' in focal_set_def: # be careful - the set could be empty!
                for focus_def in focal_set_def['focus_definitions']:
                    user_mc.topicFocalSetDefinitionDelete(topics_id, str(focus_def['focus_definitions_id']))
    # now delete the set def itself
    results = user_mc.topicFocalSetDefinitionDelete(topics_id, focal_set_definitions_id)
    return jsonify(results)


def base_snapshot_timespan(topics_id):
    # find the timespan matching this one in the base snapshot (ie. with no foci_id)
    snapshots_id, timespans_id, foci_id, _q = filters_from_args(request.args)
    base_snapshot_timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id,
                                                                  snapshots_id=snapshots_id, foci_id=None)
    timespan = apicache.topic_timespan(topics_id, snapshots_id, foci_id, timespans_id)  # the selected timespan
    for t in base_snapshot_timespans:
        if apicache.is_timespans_match(timespan, t):
            return t
    raise ValueError("Can't find a timespan in the base snapshot matching the one specified")


@app.route('/api/topics/<topics_id>/focal-set/<focal_sets_id>/split-story-count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_focal_set_split_stories_compare(topics_id, focal_sets_id):
    snapshots_id, _timespans_id, _foci_id, _q = filters_from_args(request.args)
    # need the timespan info, to find the appropriate timespan with each focus
    try:
        base_timespan = base_snapshot_timespan(topics_id)
        focal_set = apicache.topic_focal_set(user_mediacloud_key(), topics_id, snapshots_id, focal_sets_id)
    except ValueError as e:
        return json_error_response(str(e))
    # collect the story split counts for each foci
    timespans = apicache.matching_timespans_in_foci(topics_id, base_timespan, focal_set['foci'])
    for idx in range(0, len(timespans)):
        data = apicache.topic_split_story_counts(user_mediacloud_key(), topics_id, snapshots_id=snapshots_id,
                                                 timespans_id=timespans[idx]['timespans_id'])
        focal_set['foci'][idx]['split_story_counts'] = data
    return jsonify(focal_set)


def _add_story_counts_to_foci(topics_id, focal_sets):
    snapshots_id, _timespans_id, _foci_id, q = filters_from_args(request.args)
    # need the timespan info, to find the appropriate timespan with each focus
    try:
        base_timespan = base_snapshot_timespan(topics_id)
    except ValueError as e:
        return json_error_response(str(e))
    # now find the story count in each foci in this
    for fs in focal_sets:
        timespans = apicache.matching_timespans_in_foci(topics_id, base_timespan, fs['foci'])
        for idx in range(0, len(timespans)):
            timespan = timespans[idx]
            focus = fs['foci'][idx]
            foci_story_count = apicache.topic_story_count(user_mediacloud_key(), topics_id,
                                                          snapshots_id=snapshots_id,
                                                          timespans_id=timespan['timespans_id'],
                                                          q=q,
                                                          foci_id=focus['foci_id'])['count']
            focus['story_count'] = foci_story_count
    return jsonify(focal_sets)
