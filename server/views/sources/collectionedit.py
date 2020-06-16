import logging
import flask_login
import time
from flask import request, jsonify, render_template
from mediacloud.tags import MediaTag, TAG_ACTION_ADD, TAG_ACTION_REMOVE
import csv as pycsv

from server import app, config, TOOL_API_KEY, executor
from server.auth import user_admin_mediacloud_client, user_mediacloud_key, user_name
from server.util.config import ConfigException
from server.util.csv import SOURCE_LIST_CSV_METADATA_PROPS
from server.util.file import save_file_to_upload_folder
from server.util.mail import send_html_email
from server.util.request import csv_required, form_fields_required, api_error_handler
from server.util.tags import VALID_METADATA_IDS, METADATA_PUB_COUNTRY_NAME, \
    tags_in_tag_set, media_with_tag
from server.util.stringutil import as_tag_name
from server.views.sources import SOURCE_LIST_CSV_EDIT_PROPS
import server.views.sources.apicache as apicache

logger = logging.getLogger(__name__)


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

    formatted_name = as_tag_name(label)

    source_ids = []
    if len(request.form['sources[]']) > 0:
        source_ids = [int(sid) for sid in request.form['sources[]'].split(',')]
    # first update the collection
    updated_collection = user_mc.updateTag(collection_id, formatted_name, label, description,
                                           is_static=(static == 'true'),
                                           show_on_stories=(show_on_stories == 'true'),
                                           show_on_media=(show_on_media == 'true'))
    # get the sources in the collection first, then remove and add as needed
    existing_source_ids = [int(m['media_id']) for m in media_with_tag(user_mediacloud_key(), collection_id)]
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
        apicache.invalidate_collection_source_representation_cache(user_mediacloud_key(), collection_id)
    return jsonify(updated_collection['tag'])


@app.route('/api/collections/<collection_id>/remove-sources', methods=['POST'])
@flask_login.login_required
@form_fields_required('sources[]')
@api_error_handler
def remove_sources_from_collection(collection_id):
    source_ids_to_remove = request.form['sources[]'].split(',')
    source_ids_to_remove = [int(s) for s in source_ids_to_remove]
    user_mc = user_admin_mediacloud_client()
    # get the sources in the collection first, then remove and add as needed
    existing_source_ids = [int(m['media_id']) for m in media_with_tag(user_mediacloud_key(), collection_id)]
    source_ids_to_remain = list(set(existing_source_ids) - set(source_ids_to_remove))

    media_to_remove = [MediaTag(sid, tags_id=collection_id, action=TAG_ACTION_REMOVE) for sid in source_ids_to_remove]
    media_to_remain = [MediaTag(sid, tags_id=collection_id, action=TAG_ACTION_ADD) for sid in
                       source_ids_to_remain]  # do I need to run similar or TAG_ACTION_REMOVE?
    current_media = media_to_remove + media_to_remain

    results = {}
    if len(current_media) > 0:
        results = user_mc.tagMedia(current_media)

    apicache.invalidate_collection_source_representation_cache(user_mediacloud_key(), collection_id)
    return jsonify(results)


@app.route('/api/collections/upload-sources', methods=['POST'])
@flask_login.login_required
@api_error_handler
@csv_required
def upload_file():
    time_start = time.time()
    uploaded_file = request.files['file']
    filepath = save_file_to_upload_folder(uploaded_file, uploaded_file.filename)
    time_file_saved = time.time()
    # parse all the source data out of the file
    try:
        sources_to_update, sources_to_create = _parse_sources_from_csv_upload(filepath)
    except Exception as e:
        logger.error("Couldn't process a CSV row: " + str(e))
        return jsonify({'status': 'Error', 'message': str(e)})

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
        try:
            mail_enabled = config.get('SMTP_ENABLED')
            if mail_enabled == u'1':
                _email_batch_source_update_results(audit)
        except ConfigException:
            logger.debug("Skipping collection file upload confirmation email")
        for media in all_results:
            if 'media_id' in media:
                media['media_id'] = int(
                    media['media_id'])  # make sure they are ints so no-dupes logic works on front end
        time_end = time.time()
        logger.debug("upload_file: {}".format(time_end - time_start))
        logger.debug("  save file: {}".format(time_file_saved - time_start))
        logger.debug("  processing: {}".format(time_end - time_file_saved))
        return jsonify({'results': all_results, 'status': "Success"})


