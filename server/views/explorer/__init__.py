import logging
from server.cache import cache, key_generator
import os
import json
from server import mc
from flask import send_from_directory
from server.auth import is_user_logged_in
import datetime
from slugify import slugify

logger = logging.getLogger(__name__)

SORT_SOCIAL = 'social'
SORT_INLINK = 'inlink'

DEFAULT_COLLECTION_IDS = [9139487]


def validated_sort(desired_sort, default_sort=SORT_SOCIAL):
    valid_sorts = [SORT_SOCIAL, SORT_INLINK]
    if (desired_sort is None) or (desired_sort not in valid_sorts):
        return default_sort
    return desired_sort


def topic_is_public(topics_id):
    topic = mc.topic(topics_id)
    is_public = topic['is_public']
    return int(is_public) == 1


def access_public_topic(topics_id):
    # check whether logged in here since it is a requirement for public access
    if (not is_user_logged_in()) and (topic_is_public(topics_id)):
        return True
    return False


# note similarity above.  JSON versus python prepped fields
def prep_simple_solr_query(query):
    solr_query = concatenate_query_for_solr(solr_seed_query=query['q'],
                                            start_date=query['startDate'], end_date=query['endDate'],
                                            media_ids=query['sources'], tags_ids=query['collections'])
    return solr_query


# helper for preview queries
def concatenate_query_for_solr(solr_seed_query, start_date, end_date, media_ids, tags_ids):
    query = u'({})'.format(solr_seed_query)

    if len(media_ids) > 0 or len(tags_ids) > 0:
        query += " AND ("
        # add in the media sources they specified
        if len(media_ids) > 0:
            id_chain = []
            if type(media_ids) is list:  # if an object versus a string - see sample_searches.json
                for t in media_ids:
                    if type(t) is dict:
                        id_chain.append(t['id'] if 'id' in t else 0)
                    else:
                        id_chain.append(t)
            else:
                id_chain = media_ids
            query_media_ids = u" ".join(map(str, id_chain))
            query_media_ids = u" media_id:({})".format(query_media_ids)
            query += '('+query_media_ids+')'

        if len(media_ids) > 0 and len(tags_ids) > 0:
            query += " OR "
        # add in the collections they specified
        if len(tags_ids) > 0:
            id_chain = []
            if type(tags_ids) is list:
                for t in tags_ids:
                    if type(t) is dict:
                        id_chain.append(t['id'] if 'id' in t else 0)
                    else:
                        id_chain.append(t)
            else:
                id_chain = tags_ids
            query_tags_ids = u" ".join(map(str, id_chain))
            query_tags_ids = u" tags_id_media:({})".format(query_tags_ids)
            query += u'('+query_tags_ids+')'
        query += ')'

    if start_date:
        start_date = u'{}'.format(start_date)
        end_date = u'{}'.format(end_date)
        query += " AND (+" + concatenate_query_and_dates(start_date, end_date) + ")"
    
    return query


def concatenate_query_and_dates(start_date, end_date):
    testa = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
    testb = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
    publish_date = mc.publish_date_query(testa, testb, True, True)
    return publish_date


def parse_query_with_keywords(args):
    solr_query = ''
    # default dates
    one_month_before_now = datetime.datetime.now() - datetime.timedelta(days=30)
    default_start_date = one_month_before_now.strftime("%Y-%m-%d")
    default_end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    # should I break this out into just a demo routine where we add in the start/end date without relying that the
    # try statement will fail?
    try:    # if user arguments are present and allowed by the client endpoint, use them, otherwise use defaults
        current_query = args['q']
        if 'startDate' in args:
            start_date = args['startDate']
        elif 'start_date' in args:
            start_date = args['start_date']
        else:
            start_date = default_start_date
        if 'endDate' in args:
            end_date = args['endDate']
        elif 'end_date' in args:
            end_date = args['end_date']
        else:
            end_date = default_end_date
        media_ids = []
        if 'sources' in args:
            if isinstance(args['sources'], basestring):
                media_ids = args['sources'].split(',') if 'sources' in args and len(args['sources']) > 0 else []
            else:
                media_ids = args['sources']
        if 'collections' in args:
            if isinstance(args['collections'], basestring):
                if len(args['collections']) == 0:
                    tags_ids = []
                else:
                    tags_ids = args['collections'].split(',')
            else:
                tags_ids = args['collections']
        else:
            tags_ids = DEFAULT_COLLECTION_IDS

        solr_query = concatenate_query_for_solr(solr_seed_query=current_query,
                                                start_date=start_date,
                                                end_date=end_date,
                                                media_ids=media_ids,
                                                tags_ids=tags_ids)

    # otherwise, default
    except Exception as e:
        # tags_ids = args['collections'] if 'collections' in args and len(args['collections']) > 0 else []
        logger.warn("user custom query failed, there's a problem with the arguments " + str(e))

    return solr_query


