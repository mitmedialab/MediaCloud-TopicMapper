import logging
from flask import jsonify
import flask_login

from server import app
from server.auth import user_mediacloud_key
from server.util.tags import CLIFF_PEOPLE, CLIFF_ORGS, processed_for_entities_tag_ids
from server.util.request import api_error_handler
from server.views.topics.apicache import topic_tag_coverage, topic_tag_counts
import server.util.csv as csv

logger = logging.getLogger(__name__)

DEFAULT_DISPLAY_AMOUNT = 50

ENTITY_DOWNLOAD_COLUMNS = ['tags_id', 'label', 'count', 'pct']


def process_tags_for_coverage(topics_id, tag_counts):
    coverage = topic_tag_coverage(topics_id, processed_for_entities_tag_ids())
    top_tag_counts = tag_counts[:DEFAULT_DISPLAY_AMOUNT]
    for t in tag_counts:  # add in pct to ALL counts, not top, so CSV download can include them
        try:
            t['pct'] = float(t['count']) / float(coverage['counts']['count'])
        except ZeroDivisionError:
            t['pct'] = 0
    data = {
        'entities': top_tag_counts,
        'coverage': coverage['counts'],
    }
    return data


@app.route('/api/topics/<topics_id>/entities/people', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_top_people(topics_id):
    top_tag_counts = topic_tag_counts(user_mediacloud_key(), topics_id, CLIFF_PEOPLE)
    data = process_tags_for_coverage(topics_id, top_tag_counts)
    return jsonify(data)


@app.route('/api/topics/<topics_id>/entities/organizations', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_top_orgs(topics_id):
    top_tag_counts = topic_tag_counts(user_mediacloud_key(), topics_id, CLIFF_ORGS)
    data = process_tags_for_coverage(topics_id, top_tag_counts)
    return jsonify(data)


@app.route('/api/topics/<topics_id>/entities/<type_entity>/entities.csv', methods=['GET'])
@flask_login.login_required
def entities_csv(topics_id, type_entity):
    tag_type = CLIFF_PEOPLE if type_entity == 'people' else CLIFF_ORGS
    top_tag_counts = topic_tag_counts(user_mediacloud_key(), topics_id, tag_type)
    data = process_tags_for_coverage(topics_id, top_tag_counts)
    return csv.stream_response(data['entities'], ENTITY_DOWNLOAD_COLUMNS,
                               'topic-{}-entities-{}'.format(topics_id, type))
