import logging
from flask import jsonify, request

from server import app
import server.views.topics.apicache as apicache
from server.util.request import arguments_required, filters_from_args, api_error_handler

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/map-files/list', methods=['GET'])
@arguments_required('timespanId')
@api_error_handler
def map_files_list(topics_id):
    _snapshots_id, timespans_id, _foci_id, _q = filters_from_args(request.args)
    results = apicache.topic_media_map_list(topics_id, timespans_id)
    return jsonify(results)


@app.route('/api/topics/<topics_id>/timespan-files/list', methods=['GET'])
@arguments_required('timespanId')
@api_error_handler
def timespan_files_list(topics_id):
    _snapshots_id, timespans_id, _foci_id, _q = filters_from_args(request.args)
    results = apicache.topic_timespan_files_list(topics_id, timespans_id)
    return jsonify(results)
