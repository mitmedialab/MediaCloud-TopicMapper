import logging
import datetime
import mediacloud.api
import re


from server import mc
from server.auth import is_user_logged_in
from server.util.csv import SOURCE_LIST_CSV_METADATA_PROPS

logger = logging.getLogger(__name__)

SORT_FACEBOOK = 'facebook'
SORT_TWITTER = 'twitter'
SORT_INLINK = 'inlink'

TOPIC_MEDIA_INFO_PROPS = ['media_id', 'name', 'url']

TOPIC_MEDIA_PROPS = ['story_count', 'media_inlink_count', 'inlink_count', 'outlink_count',
                     'facebook_share_count', 'simple_tweet_count']

TOPIC_MEDIA_CSV_PROPS = TOPIC_MEDIA_INFO_PROPS + TOPIC_MEDIA_PROPS + SOURCE_LIST_CSV_METADATA_PROPS


def validated_sort(desired_sort, default_sort=SORT_FACEBOOK):
    valid_sorts = [SORT_FACEBOOK, SORT_TWITTER, SORT_INLINK]
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


def _parse_media_ids(args):
    media_ids = []
    if 'sources[]' in args:
        src = args['sources[]']
        if isinstance(src, str):
            media_ids = src.split(',')
            media_ids = " ".join([str(m) for m in media_ids])
            src = re.sub(r'\[*\]*', '', str(src))
            if len(src) == 0:
                media_ids = []
            media_ids = src.split(',') if len(src) > 0 else []
        else:
            media_ids = src
    return media_ids


def _parse_collection_ids(args):
    collection_ids = []
    if 'collections[]' in args:
        coll = args['collections[]']
        if isinstance(coll, str):
            tags_ids = coll.split(',')
            tags_ids = " ".join([str(m) for m in tags_ids])
            coll = re.sub(r'\[*\]*', '', str(tags_ids))
            if len(coll) == 0:
                collection_ids = []
            else:
                collection_ids = coll.split(',')  # make a list
        else:
            collection_ids = coll

    return collection_ids


# TODO: Migrate eto use mediapicker.concate!
# helper for topic preview queries
def concatenate_query_for_solr(solr_seed_query=None, media_ids=None, tags_ids=None):
    query = ''
    if solr_seed_query not in [None,'']:
        query = '({})'.format(solr_seed_query)

    if len(media_ids) > 0 or len(tags_ids) > 0:
        if solr_seed_query not in [None,'']:
            query += " AND ("
        else:
            query += "(*) AND ("
        # add in the media sources they specified
        if len(media_ids) > 0:
            media_ids = media_ids.split(',') if isinstance(media_ids, str) else media_ids
            query_media_ids = " ".join(map(str, media_ids))
            query_media_ids = re.sub(r'\[*\]*', '', str(query_media_ids))
            query_media_ids = " media_id:({})".format(query_media_ids)
            query += '(' + query_media_ids + ')'

        if len(media_ids) > 0 and len(tags_ids) > 0:
            query += " OR "
        # add in the collections they specified
        if len(tags_ids) > 0:
            tags_ids = tags_ids.split(',') if isinstance(tags_ids, str) else tags_ids
            query_tags_ids = " ".join(map(str, tags_ids))
            query_tags_ids = re.sub(r'\[*\]*', '', str(query_tags_ids))
            query_tags_ids = " tags_id_media:({})".format(query_tags_ids)
            query += '(' + query_tags_ids + ')'
        query += ')'
    return query


def concatenate_solr_dates(start_date, end_date):
    publish_date = mediacloud.api.MediaCloud.publish_date_query(
        datetime.datetime.strptime(start_date, '%Y-%m-%d').date(),
        datetime.datetime.strptime(end_date, '%Y-%m-%d').date(), True, True)

    return publish_date
