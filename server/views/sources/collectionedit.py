import logging
import os
import flask_login
import time
from flask import request, jsonify, render_template
from mediacloud.tags import MediaTag, TAG_ACTION_ADD, TAG_ACTION_REMOVE
from server.util.mail import send_html_email
from werkzeug.utils import secure_filename
import csv as pycsv
from multiprocessing import Pool

from server import app, settings
from server.auth import user_admin_mediacloud_client, user_mediacloud_key, user_name
from server.util.request import json_error_response, form_fields_required, api_error_handler
from server.views.sources.collection import collection_media_list, allowed_file
from server.views.sources import COLLECTIONS_TEMPLATE_PROPS_EDIT, COLLECTIONS_TEMPLATE_METADATA_PROPS
from server.util.tags import VALID_METADATA_IDS, METADATA_PUB_STATE_NAME, METADATA_PUB_COUNTRY_NAME, format_name_from_label
from server.views.sources.metadata import cached_tags_in_tag_set

logger = logging.getLogger(__name__)

MEDIA_UPDATE_POOL_SIZE = 15  # number of parallel processes to use while batch updating media sources
MEDIA_METADATA_UPDATE_POOL_SIZE = 10  # number of parallel processes to use while batch updating media metadata

@app.route('/api/collections/<collection_id>/update', methods=['POST'])
@form_fields_required('name', 'description')
@flask_login.login_required
@api_error_handler
def collection_update(collection_id):
    user_mc = user_admin_mediacloud_client()
    label = '{}'.format(request.form['name'])
    description = request.form['description']
    static = request.form['static'] if 'static' in request.form else None
    show_on_stories = request.form['showOnStories'] if 'showOnStories' in request.form else None
    show_on_media = request.form['showOnMedia'] if 'showOnMedia' in request.form else None

    formatted_name = format_name_from_label(label)

    source_ids = []
    if len(request.form['sources[]']) > 0:
        source_ids = [int(sid) for sid in request.form['sources[]'].split(',')]
    # first update the collection
    updated_collection = user_mc.updateTag(collection_id, formatted_name, label, description,
                                           is_static=(static == 'true'),
                                           show_on_stories=(show_on_stories == 'true'),
                                           show_on_media=(show_on_media == 'true'))
    # get the sources in the collection first, then remove and add as needed
    existing_source_ids = [int(m['media_id']) for m in collection_media_list(user_mediacloud_key(), collection_id)]
    source_ids_to_remove = list(set(existing_source_ids) - set(source_ids))
    source_ids_to_add = [sid for sid in source_ids if sid not in existing_source_ids]
    # logger.debug(existing_source_ids)
    # logger.debug(source_ids_to_add)
    # logger.debug(source_ids_to_remove)
    # then go through and tag all the sources specified with the new collection id
    tags_to_add = [MediaTag(sid, tags_id=collection_id, action=TAG_ACTION_ADD) for sid in source_ids_to_add]
    tags_to_remove = [MediaTag(sid, tags_id=collection_id, action=TAG_ACTION_REMOVE) for sid in source_ids_to_remove]
    tags = tags_to_add + tags_to_remove
    if len(tags) > 0:
        user_mc.tagMedia(tags)
    return jsonify(updated_collection['tag'])


@app.route('/api/collections/upload-sources', methods=['POST'])
@flask_login.login_required
@api_error_handler
def upload_file():
    time_start = time.time()
    # grab and verify the file
    if 'file' not in request.files:
        return json_error_response('No file part')
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return json_error_response('No selected file')
    if not(uploaded_file and allowed_file(uploaded_file.filename)):
        return json_error_response('Invalid file')
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(uploaded_file.filename))
    # have to save b/c otherwise we can't locate the file path (security restriction)... can delete afterwards
    uploaded_file.save(filepath)
    time_file_saved = time.time()
    # parse all the source data out of the file
    sources_to_update, sources_to_create = _parse_sources_from_csv_upload(filepath)
    all_results = []
    all_errors = []
    if len(sources_to_create) > 300:
        return jsonify({'status': 'Error', 'message': 'Too many sources to upload. The limit is 300.'})
    else:
        audit = []
        if len(sources_to_create) > 0:
            audit_results, successful, errors = _create_or_update_sources(sources_to_create, True)
            all_results += successful
            audit += audit_results
            all_errors += errors
        if len(sources_to_update) > 0:
            audit_results, successful, errors = _create_or_update_sources(sources_to_update, False)
            all_results += successful
            audit += audit_results
            all_errors += errors
        if settings.has_option('smtp', 'enabled'):
            mail_enabled = settings.get('smtp', 'enabled')
            if mail_enabled is '1':
                _email_batch_source_update_results(audit)
        for media in all_results:
            if 'media_id' in media:
                media['media_id'] = int(
                    media['media_id'])  # make sure they are ints so no-dupes logic works on front end
        time_end = time.time()
        logger.debug("upload_file: {}".format(time_end - time_start))
        logger.debug("  save file: {}".format(time_file_saved - time_start))
        logger.debug("  processing: {}".format(time_end - time_file_saved))
        return jsonify({'results': all_results})


