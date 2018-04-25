import datetime
import logging
from multiprocessing import Pool

import flask_login
import os
from flask import jsonify, request
from mediacloud.tags import MediaTag, TAG_ACTION_ADD

import server.util.csv as csv
from server import app, mc, db
from server.auth import user_mediacloud_key, user_admin_mediacloud_client, user_mediacloud_client, user_name,\
    user_has_auth_role, ROLE_MEDIA_EDIT
from server.cache import cache, key_generator
import server.views.sources.apicache as apicache
from server.util.request import arguments_required, form_fields_required, api_error_handler
from server.util.tags import TAG_SETS_ID_COLLECTIONS, is_metadata_tag_set, format_name_from_label, \
    format_metadata_fields, media_with_tag
from server.views.sources import SOURCES_TEMPLATE_PROPS_EDIT, \
    COLLECTIONS_TEMPLATE_PROPS_EDIT, _cached_source_story_count
from server.views.sources.favorites import add_user_favorite_flag_to_collections, add_user_favorite_flag_to_sources
from server.views.sources.geocount import stream_geo_csv, cached_geotag_count
from server.views.sources.sentences import cached_recent_sentence_counts, stream_sentence_count_csv
from server.views.sources.words import word_count, stream_wordcount_csv

logger = logging.getLogger(__name__)

HISTORICAL_COUNT_POOL_SIZE = 10  # number of parallel processes to use while fetching historical sentence counts for each media source
FEED_SCRAPE_JOB_POOL_SIZE = 10


def allowed_file(filename):
    filename, file_extension = os.path.splitext(filename)
    return file_extension.lower() in ['.csv']


@app.route('/api/collections/<collection_id>/metadatacoverage.csv')
@flask_login.login_required
@api_error_handler
def api_metadata_download(collection_id):
    all_media = media_with_tag(user_mediacloud_key(), collection_id)

    metadata_items = []
    for media_source in all_media:
        for tag in media_source['media_source_tags']:
            if is_metadata_tag_set(tag['tag_sets_id']):
                found = False
                for dictItem in metadata_items:
                    if dictItem['metadataId'] == tag['tag_sets_id']:
                        temp = dictItem['tagged']
                        dictItem.update({'tagged': temp + 1})
                        found = True
                if not found:
                    metadata_items.append(
                        {'metadataCoverage': tag['tag_set'], 'metadataId': tag['tag_sets_id'], 'tagged': 1})

    for i in metadata_items:
        temp = len(all_media) - i['tagged']
        i.update({'notTagged': temp})

    props = ['metadataCoverage', 'tagged', 'notTagged']
    filename = "metadataCoverageForCollection" + collection_id + ".csv"
    return csv.stream_response(metadata_items, props, filename)


