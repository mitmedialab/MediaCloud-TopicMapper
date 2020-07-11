import requests
import os
import datetime as dt
from werkzeug.utils import secure_filename

from server import app


def save_file_to_upload_folder(file_to_save, filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
    # have to save b/c otherwise we can't locate the file path (security restriction)... can delete afterwards
    file_to_save.save(filepath)
    return filepath


def save_url_to_temp_file(remote_url: str) -> str:
    """
    Save the content at the URL to a local temp file.
    :param remote_url:
    :return: the local temp filepath
    """
    content_name = remote_url.rsplit('/', 1)[1]
    r = requests.get(remote_url, allow_redirects=True)
    filename = "{}-{}-{}".format(content_name, dt.datetime.now().strftime("%Y%m%d%H%M%S"),
                                 secure_filename("fetched-file"))
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    open(filepath, 'wb').write(r.content)
    return filepath


def read_content_from_file(local_path: str):
    return open(local_path, 'rb').read()