def _parse_sources_from_csv_upload(filepath):
    acceptable_column_names = list(SOURCE_LIST_CSV_EDIT_PROPS)
    acceptable_column_names.remove('stories_per_day')
    acceptable_column_names.remove('first_story')
    with open(filepath, 'rU') as f:
        reader = pycsv.DictReader(f)
        reader.fieldnames = acceptable_column_names
        sources_to_create = []
        sources_to_update = []
        next(reader)   # skip column headers
        for line in reader:
            try:
                # python 2.7 csv module doesn't support unicode so have to do the decode/encode here for cleaned up val
                updated_src = line['media_id'] not in ['', None]
                # decode all keys as long as there is a key  re Unicode vs ascii
                newline = {k.lower(): v for k, v in list(line.items()) if k not in ['', None]}
                newline_no_empties = {k: v for k, v in list(newline.items()) if v not in ['', None]}
                empties = {k: v for k, v in list(newline.items()) if v in ['', None]}

                # source urls have to start with the http, so add it if the user didn't
                if newline_no_empties['url'][:7] not in ['http://', 'http://']\
                        and newline_no_empties['url'][:8] not in ['https://', 'https://']:
                    newline_no_empties['url'] = 'http://{}'.format(newline_no_empties['url'])

                # sources must have a name for updates
                if updated_src:
                    if 'name' not in newline_no_empties:
                        newline_no_empties.update(empties)
                        raise Exception("Missing name for source " + str(newline_no_empties['media_id'] + " " +
                                                                         str(newline_no_empties['url'])))
                    sources_to_update.append(newline_no_empties)
                else:
                    sources_to_create.append(newline_no_empties)
            except Exception as e:
                logger.error("Couldn't process a CSV row: " + str(e))
                raise Exception("Couldn't process a CSV row: " + str(e))

        return sources_to_update, sources_to_create


def _update_source_worker2(source_info):
    # worker function to help update sources NOT in parallel
    user_mc = user_admin_mediacloud_client()
    media_id = source_info['media_id']
    # logger.debug("Updating media {}".format(media_id))
    source_no_metadata_no_id = {k: v for k, v in list(source_info.items()) if k != 'media_id'
                                and k not in SOURCE_LIST_CSV_METADATA_PROPS}
    response = user_mc.mediaUpdate(media_id, source_no_metadata_no_id)
    return response


@executor.job
def _update_source_job(source_info):
    # worker function to help update sources in parallel
    user_mc = user_admin_mediacloud_client()
    media_id = source_info['media_id']
    logger.debug("Updating media {}".format(media_id))
    source_no_metadata_no_id = {k: v for k, v in list(source_info.items()) if k != 'media_id'
                                and k not in SOURCE_LIST_CSV_METADATA_PROPS}
    response = user_mc.mediaUpdate(media_id, source_no_metadata_no_id)
    source_info['response'] = response
    return source_info


@executor.job
def _create_media_job(media_list):
    user_mc = user_admin_mediacloud_client()
    return user_mc.mediaCreate(media_list)


def _create_or_update_sources(source_list_from_csv, create_new):
    time_start = time.time()
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
                {k: v for k, v in list(src.items()) if k not in SOURCE_LIST_CSV_METADATA_PROPS})
        # parallelize media creation to make it faster
        chunk_size = 5  # @ 10, each call takes over a minute; @ 5 each takes around ~40 secs
        media_to_create_batches = [sources_to_create_no_metadata[x:x + chunk_size]
                                   for x in range(0, len(sources_to_create_no_metadata), chunk_size)]
        creation_batched_responses = _create_media_job.map(media_to_create_batches)
        creation_responses = []
        for responses in creation_batched_responses:
            creation_responses = creation_responses + responses
        # now group creation attempts by outcome
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
        sources_to_update = _update_source_job.map(sources_to_update)
        for m in sources_to_update:
            response = m['response']
            src['status'] = 'existing' if response['success'] == 1 else 'error'
            src['status_message'] = 'unable to update existing source' if \
                response['success'] == 0 else 'updated existing source'
            if response['success'] == 1:
                successful.append(src)
            else:
                errors.append(src)
            results.append(src)

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
        return results, list(info_by_url.values()), errors

    # if a successful update, just return what we have, success
    update_metadata_for_sources(successful)
    time_end = time.time()
    logger.debug("    time_create_update: {}".format(time_end - time_start))
    logger.debug("      info: {}".format(time_info - time_start))
    logger.debug("      metadata: {}".format(time_end - time_info))
    return results, successful, errors


def _email_batch_source_update_results(audit_feedback):
    email_title = "Source Batch Updates"
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
@executor.job
def _tag_media_job(tags):
    user_mc = user_admin_mediacloud_client()
    user_mc.tagMedia(tags=tags, clear_others=True)  # make sure to clear any other values set in this metadata tag set


# this only adds/replaces metadata with values (does not remove)
def update_metadata_for_sources(source_list):
    tags = []
    for m in VALID_METADATA_IDS:
        mid = list(m.values())[0]
        mkey = list(m.keys())[0]
        tag_codes = tags_in_tag_set(TOOL_API_KEY, mid)
        for source in source_list:
            if mkey in source:
                metadata_tag_name = source[mkey]
                if metadata_tag_name not in ['', None]:
                    # hack until we have a better match check
                    if mkey == METADATA_PUB_COUNTRY_NAME:  # template pub_###
                        matching = [t for t in tag_codes if t['tag'] == 'pub_' + metadata_tag_name]
                    else:
                        matching = [t for t in tag_codes if t['tag'] == metadata_tag_name]

                    if matching and matching not in ['', None]:
                        metadata_tag_id = matching[0]['tags_id']
                        logger.debug('found metadata to add %s', metadata_tag_id)
                        tags.append(MediaTag(source['media_id'], tags_id=metadata_tag_id, action=TAG_ACTION_ADD))
    # now do all the tags in parallel batches so it happens quickly
    if len(tags) > 0:
        chunks = [tags[x:x + 50] for x in range(0, len(tags), 50)]  # do 50 tags in each request
        _tag_media_job.map(chunks)
