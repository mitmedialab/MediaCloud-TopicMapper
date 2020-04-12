import logging
from functools import wraps
from flask import jsonify, request

from mediacloud.error import MCException

logger = logging.getLogger(__name__)


def validate_params_exist(form, params):
    for param in params:
        if param not in form:
            raise ValueError('Missing required value for '+param)


def json_error_response(message, status_code=400):
    response = jsonify({
        'statusCode': status_code,
        'message': message,
    })
    response.status_code = status_code
    return response


def filters_from_args(request_args):
    """
    Helper to centralize reading filters from url params
    """
    timespans_id = request_args['timespanId'] if 'timespanId' in request_args else None
    snapshots_id = request_args['snapshotId'] if 'snapshotId' in request_args else None
    foci_id = request_args['focusId'] if 'focusId' in request_args else None
    q = request_args['q'] if ('q' in request_args) and (request_args['q'] != 'undefined') else None
    return snapshots_id, timespans_id, foci_id, q


def arguments_required(*expected_args):
    '''
    Handy decorator for ensuring that request params exist
    '''
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                logger.debug(request.args)
                validate_params_exist(request.args, expected_args)
                return func(*args, **kwargs)
            except ValueError as e:
                logger.exception("Missing a required arg")
                return json_error_response(e.args[0])
        return wrapper
    return decorator


def form_fields_required(*expected_form_fields):
    '''
    Handy decorator for ensuring that the form has the fields you need
    '''
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                logger.debug(request.form)
                validate_params_exist(request.form, expected_form_fields)
                return func(*args, **kwargs)
            except ValueError as e:
                logger.exception("Missing a required form field")
                return json_error_response(e.args[0])
        return wrapper
    return decorator


def api_error_handler(func):
    '''
    Handy decorator that catches any exception from the Media Cloud API and
    sends it back to the browser as a nicely formatted JSON error.  The idea is
    that the client code can catch these at a low level and display error messages.
    '''
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except MCException as e:
            logger.exception(e)
            return json_error_response(e.message, e.status_code)
    return wrapper