@app.route('/api/collections/set/<tag_sets_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_set(tag_sets_id):
    '''
    Return a list of all the (public only or public and private, depending on user role) collections in a tag set.  Not cached because this can change, and load time isn't terrible.
    :param tag_sets_id: the tag set to query for public collections
    :return: dict of info and list of collections in
    '''
    if user_has_auth_role(ROLE_MEDIA_EDIT):
        info = apicache.tag_set_with_private_collections(user_mediacloud_key(), tag_sets_id)
    else:
        info = apicache.tag_set_with_public_collections(user_mediacloud_key(), tag_sets_id)

    add_user_favorite_flag_to_collections(info['tags'])
    # rename to make more sense here
    info['collections'] = info['tags']
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
        db.add_item_to_users_list(username, 'favoriteCollections', int(collection_id))
    else:
        db.remove_item_from_users_list(username, 'favoriteCollections', int(collection_id))
    return jsonify({'isFavorite': favorite})


@app.route('/api/collections/<collection_id>/details')
@flask_login.login_required
@api_error_handler
def api_collection_details(collection_id):
    user_mc = user_mediacloud_client()
    info = user_mc.tag(collection_id)
    add_user_favorite_flag_to_collections([info])
    info['id'] = collection_id
    info['tag_set'] = _tag_set_info(user_mediacloud_key(), info['tag_sets_id'])
    return jsonify({'results': info})


def _media_list_edit_worker(media_id):
    user_mc = user_admin_mediacloud_client()
    # latest scrape job
    scrape_jobs = user_mc.feedsScrapeStatus(media_id)
    latest_scrape_job = None
    if len(scrape_jobs['job_states']) > 0:
        latest_scrape_job = scrape_jobs['job_states'][0]
    # active feed count
    feeds = user_mc.feedList(media_id)
    active_syndicated_feeds = [f for f in feeds if f['feed_status'] == 'active' and f['feed_type'] == 'syndicated']
    active_feed_count = len(active_syndicated_feeds)
    return {
        'media_id': media_id,
        'latest_scrape_job': latest_scrape_job,
        'active_feed_count': active_feed_count,
    }


@app.route('/api/collections/<collection_id>/sources')
@flask_login.login_required
@api_error_handler
def api_collection_sources(collection_id):
    results = {}
    results['tags_id'] = collection_id
    media_in_collection = media_with_tag(user_mediacloud_key(), collection_id)
    add_user_favorite_flag_to_sources(media_in_collection)
    results['sources'] = media_in_collection
    return jsonify(results)


@app.route('/api/template/sources.csv')
@flask_login.login_required
@api_error_handler
def api_download_sources_template():
    filename = "Collection_Template_for_sources.csv"

    what_type_download = SOURCES_TEMPLATE_PROPS_EDIT

    return csv.stream_response(what_type_download, what_type_download, filename)


@app.route('/api/collections/<collection_id>/sources.csv')
@flask_login.login_required
@api_error_handler
def api_collection_sources_csv(collection_id):
    user_mc = user_mediacloud_client()
    collection = user_mc.tag(collection_id)    # not cached because props can change often
    all_media = media_with_tag(user_mediacloud_key(), collection_id)
    for src in all_media:
        for tag in src['media_source_tags']:
            if is_metadata_tag_set(tag['tag_sets_id']):
                format_metadata_fields(src, tag)
    file_prefix = "Collection {} ({}) - sources ".format(collection_id, collection['tag'])
    properties_to_include = COLLECTIONS_TEMPLATE_PROPS_EDIT
    return csv.download_media_csv(all_media, file_prefix, properties_to_include)


@app.route('/api/collections/<collection_id>/sources/sentences/historical-counts')
@arguments_required('start', 'end')
@flask_login.login_required
@api_error_handler
def collection_source_sentence_historical_counts(collection_id):
    start_date_str = request.args['start']
    end_date_str = request.args['end']
    results = _collection_source_sentence_historical_counts(collection_id, start_date_str, end_date_str)
    return jsonify({'counts': results})


@app.route('/api/collections/<collection_id>/sources/stories/historical-counts.csv')
@arguments_required('start', 'end')
@flask_login.login_required
@api_error_handler
def collection_source_sentence_historical_counts_csv(collection_id):
    start_date_str = request.args['start']
    end_date_str = request.args['end']
    results = _collection_source_sentence_historical_counts(collection_id, start_date_str, end_date_str)
    date_cols = None
    for source in results:
        if date_cols is None:
            date_cols = sorted(source['sentences_over_time'].keys())
        for date, count in source['sentences_over_time'].iteritems():
            source[date] = count
        del source['sentences_over_time']
    props = ['media_id', 'media_name', 'media_url', 'total_stories', 'total_sentences'] + date_cols
    filename = "{} - source content count ({} to {})".format(collection_id, start_date_str, end_date_str)
    return csv.stream_response(results, props, filename)


# worker function to help in parallel
def _source_sentence_counts_worker(info):
    source = info['media']
    media_query = "(media_id:{}) {}".format(source['media_id'], info['q'])
    total_story_count = _cached_source_story_count(user_mediacloud_key(), media_query)
    split_sentence_count = _cached_source_split_sentence_count(user_mediacloud_key, media_query,
                                                               info['start_date_str'], info['end_date_str'])
    del split_sentence_count['split']['end']
    del split_sentence_count['split']['start']
    del split_sentence_count['split']['gap']
    source_data = {
        'media_id': source['media_id'],
        'media_name': source['name'],
        'media_url': source['url'],
        'total_stories': total_story_count,
        'total_sentences': split_sentence_count['count'],
        'sentences_over_time': split_sentence_count['split'],
    }
    return source_data


def _collection_source_sentence_historical_counts(collection_id, start_date_str, end_date_str):
    user_mc = user_mediacloud_client()
    start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
    end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
    q = " AND ({})".format(user_mc.publish_date_query(start_date, end_date))
    media_list = media_with_tag(user_mediacloud_key(), collection_id)
    jobs = [{'media': m, 'q': q, 'start_date_str': start_date_str, 'end_date_str': end_date_str} for m in media_list]
    # fetch in parallel to make things faster
    pool = Pool(processes=HISTORICAL_COUNT_POOL_SIZE)
    results = pool.map(_source_sentence_counts_worker, jobs)  # blocks until they are all done
    pool.terminate()  # extra safe garbage collection
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_source_sentence_count(user_mc_key, query):
    user_mc = user_mediacloud_client()
    return user_mc.sentenceCount(query)['count']


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_source_split_sentence_count(user_mc_key, query, split_start, split_end):
    user_mc = user_mediacloud_client()
    return user_mc.sentenceCount(query, split=True, split_start_date=split_start, split_end_date=split_end)


@app.route('/api/collections/<collection_id>/sources/sentences/count')
@flask_login.login_required
@api_error_handler
def collection_source_sentence_counts(collection_id):
    results = _cached_media_with_sentence_counts(user_mediacloud_key(), collection_id)
    return jsonify({'sources': results})


@app.route('/api/collections/<collection_id>/sources/sentences/count.csv')
@flask_login.login_required
@api_error_handler
def collection_source_sentence_counts_csv(collection_id):
    user_mc = user_mediacloud_client()
    info = user_mc.tag(collection_id)
    results = _cached_media_with_sentence_counts(user_mediacloud_key(), collection_id)
    props = ['media_id', 'name', 'url', 'sentence_count', 'sentence_pct']
    filename = info['label'] + "-source sentence counts.csv"
    return csv.stream_response(results, props, filename)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_media_with_sentence_counts(user_mc_key, tag_sets_id):
    sample_size = 2000  # kind of arbitrary
    # list all sources first
    sources_by_id = {int(c['media_id']): c for c in media_with_tag(user_mediacloud_key(), tag_sets_id)}
    sentences = mc.sentenceList('*', 'tags_id_media:' + str(tag_sets_id), rows=sample_size, sort=mc.SORT_RANDOM)
    # sum the number of sentences per media source
    sentence_counts = {int(media_id): 0 for media_id in sources_by_id.keys()}
    if 'docs' in sentences['response']:
        for sentence in sentences['response']['docs']:
            if (sentence['media_id'] is not None) and (int(sentence['media_id']) in sentence_counts):  # safety check
                sentence_counts[int(sentence['media_id'])] = sentence_counts[int(sentence['media_id'])] + 1.
    # add in sentence count info to media info
    for media_id in sentence_counts.keys():
        sources_by_id[media_id]['sentence_count'] = sentence_counts[media_id]
        sources_by_id[media_id]['sentence_pct'] = sentence_counts[media_id] / sample_size
    return sources_by_id.values()


def _tag_set_info(user_mc_key, tag_sets_id):
    user_mc = user_mediacloud_client()
    return user_mc.tagSet(tag_sets_id)


@app.route('/api/collections/<collection_id>/sentences/count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_collection_sentence_count(collection_id):
    info = {}
    info['sentenceCounts'] = cached_recent_sentence_counts(user_mediacloud_key(),
                                                           ['tags_id_media:' + str(collection_id)])
    return jsonify({'results': info})


@app.route('/api/collections/<collection_id>/sentences/sentence-count.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def collection_sentence_count_csv(collection_id):
    return stream_sentence_count_csv(user_mediacloud_key(), 'sentenceCounts-Collection-' + collection_id, collection_id,
                                     "tags_id_media")


@app.route('/api/collections/<collection_id>/geography')
@flask_login.login_required
@api_error_handler
def geo_geography(collection_id):
    info = {
        'geography': cached_geotag_count(user_mediacloud_key(), 'tags_id_media:' + str(collection_id))
    }
    return jsonify({'results': info})


@app.route('/api/collections/<collection_id>/geography/geography.csv')
@flask_login.login_required
@api_error_handler
def collection_geo_csv(collection_id):
    return stream_geo_csv(user_mediacloud_key(), 'geography-Collection-' + collection_id, collection_id,
                          "tags_id_media")


@app.route('/api/collections/<collection_id>/words')
@flask_login.login_required
@api_error_handler
def collection_words(collection_id):
    query_arg = 'tags_id_media:' + str(collection_id)
    if ('q' in request.args) and (len(request.args['q']) > 0):
        query_arg = 'tags_id_media:' + str(collection_id) + " AND " + request.args.get('q')
    info = {
        'wordcounts': word_count(user_mediacloud_key, query_arg)
    }
    return jsonify({'results': info})


@app.route('/api/collections/<collection_id>/words/wordcount.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def collection_wordcount_csv(collection_id):
    query_arg = 'tags_id_media:' + str(collection_id)
    if ('q' in request.args) and (len(request.args['q']) > 0):
        query_arg = 'tags_id_media:' + str(collection_id) + " AND " + request.args.get('q')
    return stream_wordcount_csv(user_mediacloud_key(), 'wordcounts-Collection-' + collection_id, query_arg)


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

    formatted_name = format_name_from_label(label)
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