def _parse_sources_from_csv_upload(filepath):
    acceptable_column_names = COLLECTIONS_TEMPLATE_PROPS_EDIT
    with open(filepath, 'rU') as f:
        reader = pycsv.DictReader(f)
        reader.fieldnames = acceptable_column_names
        sources_to_create = []
        sources_to_update = []
        reader.next()   # skip column headers
        for line in reader:
            try:
                # python 2.7 csv module doesn't support unicode so have to do the decode/encode here for cleaned up val
                updatedSrc = line['media_id'] not in ['', None]
                # decode all keys as long as there is a key  re Unicode vs ascii
                newline = {k.decode('utf-8', errors='replace').encode('ascii', errors='ignore').lower(): v for
                           k, v in line.items() if k not in ['', None]}
                newline_decoded = {k: v.decode('utf-8', errors='replace').encode('ascii', errors='ignore') for
                                   k, v in newline.items() if v not in ['', None]}
                empties = {k: v for k, v in newline.items() if v in ['', None]}

                if updatedSrc:
                    newline_decoded.update(empties)
                    sources_to_update.append(newline_decoded)
                else:
                    sources_to_create.append(newline_decoded)
            except Exception as e:
                    logger.error("Couldn't process a CSV row: " + str(e))
                    raise Exception("couldn't process a CSV row: " + str(e))

        return sources_to_update, sources_to_create


# worker function to help update sources in parallel
def _update_source_worker(source_info):
    user_mc = user_admin_mediacloud_client()
    media_id = source_info['media_id']
    # logger.debug("Updating media {}".format(media_id))
    source_no_metadata_no_id = {k: v for k, v in source_info.items() if k != 'media_id'
                         and k not in COLLECTIONS_TEMPLATE_METADATA_PROPS}
    response = user_mc.mediaUpdate(media_id, source_no_metadata_no_id)
    return response


