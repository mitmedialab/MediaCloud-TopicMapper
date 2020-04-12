# -*- coding: utf-8 -*-
import logging
from flask import request, jsonify
import flask_login
from datetime import datetime
from dateutil.relativedelta import relativedelta
from mediacloud.tags import MediaTag, TAG_ACTION_ADD, TAG_ACTION_REMOVE

from server import app, user_db, analytics_db
from server.cache import cache
from server.auth import user_mediacloud_key, user_admin_mediacloud_client, user_name, user_has_auth_role, ROLE_MEDIA_EDIT
from server.util.request import arguments_required, form_fields_required, api_error_handler
from server.util.tags import TAG_SETS_ID_PUBLICATION_COUNTRY, TAG_SETS_ID_PUBLICATION_STATE, VALID_COLLECTION_TAG_SETS_IDS, \
    TAG_SETS_ID_PRIMARY_LANGUAGE, TAG_SETS_ID_COUNTRY_OF_FOCUS, TAG_SETS_ID_MEDIA_TYPE, TAG_SET_GEOCODER_VERSION, \
    TAG_SET_NYT_LABELS_VERSION, is_metadata_tag_set, TAG_SPIDERED_STORY
from server.views.sources.words import word_count, stream_wordcount_csv
from server.views.sources.geocount import stream_geo_csv, cached_geotag_count
from server.views.sources.stories_split_by_time import stream_split_stories_csv
import server.views.sources.apicache as apicache
from server.views.favorites import add_user_favorite_flag_to_sources, add_user_favorite_flag_to_collections
from server.views.sources.feeds import source_feed_list
from server.views.stories import QUERY_LAST_YEAR

logger = logging.getLogger(__name__)


@app.route('/api/sources/list', methods=['GET'])
@arguments_required('src[]')
@flask_login.login_required
@api_error_handler
def api_media_sources_by_ids():
    source_list = []
    source_id_array = request.args['src[]'].split(',')
    for mediaId in source_id_array:
        info = _media_source_details(mediaId)
        source_list.append(info)
    add_user_favorite_flag_to_sources(source_list)
    return jsonify({'results': source_list})


@app.route('/api/sources/<media_id>/favorite', methods=['POST'])
@flask_login.login_required
@form_fields_required('favorite')
@api_error_handler
def source_set_favorited(media_id):
    favorite = request.form["favorite"]
    username = user_name()
    if int(favorite) == 1:
        user_db.add_item_to_users_list(username, 'favoriteSources', int(media_id))
    else:
        user_db.remove_item_from_users_list(username, 'favoriteSources', int(media_id))
    return jsonify({'isFavorite': favorite})


@app.route('/api/sources/<media_id>/stats')
@flask_login.login_required
@api_error_handler
def source_stats(media_id):
    username = user_name()
    user_mc = user_admin_mediacloud_client()
    results = {}
    # story count
    media_query = "(media_id:{})".format(media_id)
    source_specific_story_count = apicache.source_story_count(user_mediacloud_key(), media_query)
    results['story_count'] = source_specific_story_count
    # health
    media_health = _cached_media_source_health(username, media_id)
    results['num_stories_90'] = media_health['num_stories_90'] if 'num_stories_90' in media_health else None
    results['start_date'] = media_health['start_date'] if 'start_date' in media_health else None
    info = _media_source_details(media_id)
    user_can_see_private_collections = user_has_auth_role(ROLE_MEDIA_EDIT)
    visible_collections = [c for c in info['media_source_tags']
                           if ((c['tag_sets_id'] in VALID_COLLECTION_TAG_SETS_IDS) and
                               ((c['show_on_media'] == 1) or user_can_see_private_collections))]
    results['collection_count'] = len(visible_collections)
    # geography tags
    results['geoPct'] = apicache.tag_coverage_pct(user_mediacloud_key(), media_query, TAG_SET_GEOCODER_VERSION)
    # nyt theme
    results['nytPct'] = apicache.tag_coverage_pct(user_mediacloud_key(), media_query, TAG_SET_NYT_LABELS_VERSION)
    return jsonify(results)


@cache.cache_on_arguments()
def _cached_media_source_health(user_mc_key, media_id):
    user_mc = user_admin_mediacloud_client()
    results = None
    try:
        results = user_mc.mediaHealth(media_id)
    except Exception as e:
        logger.exception(e)
    return results


