import logging
from flask import jsonify, request
import flask_login
import datetime as dt
import requests
from werkzeug.utils import secure_filename
import os

from server import app
from server.util.request import form_fields_required, json_error_response
from server.views.sources.collection import allowed_file

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/platforms/generic-csv/upload', methods=['POST'])
@flask_login.login_required
def platform_generic_upload_csv(topics_id):
    """
    Handle an uploaded CSV file by saving it into a temp dir and returning the temp dir to the client.
    That filename will then be relayed back to the server to support preview operations.
    :param topics_id:
    :return:
    """
    if 'file' not in request.files:
        return json_error_response('No file uploaded')
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return json_error_response('No file found in uploads')
    if not(uploaded_file and allowed_file(uploaded_file.filename)):
        return json_error_response('Invalid file')
    filename = "{}-{}-{}".format(topics_id, dt.datetime.now().strftime("%Y%m%d%H%M%S"),
                                 secure_filename(uploaded_file.filename))
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    # have to save b/c otherwise we can't locate the file path (security restriction)... can delete afterwards
    uploaded_file.save(filepath)
    return jsonify({'status': 'Success', 'filename': filename})
