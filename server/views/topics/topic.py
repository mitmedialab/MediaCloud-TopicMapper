import logging
import flask_login
import mediacloud.error
from flask import jsonify, request
from operator import itemgetter

import server.views.apicache as shared_apicache
import server.views.topics.apicache as apicache
from server import app, mc, executor, TOOL_API_KEY
from server.auth import user_mediacloud_key, user_mediacloud_client, is_user_logged_in
from server.util.request import api_error_handler
from server.views.topics import access_public_topic
from server.views.topics import concatenate_query_for_solr, concatenate_solr_dates
from server.views.topics.topiclist import add_user_favorite_flag_to_topics

logger = logging.getLogger(__name__)

ARRAY_BASE_ONE = 1


def _topic_seed_story_count(topic):
    try:
        if access_public_topic(topic['topics_id']):
            api_key = TOOL_API_KEY
        else:
            api_key = user_mediacloud_key()
        seed_query_count = shared_apicache.story_count(
            api_key,
            q=concatenate_query_for_solr(solr_seed_query=topic['solr_seed_query'],
                                         media_ids=[m['media_id'] for m in topic['media']],
                                         tags_ids=[t['tags_id'] for t in topic['media_tags']]),
            fq=concatenate_solr_dates(start_date=topic['start_date'], end_date=topic['end_date'])
        )['count']
    except mediacloud.error.MCException:
        # the query syntax is wrong (perhaps pre-story-level search
        seed_query_count = None
    return seed_query_count


@app.route('/api/topics/<topics_id>/summary', methods=['GET'])
@api_error_handler
def topic_summary(topics_id):
    topic = _topic_summary(topics_id)
    topic['seed_query_story_count'] = _topic_seed_story_count(topic)
    return jsonify(topic)


@executor.job
def _snapshot_foci_count_job(job):
    snapshot = job['snapshot']
    # add in the number of focal sets
    focal_sets = apicache.topic_focal_sets_list(job['user_mc_key'], job['topics_id'], snapshot['snapshots_id'])
    foci_count = sum([len(fs['foci']) for fs in focal_sets])
    snapshot['foci_count'] = foci_count
    snapshot['foci_names'] = [{
        'focal_set_name': fs['name'],
        'foci_names': [f['name'] for f in fs['foci']]
    } for fs in focal_sets ]
    return snapshot


def _add_snapshot_foci_count(api_key, topics_id, snapshots):
    jobs = []
    for s in snapshots:
        job = {
            'topics_id': topics_id,
            'user_mc_key': api_key,
            'snapshot': s,
        }
        jobs.append(job)
    snapshots = _snapshot_foci_count_job.map(jobs)
    return snapshots


def _topic_snapshot_list(topic):
    if access_public_topic(topic['topics_id']):
        local_mc = mc
        api_key = TOOL_API_KEY
    elif is_user_logged_in():
        local_mc = user_mediacloud_client()
        api_key = user_mediacloud_key()
    else:
        return {}  # prob something smarter we can do here
    snapshots = local_mc.topicSnapshotList(topic['topics_id'])
    snapshots = sorted(snapshots, key=itemgetter('snapshots_id'))
    # add in any missing version numbers
    for idx in range(0, len(snapshots)):
        if snapshots[idx]['note'] in [None, '']:
            snapshots[idx]['note'] = idx + ARRAY_BASE_ONE
    # seed_query story count
    topic['seed_query_story_count'] = _topic_seed_story_count(topic)
    # add foci_count for display
    snapshots = _add_snapshot_foci_count(api_key, topic['topics_id'], snapshots)
    snapshots = sorted(snapshots, key=lambda d: d['snapshot_date'])
    # extra stuff
    snapshot_status = mc.topicSnapshotGenerateStatus(topic['topics_id'])['job_states']  # need to know if one is running
    latest = snapshots[-1] if len(snapshots) > 0 else None
    return {
        'list': snapshots,
        'jobStatus': snapshot_status,
        'latestVersion': latest['note'] if latest else 1,
    }


def _topic_summary(topics_id):
    if access_public_topic(topics_id):
        local_mc = mc
    elif is_user_logged_in():
        local_mc = user_mediacloud_client()
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})
    topic = local_mc.topic(topics_id)
    # add in snapshot list (with version numbers, by date)
    topic['snapshots'] = _topic_snapshot_list(topic)
    if is_user_logged_in():
        add_user_favorite_flag_to_topics([topic])
    return topic


@app.route('/api/topics/<topics_id>/snapshots/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_snapshots_list(topics_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    snapshots = _topic_snapshot_list(topic)
    return jsonify(snapshots)


@app.route('/api/topics/<topics_id>/snapshots/<snapshots_id>/timespans/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_timespan_list(topics_id, snapshots_id):
    foci_id = request.args.get('focusId')
    timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id, foci_id)
    return jsonify({'list': timespans})


@app.route('/api/topics/<topics_id>/update-settings', methods=['PUT'])
@flask_login.login_required
@api_error_handler
def topic_update_settings(topics_id):
    user_mc = user_mediacloud_client()
    args = {
        'name': request.form['name'] if 'name' in request.form else None,
        'description': request.form['description'] if 'description' in request.form else None,
        'is_public': request.form['is_public'] if 'is_public' in request.form else None,
        'is_logogram': request.form['is_logogram'] if 'is_logogram' in request.form else None,
    }
    result = user_mc.topicUpdate(topics_id, **args)
    return topic_summary(result['topics'][0]['topics_id'])  # give them back new data, so they can update the client