def parse_query_for_sample_search(sample_search_id, query_id):
    sample_searches = load_sample_searches()
    current_query_info = sample_searches[int(sample_search_id)]['queries'][int(query_id)]
    solr_query = concatenate_query_for_solr(solr_seed_query=current_query_info['q'],
                                            start_date= current_query_info['startDate'],
                                            end_date=current_query_info['endDate'],
                                            media_ids=current_query_info['sources'],
                                            tags_ids=current_query_info['collections'])
    return solr_query


def parse_as_sample(search_id_or_query, query_id=None):
    try:
        if isinstance(search_id_or_query, int): # special handling for an indexed query
            sample_search_id = search_id_or_query
            return parse_query_for_sample_search(sample_search_id, query_id)

    except Exception as e:
        logger.warn("error " + str(e))


# yikes - TODO get rid of this function ASAP
# args_or_query - either search-id/index in parameters or in request.args 
# this came from demo url calls versus request.args for custom queries
# this is only called when handling a sample search
def parse_query_with_args_and_sample_search(args_or_query, current_search) :
    # default dates
    one_month_before_now = datetime.datetime.now() - datetime.timedelta(days=30)
    default_start_date = one_month_before_now.strftime("%Y-%m-%d")
    end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    try:
        if isinstance(args_or_query, int): # special handling for an indexed query
            index = int(args_or_query)
        else:
            index = int(args_or_query['index']) if 'index' in args_or_query else None
            query_id = int(args_or_query['query_id']) if 'query_id' in args_or_query else None
        # not using this now, but we could use this as an extra check
        current_query = current_search[index]['q']
        start_date = current_search[index]['startDate']
        end_date = current_search[index]['endDate']
        media_ids = current_search[index]['sources']
        tags_ids = current_search[index]['collections']

        solr_query = concatenate_query_for_solr(solr_seed_query=current_query,
                                                start_date=start_date,
                                                end_date=end_date,
                                                media_ids=media_ids,
                                                tags_ids=tags_ids)

    # we dont have a query_id. Do we have a q param?
    except Exception as e:
        logger.warn("Demo user is querying for a keyword: " + str(e))
        try:
            current_query = int(args_or_query)
        except Exception as e:
            current_query = args_or_query['q'] if 'q' in args_or_query else None

        solr_query = concatenate_query_for_solr(solr_seed_query=current_query,
                                                start_date=start_date,
                                                end_date=end_date,
                                                media_ids=[],
                                                tags_ids=[9139487])

    return solr_query


@cache.cache_on_arguments(function_key_generator=key_generator)
def load_sample_searches():
    json_file = os.path.join(os.path.dirname(__file__), '../..', 'static/data/sample_searches.json')
    # load the sample searches file
    with open(json_file) as json_data:
        d = json.load(json_data)
        return d


def read_sample_searches():
    json_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'static/data'))

    # load the sample searches file
    return send_from_directory(json_dir, 'sample_searches.json', as_attachment=True)


def file_name_for_download(label, type_of_download):
    length_limited_label = label
    if len(label) > 30:
        length_limited_label = label[:30]
    return u'{}-{}'.format(slugify(length_limited_label), type_of_download)
