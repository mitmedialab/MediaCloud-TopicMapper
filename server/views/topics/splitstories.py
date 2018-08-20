import logging
from operator import itemgetter
from flask import jsonify, request
import flask_login

from server import app, TOOL_API_KEY
import server.util.csv as csv
from server.util.request import filters_from_args, api_error_handler, json_error_response
from server.auth import user_mediacloud_key, is_user_logged_in
import server.views.topics.apicache as apicache
from server.views.topics import access_public_topic
from server.util.stringutil import trimSolrDate

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/split-story/count', methods=['GET'])
@api_error_handler
def topic_split_story_count(topics_id):
    if access_public_topic(topics_id):
        results = apicache.topic_split_story_counts(TOOL_API_KEY, topics_id, snapshots_id=None, timespans_id=None, foci_id=None,q=None)
    elif is_user_logged_in():
        results = apicache.topic_split_story_counts(user_mediacloud_key(), topics_id)
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})

    return jsonify({'results': results})


@app.route('/api/topics/<topics_id>/split-story/count.csv', methods=['GET'])
@flask_login.login_required
def topic_story_count_csv(topics_id):
    return stream_topic_split_story_counts_csv(user_mediacloud_key(), 'splitStoryCounts-Topic-' + topics_id, topics_id)


def stream_topic_split_story_counts_csv(user_mc_key, filename, topics_id, **kwargs):
    results = apicache.topic_split_story_counts(user_mc_key, topics_id, **kwargs)
    clean_results = [{'date': trimSolrDate(item['date']), 'stories': item['count']} for item in results['counts']]
    sorted_results = sorted(clean_results, key=itemgetter('date'))
    props = ['date', 'stories']
    return csv.stream_response(sorted_results, props, filename)


@app.route('/api/topics/<topics_id>/split-story/focal-set/<focal_sets_id>/count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_focal_set_split_stories_compare(topics_id, focal_sets_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    # need the timespan info, to find the appropriate timespan with each focus
    base_snapshot_timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id=snapshots_id)
    # if they have a focus selected, we need to find the appropriate overall timespan
    if foci_id is not None:
        timespan = apicache.topic_timespan(topics_id, snapshots_id, foci_id, timespans_id)
        for t in base_snapshot_timespans:
            if apicache.is_timespans_match(timespan, t):
                base_timespan = t
    else:
        base_timespan = None
        for t in base_snapshot_timespans:
            if t['timespans_id'] == int(timespans_id):
                base_timespan = t
                logger.info('base timespan = %s', timespans_id)
    if base_timespan is None:
        return json_error_response("Couldn't find the timespan you specified")
    # iterate through to find the one of interest
    focal_set = apicache.topic_focal_set(user_mediacloud_key(), topics_id, snapshots_id, focal_sets_id)
    if focal_set is None:
        return json_error_response('Invalid Focal Set Id')
    # collect the story split counts for each foci
    timespans = apicache.matching_timespans_in_foci(topics_id, base_timespan, focal_set['foci'])
    for idx in range(0, len(timespans)):
        data = apicache.topic_split_story_counts(user_mediacloud_key(), topics_id, snapshots_id=snapshots_id,
                                                 timespans_id=timespans[idx]['timespans_id'])
        focal_set['foci'][idx]['split_story_counts'] = data
    return jsonify(focal_set)

