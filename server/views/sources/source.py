# -*- coding: utf-8 -*-
import logging
from flask import request, jsonify
import flask_login
from datetime import datetime
from dateutil.relativedelta import relativedelta
from mediacloud.tags import MediaTag, TAG_ACTION_ADD, TAG_ACTION_REMOVE

from server import app, db
from server.cache import cache, key_generator
from server.auth import user_mediacloud_key, user_admin_mediacloud_client, user_name, user_has_auth_role, ROLE_MEDIA_EDIT
from server.util.request import arguments_required, form_fields_required, api_error_handler
from server.util.tags import TAG_SETS_ID_PUBLICATION_COUNTRY, TAG_SETS_ID_PUBLICATION_STATE, VALID_COLLECTION_TAG_SETS_IDS, \
    TAG_SETS_ID_PRIMARY_LANGUAGE, TAG_SETS_ID_COUNTRY_OF_FOCUS, TAG_SETS_ID_MEDIA_TYPE, TAG_SET_GEOCODER_VERSION, \
    TAG_SET_NYT_LABELS_VERSION, GEO_SAMPLE_SIZE, is_metadata_tag_set
from server.views.sources import _cached_source_story_count
from server.views.sources.words import cached_wordcount, stream_wordcount_csv
from server.views.sources.geocount import stream_geo_csv, cached_geotag_count
from server.views.sources.sentences import cached_recent_sentence_counts, stream_sentence_count_csv
from server.views.sources.favorites import add_user_favorite_flag_to_sources, add_user_favorite_flag_to_collections


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
        db.add_item_to_users_list(username, 'favoriteSources', int(media_id))
    else:
        db.remove_item_from_users_list(username, 'favoriteSources', int(media_id))
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
    total_story_count = _cached_source_story_count(username, media_query)
    results['story_count'] = total_story_count
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
    geoRes = user_mc.sentenceFieldCount(media_query, '', field='tags_id_stories', tag_sets_id=TAG_SET_GEOCODER_VERSION, sample_size=GEO_SAMPLE_SIZE)
    ratio_geo_tagged_count = float(geoRes[0]['count']) / float(total_story_count) if len(geoRes) > 0 else 0
    results['geoPct'] = ratio_geo_tagged_count
    # nyt theme
    nytRes = user_mc.sentenceFieldCount(media_query, '', field='tags_id_stories', tag_sets_id=TAG_SET_NYT_LABELS_VERSION, sample_size=GEO_SAMPLE_SIZE)
    ratio_nyt_tagged_count = float(nytRes[0]['count']) / float(total_story_count) if len(nytRes) > 0 else 0
    results['nytPct'] = ratio_nyt_tagged_count
    return jsonify(results)

@cache.cache_on_arguments(function_key_generator=key_generator)
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
    return jsonify(info)

@app.route('/api/sources/<media_id>/scrape', methods=['POST'])
@flask_login.login_required
@api_error_handler
def api_media_source_scrape_feeds(media_id):
    user_mc = user_admin_mediacloud_client()
    results = user_mc.feedsScrape(media_id)
    return jsonify(results)

@app.route('/api/sources/<media_id>/sentences/sentence-count.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def source_sentence_count_csv(media_id):
    return stream_sentence_count_csv(user_mediacloud_key(), 'sentenceCounts-Source-' + media_id, media_id, "media_id")


@app.route('/api/sources/<media_id>/sentences/count')
@flask_login.login_required
@api_error_handler
def api_media_source_sentence_count(media_id):
    health = _cached_media_source_health(user_mediacloud_key(), media_id)
    counts = cached_recent_sentence_counts(user_mediacloud_key(),
                                           ['media_id:'+str(media_id)],
                                           _safely_get_health_start_date(health),
                                           _safely_get_health_end_date(health))
    info = {
        'health': health,
        'sentenceCounts': counts
    }
    return jsonify({'results':info})


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
    query_arg = 'media_id:'+str(media_id)
    if ('q' in request.args) and (len(request.args['q']) > 0):
        query_arg = 'media_id:'+str(media_id) + " AND " + request.args.get('q')
    return stream_wordcount_csv(user_mediacloud_key(), 'wordcounts-Source-'+media_id, query_arg)


@app.route('/api/sources/<media_id>/words')
@flask_login.login_required
@api_error_handler
def media_source_words(media_id):
    query_arg = 'media_id:'+str(media_id)
    if ('q' in request.args) and (len(request.args['q']) > 0):
        query_arg = 'media_id:'+str(media_id) + " AND " + request.args.get('q')
    info = {
        'wordcounts': cached_wordcount(user_mediacloud_key(), query_arg)
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
        'name': name,
        'url': url,
        'editor_notes': editor_notes,
        'public_notes': public_notes,
        'is_monitored': monitored,
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