def _create_or_update_sources(source_list_from_csv, create_new):
    time_start = time.time()
    user_mc = user_admin_mediacloud_client()
    successful = []
    errors = []
    # logger.debug("@@@@@@@@@@@@@@@@@@@@@@")
    # logger.debug("going to create or update these sources%s", source_list_from_csv)

    # first split the list into the difference operations to perform so we can parallelize
    results = []
    sources_to_create = []
    sources_to_update = []
    for src in source_list_from_csv:
        if create_new:
            sources_to_create.append(src)
        else:
            sources_to_update.append(src)
    # process all the entries we think are creations in one batch call
    if len(sources_to_create) > 0:
        # remove metadata so they don't save badly (will do metadata later)
        sources_to_create_no_metadata = []
        for src in sources_to_create:
            sources_to_create_no_metadata.append(
                {k: v for k, v in src.items() if k not in COLLECTIONS_TEMPLATE_METADATA_PROPS})
        creation_responses = user_mc.mediaCreate(sources_to_create_no_metadata)
        for idx, response in enumerate(creation_responses):
            src = sources_to_create[idx]
            src['status'] = 'found and updated this source' if response['status'] == 'existing' else response['status']
            src['media_id'] = response['media_id'] if 'media_id' in response else None
            src['name'] = response['url']
            if 'error' in response:
                src['status_message'] = response['error']
            else:
                src['status_message'] = src['status']
            if response['status'] != 'error':
                successful.append(src)
            else:
                errors.append(src)
            results.append(src)
    # process all the entries we think are updates in parallel so it happens quickly
    if len(sources_to_update) > 0:
        pool = Pool(processes=MEDIA_UPDATE_POOL_SIZE)    # process updates in parallel with worker function
        update_responses = pool.map(_update_source_worker, sources_to_update)  # blocks until they are all done
        for idx, response in enumerate(update_responses):
            src = sources_to_update[idx]
            src['status'] = 'existing' if response['success'] == 1 else 'error'
            src['status_message'] = 'unable to update existing source' if \
                response['success'] == 0 else 'updated existing source'
            if response['success'] == 1:
                successful.append(src)
            else:
                errors.append(src)
            results.append(src)
        pool.terminate()  # extra safe garbage collection

    time_info = time.time()
    # logger.debug("successful :  %s", successful)
    # logger.debug("errors :  %s", errors)
    # for new sources we have status, media_id, url, error in result, merge with source_list so we have
    # metadata and the fields we need for the return
    if create_new:
        info_by_url = {source['url']: source for source in successful}
        for source in source_list_from_csv:
            if source['url'] in info_by_url:
                info_by_url[source['url']].update(source)
        update_metadata_for_sources(info_by_url)
        return results, info_by_url.values(), errors

    # if a successful update, just return what we have, success
    update_metadata_for_sources(successful)
    time_end = time.time()
    logger.debug("    time_create_update: {}".format(time_end - time_start))
    logger.debug("      info: {}".format(time_info - time_start))
    logger.debug("      metadata: {}".format(time_end - time_info))
    return results, successful, errors


def _email_batch_source_update_results(audit_feedback):
    email_title = "Source Batch Updates "
    content_title = "You just uploaded {} sources to a collection.".format(len(audit_feedback))
    updated_sources = []
    for updated in audit_feedback:
        updated_sources.append(updated)

    content_body = updated_sources
    action_text = "Login to Media Cloud"
    action_url = "https://sources.mediacloud.org/#/login"
    # send an email confirmation
    send_html_email(email_title,
                    [user_name(), 'noreply@mediacloud.org'],
                    render_template("emails/source_batch_upload_ack.txt",
                                    content_title=content_title, content_body=content_body, action_text=action_text,
                                    action_url=action_url),
                    render_template("emails/source_batch_upload_ack.html",
                                    email_title=email_title, content_title=content_title, content_body=content_body,
                                    action_text=action_text, action_url=action_url)
                    )


# worker for process pool to send tags requests in parallel
def _tag_media_worker(tags):
    user_mc = user_admin_mediacloud_client()
    user_mc.tagMedia(tags=tags, clear_others=True)  # make sure to clear any other values set in this metadata tag set


# this only adds/replaces metadata with values (does not remove)
def update_metadata_for_sources(source_list):
    tags = []
    for m in VALID_METADATA_IDS:
        mid = m.values()[0]
        mkey = m.keys()[0]
        tag_codes = cached_tags_in_tag_set(mid)
        for source in source_list:
            if mkey in source:
                metadata_tag_name = source[mkey]
                if metadata_tag_name not in ['', None]:
                    # hack until we have a better match check
                    matching = []
                    if mkey == METADATA_PUB_COUNTRY_NAME:  # template pub_###
                        matching = [t for t in tag_codes if t['tag'] == 'pub_' + metadata_tag_name]
                    elif mkey == METADATA_PUB_STATE_NAME:  # template ###_##
                        matching = [t for t in tag_codes if t['tag'] == metadata_tag_name]

                    if matching and matching not in ['', None]:
                        metadata_tag_id = matching[0]['tags_id']
                        logger.debug('found metadata to add %s', metadata_tag_id)
                        tags.append(MediaTag(source['media_id'], tags_id=metadata_tag_id, action=TAG_ACTION_ADD))
    # now do all the tags in parallel batches so it happens quickly
    if len(tags) > 0:
        chunks = [tags[x:x + 50] for x in xrange(0, len(tags), 50)]  # do 50 tags in each request
        pool = Pool(processes=MEDIA_METADATA_UPDATE_POOL_SIZE )  # process updates in parallel with worker function
        pool.map(_tag_media_worker, chunks)  # blocks until they are all done
        pool.terminate()  # extra safe garbage collection