def _media_source_details(media_id):
    user_mc = user_admin_mediacloud_client()
    info = user_mc.media(media_id)
    info['id'] = media_id
    return info


def _safely_get_health_start_date(health):
    """
    The health might be empty, so call this to default to 1 year ago if it is
    """
    if health is None or len(health) == 0:  # maybe no health exists yet, go with one year ago
        one_year_ago = datetime.now() - relativedelta(years=1)
        start_date = "{0}-{1}-{2}".format(one_year_ago.year, one_year_ago.month, one_year_ago.day)
    else:
        start_date = health['start_date'][:10]
    return start_date


def _safely_get_health_end_date(health):
    """
    The health might be empty, so call this to default to today
    """
    if health is None or len(health) == 0:  # maybe no health exists yet, go with one year ago
        now = datetime.now()
        start_date = "{0}-{1}-{2}".format(now.year, now.month, now.day)
    else:
        start_date = health['end_date'][:10]
    return start_date


@app.route('/api/sources/<media_id>/details')
@flask_login.login_required
@api_error_handler
def api_media_source_details(media_id):
    health = _cached_media_source_health(user_mediacloud_key(), media_id)
    info = _media_source_details(media_id)
    info['health'] = health
    user_mc = user_admin_mediacloud_client()
    if user_has_auth_role(ROLE_MEDIA_EDIT):
        info['scrape_status'] = user_mc.feedsScrapeStatus(media_id)  # need to know if scrape is running
    else:
        info['scrape_status'] = None
    add_user_favorite_flag_to_sources([info])
    add_user_favorite_flag_to_collections(info['media_source_tags'])
    analytics_db.increment_count(analytics_db.TYPE_MEDIA, media_id, analytics_db.ACTION_SOURCE_MGR_VIEW)
    return jsonify(info)


@app.route('/api/sources/<media_id>/scrape', methods=['POST'])
@flask_login.login_required
@api_error_handler
def api_media_source_scrape_feeds(media_id):
    user_mc = user_admin_mediacloud_client()
    results = user_mc.feedsScrape(media_id)
    return jsonify(results)


