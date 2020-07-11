import logging
from flask import jsonify, request
import flask_login

from server import app
from server.util.request import form_fields_required, api_error_handler
from server.auth import user_admin_mediacloud_client, user_mediacloud_client
from server.views.topics import concatenate_query_for_solr, _parse_collection_ids, _parse_media_ids

logger = logging.getLogger(__name__)

NEW_FOCAL_SET_PLACEHOLDER_ID = -1


@app.route('/api/topics/<topics_id>/focus-definitions/update-or-create', methods=['POST'])
@form_fields_required('focusName', 'focusDescription')
@flask_login.login_required
@api_error_handler
def topic_focus_definition_update_or_create(topics_id):
    user_mc = user_mediacloud_client()
    name = request.form['focusName']
    description = request.form['focusDescription']
    q = request.form['keywords'] if 'keywords' in request.form else ''
    collections = _parse_collection_ids(request.form)
    sources = _parse_media_ids(request.form)
    # update if it has an id, create if new
    if 'foci_id' in request.form:
        # for editing, the media ids come in through the keywords parameter
        # you can't change the focal set a focus is in
        foci_id = request.form['foci_id']
        focus = user_mc.topicFocusDefinitionUpdate(topics_id, foci_id, name=name, description=description,
                                                   query=q)
    else:
        # respect option for media and sources
        if (sources not in [None, ''] and len(sources) > 0) or (collections not in [None, ''] and len(collections) > 0):
            query = concatenate_query_for_solr(q, sources, collections)
        else:
            query = q

        if int(request.form['focalSetDefinitionId']) is NEW_FOCAL_SET_PLACEHOLDER_ID:
            fs_name = request.form['focalSetName']
            fs_description = request.form['focalSetDescription']
            new_focal_set = user_mc.topicFocalSetDefinitionCreate(topics_id, fs_name, fs_description, 'Boolean Query')
            focal_set_definitions_id = new_focal_set['focal_set_definitions_id']
        else:
            focal_set_definitions_id = request.form['focalSetDefinitionId']
        # create focus, pointing at focal set
        focus = user_mc.topicFocusDefinitionCreate(topics_id, name=name, description=description,
                                                   query=query, focal_set_definitions_id=focal_set_definitions_id)
    return jsonify(focus)


@app.route('/api/topics/<topics_id>/focus-definitions/<foci_definition_id>/delete', methods=['DELETE'])
@flask_login.login_required
@api_error_handler
def topic_focus_definition_delete(topics_id, foci_definition_id):
    user_mc = user_admin_mediacloud_client()
    results = user_mc.topicFocusDefinitionDelete(topics_id, foci_definition_id)
    return jsonify(results)
