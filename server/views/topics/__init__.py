import logging
from server import mc
from server.auth import is_user_logged_in, user_admin_mediacloud_client
import datetime

logger = logging.getLogger(__name__)

SORT_FACEBOOK = 'facebook'
SORT_TWITTER = 'twitter'
SORT_INLINK = 'inlink'

TOPICS_TEMPLATE_PROPS = ['media_id', 'name', 'url', 'story_count',
                         'media_inlink_count', 'sum_media_inlink_count', 'inlink_count',
                         'outlink_count', 'facebook_share_count',
                         'pub_country', 'pub_state', 'primary_language', 'subject_country']


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


# helper for topic preview queries
def concatenate_query_for_solr(solr_seed_query, start_date, end_date, media_ids, tags_ids):
    query = u'({})'.format(solr_seed_query)

    if len(media_ids) > 0 or len(tags_ids) > 0:
        query += u" AND ("
        # add in the media sources they specified
        if len(media_ids) > 0:
            query_media_ids = u" ".join(map(str, media_ids))
            query_media_ids = u" media_id:({})".format(query_media_ids)
            query += u'(' + query_media_ids + u')'

        if len(media_ids) > 0 and len(tags_ids) > 0:
            query += u" OR "
        # add in the collections they specified
        if len(tags_ids) > 0:
            query_tags_ids = u" ".join(map(str, tags_ids))
            query_tags_ids = u" tags_id_media:({})".format(query_tags_ids)
            query += u'(' + query_tags_ids + u')'
        query += u')'

    if start_date:
        query += u" AND (+" + concatenate_query_and_dates(start_date, end_date) + u")"

    return query


def concatenate_query_and_dates(start_date, end_date):
    user_mc = user_admin_mediacloud_client()
    publish_date = user_mc.publish_date_query(datetime.datetime.strptime(start_date, '%Y-%m-%d').date(),
                                              datetime.datetime.strptime(end_date, '%Y-%m-%d').date())

    return publish_date
