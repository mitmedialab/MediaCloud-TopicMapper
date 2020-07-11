import logging
from flask import jsonify, request
import flask_login
import datetime as dt
from werkzeug.utils import secure_filename

from server import app
from server.util.request import csv_required
from server.util.file import save_file_to_upload_folder

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/platforms/generic-csv/upload', methods=['POST'])
@flask_login.login_required
@csv_required
def platform_generic_upload_csv(topics_id):
    """
    Handle an uploaded CSV file by saving it into a temp dir and returning the temp dir to the client.
    That filename will then be relayed back to the server to support preview operations.
    :param topics_id:
    :return:
    """
    uploaded_file = request.files['file']
    filename = "{}-{}-{}".format(topics_id, dt.datetime.now().strftime("%Y%m%d%H%M%S"),
                                 secure_filename(uploaded_file.filename))
    save_file_to_upload_folder(uploaded_file, filename)
    return jsonify({'status': 'Success', 'filename': filename})
