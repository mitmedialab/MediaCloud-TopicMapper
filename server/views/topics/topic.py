import logging
import flask_login
import mediacloud.error
from flask import jsonify, request
from operator import itemgetter

import server.views.apicache as shared_apicache
import server.views.topics.apicache as apicache
from server import app, mc, executor
from server.auth import user_mediacloud_key, user_mediacloud_client, is_user_logged_in
from server.util.request import api_error_handler, filters_from_args
from server.views.topics import concatenate_solr_dates
from server.views.media_picker import concatenate_query_for_solr
from server.views.topics.topiclist import add_user_favorite_flag_to_topics
from server.views.topics.platforms.platforms_manage import platform_for_web_seed_query, topic_has_seed_query

logger = logging.getLogger(__name__)

ARRAY_BASE_ONE = 1


def _topic_seed_story_count(topic):
    try:
        seed_query_count = shared_apicache.story_count(
            q=concatenate_query_for_solr(solr_seed_query=topic['solr_seed_query'],
                                         media_ids=[m['media_id'] for m in topic['media'] if 'media_id' in m],
                                         tags_ids=[t['tags_id'] for t in topic['media_tags'] if 'tags_id' in t]),
            fq=concatenate_solr_dates(start_date=topic['start_date'], end_date=topic['end_date'])
        )['count']
    except mediacloud.error.MCException:
        # the query syntax is wrong (perhaps pre-story-level search)
        seed_query_count = None
    return seed_query_count


@app.route('/api/topics/<topics_id>/summary', methods=['GET'])
@api_error_handler
def topic_summary(topics_id):
    topic = _topic_summary(topics_id)
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
    return [item for item in _snapshot_foci_count_job.map(jobs)]


def _topic_snapshot_list(topic):
    local_mc = user_mediacloud_client()
    api_key = user_mediacloud_key()
    snapshots = local_mc.topicSnapshotList(topic['topics_id'])
    snapshots = sorted(snapshots, key=itemgetter('snapshots_id'))
    # add in any missing version numbers
    for idx in range(0, len(snapshots)):
        if snapshots[idx]['note'] in [None, '']:
            snapshots[idx]['note'] = idx + ARRAY_BASE_ONE
    # format any web seed queries as platforms objects
    for s in snapshots:
        platforms = []
        if (s['seed_queries'] is not None) and ('topic' in s['seed_queries']):
            p = platform_for_web_seed_query(s['seed_queries'])
            platforms.append(p)
            platforms += s['seed_queries']['topic_seed_queries']
        else:
            if topic_has_seed_query(topic):
                p = platform_for_web_seed_query(topic)
                platforms.append(p)
        s['platform_seed_queries'] = platforms
    # add foci_count for display
    snapshots = _add_snapshot_foci_count(api_key, topic['topics_id'], snapshots)
    snapshots = sorted(snapshots, key=lambda d: d['snapshot_date'])
    # extra stuff
    snapshot_status = mc.topicSnapshotGenerateStatus(topic['topics_id'])['job_states']  # need to know if one is running
    latest = snapshots[-1] if len(snapshots) > 0 else None
    topic['seed_query_story_count'] = _topic_seed_story_count(topic)
    return {
        'list': snapshots,
        'jobStatus': snapshot_status,
        'latestVersion': latest['note'] if latest else 1,
    }


def _topic_summary(topics_id):
    local_mc = user_mediacloud_client()
    topic = local_mc.topic(topics_id)
    # add in snapshot list (with version numbers, by date)
    topic['snapshots'] = _topic_snapshot_list(topic)
    # add in fake topic_seed_query for web/mediacloud platform
    if topic_has_seed_query(topic):
        p = platform_for_web_seed_query(topic)
        topic['topic_seed_queries'].append(p)
    if is_user_logged_in():
        add_user_favorite_flag_to_topics([topic])
    return topic


@app.route('/api/topics/<topics_id>/snapshots/<snapshots_id>/timespans/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_timespan_list(topics_id, snapshots_id):
    ignored_snapshots_id, _timespans_id, foci_id, _q = filters_from_args(request.args)
    timespans = apicache.cached_topic_timespan_list(topics_id, snapshots_id, foci_id)
    # add the focal_set type to the timespan so we can use that in the client (ie. decide what to show or not
    # based on what type of focal_set this timespan is part of)
    focal_sets = apicache.topic_focal_sets_list(user_mediacloud_key(), topics_id, snapshots_id)
    for t in timespans:
        for fs in focal_sets:
            for f in fs['foci']:
                if f['foci_id'] == t['foci_id']:
                    t['focal_set'] = fs
                    t['focus'] = f
                    break
    return jsonify({'list': timespans})


@app.route('/api/topics/<topics_id>/update-settings', methods=['PUT'])
@flask_login.login_required
@api_error_handler
def topic_update_settings(topics_id):
    user_mc = user_mediacloud_client()
    args = {
        'name': _safe_member_of_dict('name', request.form),
        'description': _safe_member_of_dict('description', request.form),
        'is_logogram': _safe_member_of_dict('is_logogram', request.form),
        'start_date': _safe_member_of_dict('start_date', request.form),
        'end_date': _safe_member_of_dict('end_date', request.form),
        'max_iterations': _safe_member_of_dict('max_iterations', request.form),
        'max_stories': _safe_member_of_dict('max_topic_stories', request.form),
    }
    result = user_mc.topicUpdate(topics_id, **args)
    return topic_summary(result['topics'][0]['topics_id'])  # give them back new data, so they can update the client


def _safe_member_of_dict(key, a_dict):
    return a_dict[key] if key in a_dict else None
