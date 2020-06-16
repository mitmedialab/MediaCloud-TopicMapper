import logging
from operator import itemgetter
import flask_login
import os
from flask import jsonify, request
from mediacloud.tags import MediaTag, TAG_ACTION_ADD

import server.util.csv as csv
from server import app, mc, user_db, analytics_db, executor
from server.auth import user_mediacloud_key, user_admin_mediacloud_client, user_mediacloud_client, user_name,\
    user_has_auth_role, ROLE_MEDIA_EDIT
from server.util.request import arguments_required, form_fields_required, api_error_handler
from server.util.tags import TAG_SETS_ID_COLLECTIONS, media_with_tag
from server.util.stringutil import as_tag_name
from server.views.sources import SOURCE_LIST_CSV_EDIT_PROPS, SOURCE_FEED_LIST_CSV_PROPS
from server.views.sources.feeds import source_feed_list
from server.views.favorites import add_user_favorite_flag_to_collections, add_user_favorite_flag_to_sources
from server.views.stories import QUERY_LAST_YEAR
import server.views.sources.apicache as apicache

logger = logging.getLogger(__name__)


@app.route('/api/collections/<collection_id>/metadatacoverage.csv')
@flask_login.login_required
@api_error_handler
def api_metadata_download(collection_id):
    all_media = media_with_tag(user_mediacloud_key(), collection_id)

    metadata_counts = {}  # from tag_sets_id to info
    for media_source in all_media:
        for metadata_label, info in media_source['metadata'].items():
            if metadata_label not in metadata_counts:  # lazily populate counts
                metadata_counts[metadata_label] = {
                    'metadataCoverage': metadata_label,
                    'tagged': 0
                }
            if info is not None:
                metadata_counts[metadata_label]['tagged'] += 1

    for item_info in list(metadata_counts.values()):
        temp = len(all_media) - item_info['tagged']
        item_info.update({'notTagged': temp})

    props = ['metadataCoverage', 'tagged', 'notTagged']
    filename = "metadataCoverageForCollection" + collection_id + ".csv"
    return csv.stream_response(list(metadata_counts.values()), props, filename,
                               ['metadata category', 'sources with info', 'sources missing info'])