@app.route('/api/sources/<media_id>/story-split/count.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def source_split_stories_csv(media_id):
    return stream_split_stories_csv(user_mediacloud_key(), 'splitStoryCounts-Source-{}'.format(media_id),
                                    "media_id:{}".format(media_id))


@app.route('/api/sources/<media_id>/story-split/count')
@flask_login.login_required
@api_error_handler
def api_media_source_split_stories(media_id):
    media_query = 'media_id:' + str(media_id)
    exclude_spidered_stories = " media_id:{} AND NOT tags_id_stories:{}".format(str(media_id), TAG_SPIDERED_STORY)\
        if 'separate_spidered' in request.args else media_query

    health = _cached_media_source_health(user_mediacloud_key(), media_id)

    all_results = apicache.split_story_count(user_mediacloud_key(), media_query, None)
    # returns same results if request.args doesn't ask to exclude_spidered
    non_spidered_results = apicache.split_story_count(user_mediacloud_key(), exclude_spidered_stories, None)

    all_stories = {
        'total_story_count': all_results['total_story_count'],
        'health': health,
        'list': all_results['counts'],
    }
    partial_stories = {
        'total_story_count': non_spidered_results['total_story_count'],
        'health': health,
        'list': non_spidered_results['counts'],
    }
    return jsonify({'results': {'all_stories': all_stories, 'partial_stories': partial_stories}})


@app.route('/api/sources/<media_id>/geography')
@flask_login.login_required
@api_error_handler
def api_media_source_geography(media_id):
    info = {
        'geography': cached_geotag_count(user_mediacloud_key(), 'media_id:'+str(media_id))
    }
    return jsonify({'results': info})


@app.route('/api/sources/<media_id>/geography/geography.csv')
@flask_login.login_required
@api_error_handler
def source_geo_csv(media_id):
    return stream_geo_csv(user_mediacloud_key(), 'geography-Source-'+media_id, media_id, "media_id")


@app.route('/api/sources/<media_id>/words/wordcount.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def source_wordcount_csv(media_id):
    solr_q = 'media_id:'+str(media_id)
    solr_fq = None
    if ('q' in request.args) and (len(request.args['q']) > 0):
        solr_fq = request.args['q']
    return stream_wordcount_csv(user_mediacloud_key(), 'wordcounts-Source-'+media_id, solr_q, solr_fq)


@app.route('/api/sources/<media_id>/words')
@flask_login.login_required
@api_error_handler
def media_source_words(media_id):
    solr_q = 'media_id:'+str(media_id)
    solr_fq = None
    if ('q' in request.args) and (len(request.args['q']) > 0):
        solr_fq = request.args['q']
    info = {
        'wordcounts': word_count(user_mediacloud_key(), solr_q, solr_fq)
    }
    return jsonify({'results': info})


@app.route('/api/sources/create', methods=['POST'])
@form_fields_required('name', 'url')
@flask_login.login_required
@api_error_handler  
def source_create():
    user_mc = user_admin_mediacloud_client()
    name = request.form['name']
    url = request.form['url']
    editor_notes = request.form['editor_notes'] if 'editor_notes' in request.form else None    # this is optional
    public_notes = request.form['public_notes'] if 'public_notes' in request.form else None
    monitored = request.form['monitored'] if 'monitored' in request.form else None
    # parse out any tag to add (ie. collections and metadata)
    tag_ids_to_add = tag_ids_from_collections_param()
    valid_metadata = [
        {'form_key': 'publicationCountry', 'tag_sets_id': TAG_SETS_ID_PUBLICATION_COUNTRY},
        {'form_key': 'publicationState', 'tag_sets_id': TAG_SETS_ID_PUBLICATION_STATE},
        {'form_key': 'primaryLanguageg', 'tag_sets_id': TAG_SETS_ID_PRIMARY_LANGUAGE},
        {'form_key': 'countryOfFocus', 'tag_sets_id': TAG_SETS_ID_COUNTRY_OF_FOCUS},
        {'form_key': 'mediaType', 'tag_sets_id': TAG_SETS_ID_MEDIA_TYPE}

    ]
    source_to_create = {
        'name': name if (name != 'null' and len(name) > 0) else url,
        'url': url,
        'editor_notes': editor_notes,
        'public_notes': public_notes,
        'is_monitored': (monitored == 'true'),
        'tags_ids': tag_ids_to_add
    }
    result = user_mc.mediaCreate([source_to_create])[0]  # need just the first entry, since we only create one
    if result['status'] != "error":
        # if it worked, update any metadata, because we need to remove the other tags in each set
        for metadata_item in valid_metadata:
            metadata_tag_id = request.form[metadata_item['form_key']] if metadata_item['form_key'] in request.form else None  # this is optional
            if metadata_tag_id:
                user_mc.tagMedia(
                    tags=[MediaTag(result['media_id'], tags_id=metadata_tag_id, action=TAG_ACTION_ADD)],
                    clear_others=True)   # make sure to clear any other values set in this metadata tag set
                tag_ids_to_add.append(metadata_tag_id)
    if result['status'] == 'new':
        # if it is a really new source, kick off a scraping job to find any RSS feeds
        user_mc.feedsScrape(result['media_id'])
    return jsonify(result)


@app.route('/api/sources/create-from-urls', methods=['PUT'])
@form_fields_required('urls')
@flask_login.login_required
@api_error_handler
def source_create_from_urls():
    user_mc = user_admin_mediacloud_client()
    urls = request.form['urls'].split(",")
    sources_to_create = [{'url': url} for url in urls]
    results = user_mc.mediaCreate(sources_to_create)
    return jsonify(results)


@app.route('/api/sources/<media_id>/update', methods=['POST'])
@form_fields_required('name', 'url')
@flask_login.login_required
@api_error_handler  
def source_update(media_id):
    user_mc = user_admin_mediacloud_client()
    # update the basic info
    name = request.form['name']
    url = request.form['url']
    editor_notes = request.form['editor_notes'] if 'editor_notes' in request.form else None  # this is optional
    public_notes = request.form['public_notes'] if 'public_notes' in request.form else None  # this is optional
    monitored = request.form['monitored'] if 'monitored' in request.form else None
    result = user_mc.mediaUpdate(media_id, {'url': url, 'name': name, 'editor_notes': editor_notes,
        'is_monitored': monitored, 'public_notes': public_notes})
    # now we need to update the collections separately, because they are tags on the media source
    source = user_mc.media(media_id)
    existing_tag_ids = [t['tags_id'] for t in source['media_source_tags']
                        if (t['tag_sets_id'] in VALID_COLLECTION_TAG_SETS_IDS)]
    tag_ids_to_add = tag_ids_from_collections_param()
    tag_ids_to_remove = list(set(existing_tag_ids) - set(tag_ids_to_add))
    tags_to_add = [MediaTag(media_id, tags_id=cid, action=TAG_ACTION_ADD)
                   for cid in tag_ids_to_add if cid not in existing_tag_ids]
    tags_to_remove = [MediaTag(media_id, tags_id=cid, action=TAG_ACTION_REMOVE) for cid in tag_ids_to_remove]
    tags = tags_to_add + tags_to_remove
    if len(tags) > 0:   # don't make extraneous calls
        user_mc.tagMedia(tags=tags)
    # now update the metadata too
    valid_metadata = [
        {'form_key': 'publicationCountry', 'tag_sets_id': TAG_SETS_ID_PUBLICATION_COUNTRY},
        {'form_key': 'publicationState', 'tag_sets_id': TAG_SETS_ID_PUBLICATION_STATE},
        {'form_key': 'primaryLanguage', 'tag_sets_id': TAG_SETS_ID_PRIMARY_LANGUAGE},
        {'form_key': 'countryOfFocus', 'tag_sets_id': TAG_SETS_ID_COUNTRY_OF_FOCUS},
        {'form_key': 'mediaType', 'tag_sets_id': TAG_SETS_ID_MEDIA_TYPE}
    ]
    for metadata_item in valid_metadata:
        metadata_tag_id = request.form[metadata_item['form_key']] if metadata_item['form_key'] in request.form else None # this is optional
        existing_tag_ids = [t for t in source['media_source_tags'] if is_metadata_tag_set(t['tag_sets_id'])]
        # form field check
        if metadata_tag_id in [None, '', 'null', 'undefined']:
            # we want to remove it if there was one there
            if len(existing_tag_ids) > 0:
                for remove_if_empty in existing_tag_ids:
                    if metadata_item['tag_sets_id'] == remove_if_empty['tag_sets_id']:
                        tag = MediaTag(media_id, tags_id=remove_if_empty['tags_id'], action=TAG_ACTION_REMOVE)
                        user_mc.tagMedia([tag])

        elif metadata_tag_id not in existing_tag_ids:
            # need to add it and clear out the other
            tag = MediaTag(media_id, tags_id=metadata_tag_id, action=TAG_ACTION_ADD)
            user_mc.tagMedia([tag], clear_others=True)
    # result the success of the media update call - would be better to catch errors in any of these calls...
    return jsonify(result)


def tag_ids_from_collections_param():
    tag_ids_to_add = []
    collection_ids = request.form['collections[]'].split(",")
    if len(collection_ids) > 0:
        tag_ids_to_add = [int(cid) for cid in collection_ids if len(cid) > 0]
    return list(set(tag_ids_to_add))


@app.route('/api/sources/<media_id>/review-info')
@flask_login.login_required
@api_error_handler
def api_source_review_info(media_id):
    user_mc = user_admin_mediacloud_client()
    # latest scrape job
    scrape_jobs = user_mc.feedsScrapeStatus(media_id)
    latest_scrape_job = None
    if len(scrape_jobs['job_states']) > 0:
        latest_scrape_job = scrape_jobs['job_states'][0]
    # active feed count
    feeds = source_feed_list(media_id)
    active_syndicated_feeds = [f for f in feeds if f['active'] and f['type'] == 'syndicated']
    active_feed_count = len(active_syndicated_feeds)
    query = "media_id:{}".format(media_id)
    full_count = apicache.timeperiod_story_count(user_mc, query, QUERY_LAST_YEAR)['count']
    info = {
        'media_id': int(media_id),
        'latest_scrape_job': latest_scrape_job,
        'active_feed_count': active_feed_count,
        'num_stories_last_year': full_count,
    }
    return jsonify(info)
