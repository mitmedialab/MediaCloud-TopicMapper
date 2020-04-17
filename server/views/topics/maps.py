import logging
import flask
from flask import jsonify, request
import requests

from server import app
import server.util.file as file_util
import server.views.topics.apicache as apicache
from server.util.request import arguments_required, filters_from_args, api_error_handler

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/map-files/list', methods=['GET'])
@arguments_required('timespanId')
@api_error_handler
def map_files_list(topics_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    results = apicache.topic_media_map_list(topics_id, timespans_id)
    return jsonify(results)


@app.route('/api/topics/<topics_id>/map-files/<timespan_maps_id>', methods=['GET'])
@arguments_required('timespanId')
@api_error_handler
def map_file(topics_id, timespan_maps_id):
    """
    The map files are actually stored on S3.  We proxy this through out server, rather than directly making a call to
    the S3 URL, in order to be flexible and to get the mimetype correct.
    :param topics_id:
    :param timespan_maps_id:
    :return:
    """
    as_attachment = False if ('download' in request.args) and (request.args['download'] == '0') else True
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    map_file_list = apicache.topic_media_map_list(topics_id, timespans_id)['timespan_maps']
    requested_file = [f for f in map_file_list if f['timespan_maps_id'] == int(timespan_maps_id)][0]
    file_format = requested_file['format']
    local_file_path = file_util.save_url_to_temp_file(requested_file['url'])
    content = file_util.read_content_from_file(local_file_path)
    # for direct download we should download the raw content
    filename = "{}-{}-link-map-{}.{}".format(topics_id, timespans_id, timespan_maps_id, file_format)
    mimetype = "image/svg+xml" if file_format == 'svg' else "text/xml"
    headers = {"Content-Disposition": "attachment;filename=" + filename} if as_attachment else None
    return flask.Response(content, mimetype=mimetype, headers=headers)