@app.route('/api/collection/set/geo-by-country', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_set_geo():
    return app.send_static_file(os.path.join('data', 'country-collections.json'))


@app.route('/api/collections/set/<tag_sets_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_set(tag_sets_id):
    """
    Return a list of all the (public only or public and private, depending on user role) collections in a tag set.
    Not cached because this can change, and load time isn't terrible.
    :param tag_sets_id: the tag set to query for public collections
    :return: dict of info and list of collections in
    """
    if user_has_auth_role(ROLE_MEDIA_EDIT):
        info = apicache.tag_set_with_private_collections(user_mediacloud_key(), tag_sets_id)
    else:
        info = apicache.tag_set_with_public_collections(user_mediacloud_key(), tag_sets_id)

    add_user_favorite_flag_to_collections(info['tags'])
    # rename to make more sense here
    for t in info['tags']:
        t['sort_key'] = t['label'] if t['label'] else t['tag']
    info['collections'] = sorted(info['tags'], key=itemgetter('sort_key'))
    del info['tags']
    return jsonify(info)


# seems that this should have a better name- it's getting a list of sources given a list of collections...
@app.route('/api/collections/list', methods=['GET'])
@arguments_required('coll[]')
@flask_login.login_required
@api_error_handler
def api_collections_by_ids():
    collection_ids = request.args['coll[]'].split(',')
    sources_list = []
    for tags_id in collection_ids:
        all_media = media_with_tag(user_mediacloud_key(), tags_id)
        info = [{'media_id': m['media_id'], 'name': m['name'], 'url': m['url'], 'public_notes': m['public_notes']} for m
                in all_media]
        add_user_favorite_flag_to_sources(info)
        sources_list += info
    return jsonify({'results': sources_list})


@app.route('/api/collections/featured', methods=['GET'])
@api_error_handler
def api_featured_collections():
    featured_collections = apicache.featured_collections()
    return jsonify({'results': featured_collections})


@app.route('/api/collections/<collection_id>/favorite', methods=['PUT'])
@flask_login.login_required
@form_fields_required('favorite')
@api_error_handler
def collection_set_favorited(collection_id):
    favorite = request.form["favorite"]
    username = user_name()
    if int(favorite) == 1:
        user_db.add_item_to_users_list(username, 'favoriteCollections', int(collection_id))
    else:
        user_db.remove_item_from_users_list(username, 'favoriteCollections', int(collection_id))
    return jsonify({'isFavorite': favorite})


@app.route('/api/collections/<collection_id>/details')
@flask_login.login_required
@api_error_handler
def api_collection_details(collection_id):
    add_in_sources = False
    if ('getSources' in request.args) and (request.args['getSources'] == 'true'):
        add_in_sources = True

    user_mc = user_mediacloud_client()
    info = user_mc.tag(collection_id)
    add_user_favorite_flag_to_collections([info])
    info['id'] = collection_id
    info['tag_set'] = _tag_set_info(user_mediacloud_key(), info['tag_sets_id'])
    if add_in_sources:
        media_in_collection = media_with_tag(user_mediacloud_key(), collection_id)
        info['sources'] = media_in_collection
    analytics_db.increment_count(analytics_db.TYPE_COLLECTION, collection_id, analytics_db.ACTION_SOURCE_MGR_VIEW)
    return jsonify({'results': info})


@app.route('/api/collections/<collection_id>/sources')
@flask_login.login_required
@api_error_handler
def api_collection_sources(collection_id):
    int(collection_id)
    results = {
        'tags_id': collection_id
    }
    media_in_collection = media_with_tag(user_mediacloud_key(), collection_id)
    add_user_favorite_flag_to_sources(media_in_collection)
    results['sources'] = media_in_collection
    return jsonify(results)


@app.route('/api/template/sources.csv')
@flask_login.login_required
@api_error_handler
def api_download_sources_template():
    filename = "media cloud collection upload template.csv"

    what_type_download = SOURCE_LIST_CSV_EDIT_PROPS

    return csv.stream_response(what_type_download, what_type_download, filename)


@app.route('/api/collections/<collection_id>/sources.csv')
@flask_login.login_required
@api_error_handler
def api_collection_sources_csv(collection_id):
    user_mc = user_mediacloud_client()
    collection = user_mc.tag(collection_id)    # not cached because props can change often
    all_media = media_with_tag(user_mediacloud_key(), collection_id)
    file_prefix = "Collection {} ({}) - sources ".format(collection_id, collection['tag'])
    properties_to_include = SOURCE_LIST_CSV_EDIT_PROPS
    return csv.download_media_csv(all_media, file_prefix, properties_to_include)


@app.route('/api/collections/<collection_id>/sources/<source_type>.csv')
@flask_login.login_required
@api_error_handler
def api_collection_sources_feed_status_csv(collection_id, source_type):
    user_mc = user_mediacloud_client()
    collection = user_mc.tag(collection_id)
    list_type = str(source_type).lower()
    media_in_collection = media_with_tag(user_mediacloud_key(), collection_id)
    media_info_in_collection = _media_list_edit_job.map(media_in_collection)
    if list_type == 'review':
        filtered_media = [m for m in media_info_in_collection
                          if m['active_feed_count'] > 0 and m['num_stories_90'] == 0 and m['num_stories_last_year'] > 0]
    elif list_type == 'remove':
        filtered_media = [m for m in media_info_in_collection
                          if m['active_feed_count'] > 0 and m['num_stories_90'] == 0
                          and m['num_stories_last_year'] == 0 and m['latest_scrape_job.state'] == 'failed']
    elif list_type == 'unscrapeable':
        filtered_media = [m for m in media_info_in_collection
                          if m['active_feed_count'] == 0 and m['num_stories_90'] > 0]
    elif list_type == 'working':
        filtered_media = [m for m in media_info_in_collection
                          if m['active_feed_count'] > 0 and m['num_stories_last_year'] > 0]
    else:
        filtered_media = media_info_in_collection
    file_prefix = "Collection {} ({}) - sources feed {}".format(collection_id, collection['tag'], source_type)
    properties_to_include = SOURCE_FEED_LIST_CSV_PROPS
    return csv.download_media_csv(filtered_media, file_prefix, properties_to_include)


@executor.job
def _media_list_edit_job(media):
    user_mc = user_admin_mediacloud_client()
    # latest scrape job
    scrape_jobs = user_mc.feedsScrapeStatus(media['media_id'])
    latest_scrape_job = None
    if len(scrape_jobs['job_states']) > 0:
        latest_scrape_job = scrape_jobs['job_states'][0]
    # active feed count
    feeds = source_feed_list(media['media_id'])
    active_syndicated_feeds = [f for f in feeds if f['active'] and f['type'] == 'syndicated']
    active_feed_count = len(active_syndicated_feeds)
    query = "media_id:{}".format(media['media_id'])
    full_count = apicache.timeperiod_story_count(user_mc, query, QUERY_LAST_YEAR)['count']
    # add the details to the media object and return it
    media['latest_scrape_job'] = latest_scrape_job
    media['active_feed_count'] = active_feed_count
    media['num_stories_last_year'] = full_count
    return media


@app.route('/api/collections/<collection_id>/sources/story-split/historical-counts')
@flask_login.login_required
@api_error_handler
def collection_source_story_split_historical_counts(collection_id):
    # need to turn the generator into objects before returning to json
    results = [r for r in _collection_source_story_split_historical_counts(collection_id)]
    return jsonify({'counts': results})


@app.route('/api/collections/<collection_id>/sources/story-split/historical-counts.csv')
@flask_login.login_required
@api_error_handler
def collection_source_story_split_historical_counts_csv(collection_id):
    results = _collection_source_story_split_historical_counts(collection_id)
    date_cols = None

    source_list = []
    for source in results:
        if date_cols is None:
            date_cols = sorted([s['date'] for s in source['splits_over_time']])
        for day in source['splits_over_time']:
            source[day['date']] = day['count']
        del source['splits_over_time']
        source_list.append(source)

    props = ['media_id', 'media_name', 'media_url', 'total_stories', 'splits_over_time'] + date_cols
    filename = "{} - source content count".format(collection_id)

    return csv.stream_response(source_list, props, filename)


@executor.job
def _source_story_split_count_job(info):
    source = info['media']
    q = "media_id:{}".format(source['media_id'])
    split_stories = apicache.split_story_count(user_mediacloud_key(), q, 360)
    source_data = {
        'media_id': source['media_id'],
        'media_name': source['name'],
        'media_url': source['url'],
        'total_story_count': split_stories['total_story_count'],
        'splits_over_time': split_stories['counts'],
    }
    return source_data


def _collection_source_story_split_historical_counts(collection_id):
    media_list = media_with_tag(user_mediacloud_key(), collection_id)
    jobs = [{'media': m} for m in media_list]
    # fetch in parallel to make things faster
    #return [_source_story_split_count_job(j) for j in jobs]
    # make sure to execute the generator so what is returned is real data
    return [d for d in _source_story_split_count_job.map(jobs)]


def _tag_set_info(user_mc_key, tag_sets_id):
    user_mc = user_mediacloud_client()
    return user_mc.tagSet(tag_sets_id)


@app.route('/api/collections/<collection_id>/sources/representation', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_source_representation(collection_id):
    source_representation = apicache.collection_source_representation(user_mediacloud_key(), collection_id,
                                                                      sample_size=500,
                                                                      fq="publish_date:[NOW-90DAY TO NOW]")
    return jsonify({'sources': source_representation})


@app.route('/api/collections/<collection_id>/sources/representation/representation.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_source_representation_csv(collection_id):
    user_mc = user_mediacloud_client()
    info = user_mc.tag(collection_id)
    source_representation = apicache.collection_source_representation(user_mediacloud_key(), collection_id,
                                                                      sample_size=500,
                                                                      fq="publish_date:[NOW-90DAY TO NOW]")
    props = ['media_id', 'media_name', 'media_url', 'stories', 'sample_size', 'story_pct']
    filename = info['label'] + "-source sentence counts.csv"
    return csv.stream_response(source_representation, props, filename)


@app.route('/api/collections/<collection_id>/similar-collections', methods=['GET'])
@flask_login.login_required
@api_error_handler
def similar_collections(collection_id):
    info = {
        'similarCollections': mc.tagList(similar_tags_id=collection_id)
    }
    return jsonify({'results': info})


@app.route('/api/collections/create', methods=['POST'])
@form_fields_required('name', 'description')
@flask_login.login_required
@api_error_handler
def collection_create():
    user_mc = user_admin_mediacloud_client()     # has to be admin to call createTag
    label = '{}'.format(request.form['name'])
    description = request.form['description']
    static = request.form['static'] if 'static' in request.form else None
    show_on_stories = request.form['showOnStories'] if 'showOnStories' in request.form else None
    show_on_media = request.form['showOnMedia'] if 'showOnMedia' in request.form else None
    source_ids = []
    if len(request.form['sources[]']) > 0:
        source_ids = request.form['sources[]'].split(',')

    formatted_name = as_tag_name(label)
    # first create the collection
    new_collection = user_mc.createTag(TAG_SETS_ID_COLLECTIONS, formatted_name, label, description,
                                       is_static=(static == 'true'),
                                       show_on_stories=(show_on_stories == 'true'),
                                       show_on_media=(show_on_media == 'true'))
    # then go through and tag all the sources specified with the new collection id
    tags = [MediaTag(sid, tags_id=new_collection['tag']['tags_id'], action=TAG_ACTION_ADD) for sid in source_ids]
    if len(tags) > 0:
        user_mc.tagMedia(tags)
    return jsonify(new_collection['tag'])
