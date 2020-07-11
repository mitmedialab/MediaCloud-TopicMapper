import logging
from flask import jsonify
import os
import json

from server import app, data_dir
import server.views.apicache as base_apicache
from server.util.request import api_error_handler

logger = logging.getLogger(__name__)


@app.route('/api/system-stats', methods=['GET'])
@api_error_handler
def stats():
    return jsonify({'stats': base_apicache.stats()})


@app.route('/api/release-notes', methods=['GET'])
@api_error_handler
def release_notes():
    # needed to put this behind an endpoint so browser doesn't cache it
    release_history = json.load(open(os.path.join(data_dir, 'release_history.json'), 'r'))
    return jsonify(release_history)
