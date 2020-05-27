import json
import logging

import flask_login
from flask import jsonify, request

import server.util.csv as csv
from server import app
from server.views import TAG_COUNT_DOWNLOAD_LENGTH
from server.util.request import api_error_handler
from server.util.tags import CLIFF_PEOPLE, CLIFF_ORGS, NYT_LABELS_TAG_SET_ID
from server.views.explorer import parse_query_with_keywords, file_name_for_download
import server.views.explorer.apicache as apicache

logger = logging.getLogger(__name__)

DEFAULT_DISPLAY_AMOUNT = 10

ENTITY_DOWNLOAD_COLUMNS = ['label', 'count', 'pct', 'sample_size','tags_id']


@app.route('/api/explorer/entities/people', methods=['POST'])
@flask_login.login_required
@api_error_handler
def top_entities_people():
    solr_q, solr_fq = parse_query_with_keywords(request.form)
    results = apicache.top_tags_with_coverage(solr_q, solr_fq, CLIFF_PEOPLE)
    return jsonify(results)


@app.route('/api/explorer/entities/organizations', methods=['POST'])
@flask_login.login_required
@api_error_handler
def top_entities_organizations():
    solr_q, solr_fq = parse_query_with_keywords(request.form)
    results = apicache.top_tags_with_coverage(solr_q, solr_fq, CLIFF_ORGS)
    return jsonify(results)


@app.route('/api/explorer/tags/<tag_sets_id>/top-tags.csv', methods=['POST'])
@api_error_handler
@flask_login.login_required
def explorer_entities_csv(tag_sets_id):
    tag_set = apicache.tag_set(tag_sets_id)
    filename = 'sampled-{}'.format(tag_set['label'])
    data = request.form
    query_object = json.loads(data['q'])
    solr_q, solr_fq = parse_query_with_keywords(query_object)
    filename = file_name_for_download(query_object['label'], filename)
    top_tag_counts = apicache.top_tags_with_coverage(solr_q, solr_fq, tag_sets_id, TAG_COUNT_DOWNLOAD_LENGTH)['results']
    return csv.stream_response(top_tag_counts, ENTITY_DOWNLOAD_COLUMNS, filename)


@app.route('/api/explorer/themes', methods=['POST'])
@flask_login.login_required
@api_error_handler
def top_themes():
    solr_q, solr_fq = parse_query_with_keywords(request.form)
    results = apicache.top_tags_with_coverage(solr_q, solr_fq, NYT_LABELS_TAG_SET_ID)

    return jsonify(results)


@app.route('/api/explorer/demo/themes', methods=['GET'])
@api_error_handler
def api_explorer_demo_top_themes():
    results = demo_top_tags_with_coverage(NYT_LABELS_TAG_SET_ID)
    return jsonify(results)
