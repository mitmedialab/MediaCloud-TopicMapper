import json
import logging
import re

from flask import jsonify, request
import flask_login
from multiprocessing import Pool
from operator import itemgetter
import time
from collections import defaultdict

from server import app, mc
from server.cache import cache
from server.views import WILDCARD_ASTERISK
import server.views.apicache as base_api_cache
from server.auth import user_has_auth_role, ROLE_MEDIA_EDIT
from server.util.tags import VALID_COLLECTION_TAG_SETS_IDS
from server.views.sources import FEATURED_COLLECTION_LIST
from server.views.media_search import collection_search_with_page, media_search_with_page
from server.util.request import api_error_handler, arguments_required
from server.util.tags import cached_media_with_tag_page

logger = logging.getLogger(__name__)

MAX_COLLECTIONS = 20
MEDIA_SEARCH_POOL_SIZE = len(VALID_COLLECTION_TAG_SETS_IDS)
STORY_COUNT_POOL_SIZE = 20  # number of parallel processes to use while fetching historical story counts for sources
ALL_MEDIA = '-1'


@app.route('/api/mediapicker/sources/search', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_mediapicker_source_search():
    search_str = request.args.get('media_keyword', '')
    cleaned_search_str = None if search_str == WILDCARD_ASTERISK else search_str
    querying_all_media = False
    link_id = request.args.get('link_id', 0)
    tags_ids = request.args.get('tags', 0)
    try:
        if int(tags_ids) == int(ALL_MEDIA):
            querying_all_media = True
    except ValueError:
        # ie. request.args['tags'] is not an int (ie. it is a list of collections like a normal query)
        querying_all_media = False
    tags_fq = "media_source_tags: {tag_sets_id: " + str(VALID_COLLECTION_TAG_SETS_IDS) + "}"

    if querying_all_media:
        tags = [{'tags_id': ALL_MEDIA, 'id': ALL_MEDIA, 'label': "All Media", 'tag_sets_id': ALL_MEDIA}]
        matching_sources, last_media_id = media_search_with_page(cleaned_search_str, tags, link_id=link_id)
    elif len(tags_ids) > 0:
        # group the tags by tags_sets_id to support boolean searches
        # the format for this metadata is a list of tags_id. the following finds the right metadata tag set for the tags
        tags_id_list = tags_ids.split(',')
        tags = [base_api_cache.tag(tid) for tid in tags_id_list]  # ok to use cache here (metadata tags don't change)
        tags_by_set = defaultdict(list)
        for tag in tags:
            tags_by_set[tag['tag_sets_id']].append(tag['tags_id'])
        tag_ids_by_set = list(tags_by_set.values())
        # TODO: find a more clever way to do this
        tags_id_1 = tag_ids_by_set[0] if len(tag_ids_by_set) > 0 else None
        tags_id_2 = tag_ids_by_set[1] if len(tag_ids_by_set) > 1 else None
        tags_id_3 = tag_ids_by_set[2] if len(tag_ids_by_set) > 2 else None
        tags_id_4 = tag_ids_by_set[3] if len(tag_ids_by_set) > 3 else None
        tags_id_5 = tag_ids_by_set[4] if len(tag_ids_by_set) > 4 else None
        matching_sources, last_media_id = media_search_with_page(search_str=cleaned_search_str, fq=tags_fq, tags_id_1=tags_id_1,
                                        tags_id_2=tags_id_2, tags_id_3=tags_id_3, tags_id_4=tags_id_4,
                                        tags_id_5=tags_id_5,
                                        link_id=link_id)
    else:
        matching_sources, last_media_id = media_search_with_page(search_str=cleaned_search_str, fq=tags_fq, link_id=link_id)
    return jsonify({'list': matching_sources, 'link_id': last_media_id})


def collection_details_worker(info):
    total_sources = len(cached_media_with_tag_page(info['tags_id'], 0))
    coll_data = {
        'type': info['tag_set_label'],
        'label': info['label'] or info['tag'],
        'media_count': total_sources,
    }
    info.update(coll_data)
    return info


@app.route('/api/mediapicker/collections/search', methods=['GET'])
@flask_login.login_required
@arguments_required('media_keyword', 'which_set')
@api_error_handler
def api_mediapicker_collection_search():
    t0 = time.time()
    use_pool = None
    add_source_counts = False
    public_only = False if user_has_auth_role(ROLE_MEDIA_EDIT) else True
    search_str = request.args.get('media_keyword', '')
    tag_sets_id_list = request.args.get('which_set','').split(',')
    t1 = time.time()
    results, last_tags_id = collection_search_with_page(search_str, public_only, tag_sets_id_list)
    t2 = time.time()
    trimmed_collections = results[:MAX_COLLECTIONS]
    # flat_list_of_collections = [item for sublist in trimmed_collections for item in sublist]
    set_of_queried_collections = []
    if add_source_counts:
        if len(trimmed_collections) > 0:
            if use_pool:
                pool = Pool(processes=STORY_COUNT_POOL_SIZE)
                set_of_queried_collections = pool.map(collection_details_worker, trimmed_collections)
                pool.close()
            else:
                set_of_queried_collections = [collection_details_worker(c) for c in trimmed_collections]
    else:
        # skip adding in the source count details all together
        set_of_queried_collections = trimmed_collections
    t3 = time.time()
    if use_pool is not None:
        set_of_queried_collections = sorted(set_of_queried_collections, key=itemgetter('media_count'), reverse=True)
    t4 = time.time()
    logger.debug("total: {}".format(t4 - t0))
    logger.debug("  load: {}".format(t1-t0))
    logger.debug("  search: {}".format(t2 - t1))
    logger.debug("  media_count: {}".format(t3 - t2))
    logger.debug("  sort: {}".format(t4 - t3))
    return jsonify({'list': set_of_queried_collections, 'link_id': last_tags_id})


@app.route('/api/mediapicker/collections/featured', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_explorer_featured_collections():
    featured_collections = _cached_featured_collection_list(FEATURED_COLLECTION_LIST)
    return jsonify({'list': featured_collections})


@cache.cache_on_arguments()
def _cached_featured_collection_list(tag_id_list):
    use_pool = True
    add_source_counts = False
    featured_collections = []
    for tags_id in tag_id_list:
        coll = mc.tag(tags_id)
        coll['id'] = tags_id
        featured_collections.append(coll)
    if add_source_counts:
        if use_pool:
            pool = Pool(processes=STORY_COUNT_POOL_SIZE)
            set_of_queried_collections = pool.map(collection_details_worker, featured_collections)
            pool.close()
        else:
            set_of_queried_collections = [collection_details_worker(c) for c in featured_collections]
    else:
        set_of_queried_collections = featured_collections
    return set_of_queried_collections


# helper for preview queries
# tags_id is either a string or a list, which is handled in either case by the len() test. ALL_MEDIA is the exception

def concatenate_query_for_solr(solr_seed_query, media_ids, tags_ids, custom_collection=None):
    query = '({})'.format(solr_seed_query)
    custom_collection = [] if custom_collection is None else custom_collection
    if len(media_ids) > 0 or len(tags_ids) > 0 or len(custom_collection) > 0:
        if tags_ids == [ALL_MEDIA] or tags_ids == ALL_MEDIA:
            return query
        query += " AND ("
        # add in the media sources they specified
        if len(media_ids) > 0: # this format is a string of media_idds
            media_ids = media_ids.split(',') if isinstance(media_ids, str) else media_ids
            query_media_ids = " ".join([str(m) for m in media_ids])
            query_media_ids = re.sub(r'\[*\]*', '', str(query_media_ids))
            query_media_ids = " media_id:({})".format(query_media_ids)
            query += '('+query_media_ids+')'

        # conjunction
        if len(media_ids) > 0 and (len(tags_ids) > 0 or len(custom_collection) > 0):
            query += " OR "

        # add in the collections they specified
        if len(tags_ids) > 0: # this format is a string of tags_id_medias
            tags_ids = tags_ids.split(',') if isinstance(tags_ids, str) else tags_ids
            query_tags_ids = " ".join([str(t) for t in tags_ids])
            query_tags_ids = re.sub(r'\[*\]*', '', str(query_tags_ids))
            query_tags_ids = " tags_id_media:({})".format(query_tags_ids)
            if not len(custom_collection) > 0: # tags and custom collections are bracketed together
                query += '('+query_tags_ids+')'
            else:
                query += '(' + query_tags_ids

        # grab any custom collections (there may be multiple) and turn it into a boolean tags_id_media phrase
        if len(custom_collection) > 0: #this format is for each metadata tag, each sub-list is OR'd together, and every list is AND'ed together
            custom_collection_dict = json.loads(custom_collection)
            has_custom_collections, custom_collection_string  = custom_collection_as_solr_query(custom_collection_dict)
            if has_custom_collections:

                if len(tags_ids) > 0:# tags and custom collections are bracketed together
                    query = "{} OR {}".format(query, custom_collection_string)
                    query += ')'
                else:
                    query = "{} ({})".format(query, custom_collection_string)
        query += ')'
    return query

# we don't know if custom collections is empty, either return False, '' or True and the string of ids
# we only care about tags_id_media  (keywords are irrelevant for these solr searches)
def custom_collection_as_solr_query(custom_coll_dict):
    if len(custom_coll_dict) == 0:
        return False, ''
    full_custom_query = ''
    custom_query_partial = ''
    for sets_of_tags in custom_coll_dict:  # for each custom collections
        query_tags = sets_of_tags.get('tags_id_media', '')
        custom_tag_groups = json.loads(query_tags)  # expect tags in format [[x, ...], ...]
        custom_sets = [] # result
        for tag_grp in custom_tag_groups: # for all the metadata tags, serialize
            if len(tag_grp) > 1:  # handle singular [] vs groups of metadata tags [x, y,z]
                custom_id_set_string = " OR ".join(str(tag) for tag in tag_grp)  # OR tags in same metadata set eg #US OR #UK
                custom_id_set_string = "tags_id_media:({})".format(custom_id_set_string)
                custom_sets.append(custom_id_set_string)
            elif len(tag_grp) == 1:
                custom_id_set_string = re.sub(r'\[*\]*', '', str(tag_grp))
                custom_id_set_string = "tags_id_media:({})".format(custom_id_set_string)
                custom_sets.append(custom_id_set_string)

            query_custom_ids_string = " AND ".join(custom_sets)  # AND the metadata sets together eg #US OR #UK AND #DIGITAL_NATIVE
            query_custom_ids_string = "{}".format(query_custom_ids_string)

            if len(custom_coll_dict) > 1:
                if len(custom_query_partial) == 0:
                    custom_query_partial = query_custom_ids_string
                else:
                    custom_query_partial = "OR {}".format(query_custom_ids_string) #OR each custom collection together eg OR #US OR #UK AND #DIGITAL_NATIVE
            else:
                custom_query_partial = query_custom_ids_string
        full_custom_query = "{} {}".format(full_custom_query, custom_query_partial) # merge with the rest of the custom query and send back
    return True, full_custom_query
