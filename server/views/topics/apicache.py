import logging
from flask import request
from datetime import datetime

from server import mc, TOOL_API_KEY
from server.views import WORD_COUNT_SAMPLE_SIZE, WORD_COUNT_UI_NUM_WORDS
from server.cache import cache, key_generator
from server.util.tags import STORY_UNDATEABLE_TAG
import server.util.wordembeddings as wordembeddings
from server.auth import user_mediacloud_client, user_admin_mediacloud_client, user_mediacloud_key, is_user_logged_in
from server.util.request import filters_from_args
from server.views.topics import validated_sort, access_public_topic
from server.util.api_helper import add_missing_dates_to_split_story_counts

logger = logging.getLogger(__name__)

WORD_COUNT_DOWNLOAD_COLUMNS = ['term', 'stem', 'count', 'sample_size', 'ratio']


def topic_media_list(user_mc_key, topics_id, **kwargs):
    '''
    Return sorted media list based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sort': validated_sort(request.args.get('sort')),
        'limit': request.args.get('limit'),
        'link_id': request.args.get('linkId'),
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_media_list_with_metadata(user_mc_key, topics_id, **merged_args)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_media_list_with_metadata(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_media_list instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_mediacloud_client()
    return local_mc.topicMediaList(topics_id, **kwargs)


def topic_story_count(user_mc_key, topics_id, **kwargs):
    '''
    Return filtered story count within topic.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    # logger.info("!!!!!"+str(merged_args['timespans_id']))
    return _cached_topic_story_count(user_mc_key, topics_id, **merged_args)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_story_count(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_story_count instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicStoryCount(topics_id, **kwargs)


def story_list(user_mc_key, q, rows):
    return _cached_story_list(user_mc_key, q, rows)


def _cached_story_list(user_mc_key, q, rows):
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client(user_mc_key)
    return local_mc.storyList(q, rows=rows)


def topic_story_list(user_mc_key, topics_id, **kwargs):
    '''
    Return sorted story list based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sort': validated_sort(request.args.get('sort')),
        'limit': request.args.get('limit'),
        'link_id': request.args.get('linkId'),
    }

    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    results = _cached_topic_story_list(user_mc_key, topics_id, **merged_args)
    if merged_args['limit']:    # TODO: remove this (force limit as workaround to back-end bug)
        results['stories'] = results['stories'][:int(merged_args['limit'])]
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_story_list(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_story_list instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = _mc_client(user_mc_key)
    return local_mc.topicStoryList(topics_id, **kwargs)


def topic_story_list_by_page(user_mc_key, topics_id, link_id, **kwargs):
    return _cached_topic_story_list_page(user_mc_key, topics_id, link_id, **kwargs)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_story_list_page(user_mc_key, topics_id, link_id, **kwargs):
    # be user-specific in this cache to be careful about permissions on stories
    # api_key passed in just to make this a user-level cache
    local_mc = _mc_client(user_mc_key)
    return local_mc.topicStoryList(topics_id, link_id=link_id, **kwargs)


def get_media(user_mc_key, media_id):
    return _cached_media(user_mc_key, media_id)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_media(user_mc_key, media_id):
    # api_key passed in just to make this a user-level cache
    mc_client = _mc_client(user_mc_key)
    return mc_client.media(media_id)


def topic_ngram_counts(user_mc_key, topics_id, ngram_size, q, num_words=WORD_COUNT_UI_NUM_WORDS, sample_size=WORD_COUNT_SAMPLE_SIZE):
    word_counts = topic_word_counts(user_mediacloud_key(), topics_id,
                                    q=q, ngram_size=ngram_size, num_words=num_words, sample_size=sample_size)
    # add in normalization
    for w in word_counts:
        w['sample_size'] = sample_size
        w['ratio'] = float(w['count']) / float(WORD_COUNT_SAMPLE_SIZE)
    return word_counts


def topic_word_counts(user_mc_key, topics_id, **kwargs):
    '''
    Return sampled word counts based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sample_size': WORD_COUNT_SAMPLE_SIZE,
        'num_words': WORD_COUNT_UI_NUM_WORDS
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    word_data = _cached_topic_word_counts(user_mc_key, topics_id, **merged_args)
    words = [w['term'] for w in word_data]
    # and now add in word2vec model position data
    google_word2vec_data = _cached_word2vec_google_2d_results(words)
    for i in range(len(google_word2vec_data)):
        word_data[i]['google_w2v_x'] = google_word2vec_data[i]['x']
        word_data[i]['google_w2v_y'] = google_word2vec_data[i]['y']
    topic_word2vec_data = _word2vec_topic_2d_results(topics_id, snapshots_id, words)
    for i in range(len(topic_word2vec_data)):
        word_data[i]['w2v_x'] = topic_word2vec_data[i]['x']
        word_data[i]['w2v_y'] = topic_word2vec_data[i]['y']
    return word_data


def _word2vec_topic_2d_results(topics_id, snapshots_id, words):
    # can't cache this because the first time it is called we usually don't have results
    word2vec_results = wordembeddings.topic_2d(topics_id, snapshots_id, words)
    return word2vec_results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_word2vec_google_2d_results(words):
    word2vec_results = wordembeddings.google_news_2d(words)
    return word2vec_results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_word_counts(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_word_counts instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicWordCount(topics_id, **kwargs)


def topic_split_story_counts(user_mc_key, topics_id, **kwargs):
    '''
    Return setence counts over timebased on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    timespan = topic_timespan(topics_id, snapshots_id, foci_id, timespans_id)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'fq': timespan['fq']
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    # and make sure to ignore undateable stories
    undateable_query_part = "-(tags_id_stories:{})".format(STORY_UNDATEABLE_TAG)   # doesn't work if the query includes parens!!!
    if (merged_args['q'] is not None) and (len(merged_args['q']) > 0):
        merged_args['q'] = "(({}) AND {})".format(merged_args['q'], undateable_query_part)
    else:
        merged_args['q'] = "* AND {}".format(undateable_query_part)
    results = _cached_topic_split_story_counts(user_mc_key, topics_id, **merged_args)
    results['counts'] = add_missing_dates_to_split_story_counts(results['counts'],
                                                      datetime.strptime(timespan['start_date'], mc.SENTENCE_PUBLISH_DATE_FORMAT),
                                                      datetime.strptime(timespan['end_date'], mc.SENTENCE_PUBLISH_DATE_FORMAT))
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_split_story_counts(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_split_story_counts instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()

    results = local_mc.topicStoryCount(topics_id,
        split=True,
        **kwargs)
    total_stories = 0
    for c in results['counts']:
        total_stories += c['count']
    results['total_story_count'] = total_stories
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def topic_foci_list(user_mc_key, topics_id, focal_sets_id):
    # This needs user_mc_key in the function signature to make sure the caching is keyed correctly.
    user_mc = user_admin_mediacloud_client()
    response = user_mc.topicFociList(topics_id, focal_sets_id)
    return response


@cache.cache_on_arguments(function_key_generator=key_generator)
def topic_focal_sets(user_mc_key, topics_id, snapshots_id):
    # This needs user_mc_key in the function signature to make sure the caching is keyed correctly.
    user_mc = user_admin_mediacloud_client()
    response = user_mc.topicFocalSetList(topics_id, snapshots_id=snapshots_id)
    return response


@cache.cache_on_arguments(function_key_generator=key_generator)
def topic_focal_set(user_mc_key, topics_id, snapshots_id, focal_sets_id):
    all_focal_sets = topic_focal_sets(user_mc_key, topics_id, snapshots_id)
    for fs in all_focal_sets:
        if int(fs['focal_sets_id']) == int(focal_sets_id):
            return fs
    return None


@cache.cache_on_arguments(function_key_generator=key_generator)
def cached_topic_timespan_list(user_mc_key, topics_id, snapshots_id=None, foci_id=None):
    # this includes the user_mc_key as a first param so the cache works right
    user_mc = user_admin_mediacloud_client()
    timespans = user_mc.topicTimespanList(topics_id, snapshots_id=snapshots_id, foci_id=foci_id)
    return timespans


def topic_tag_coverage(topics_id, tags_id):
    '''
    Useful for seeing how many stories in the topic are tagged with a specific tag
    '''
    if isinstance(tags_id, list):   # doesn't repect duck-typing, but quick fix
        tags_id_str = "({})".format(" ".join([str(tid) for tid in tags_id]))
    else:
        tags_id_str = str(tags_id)
    # respect any query filter the user has set
    query_with_tag = add_to_user_query("tags_id_stories:{}".format(tags_id_str))
    # now get the counts
    if access_public_topic(topics_id):
        total = topic_story_count(TOOL_API_KEY, topics_id)
        tagged = topic_story_count(TOOL_API_KEY, topics_id, q=query_with_tag)  # force a count with just the query
    elif is_user_logged_in():
        total = topic_story_count(user_mediacloud_key(), topics_id)
        tagged = topic_story_count(user_mediacloud_key(), topics_id, q=query_with_tag)   # force a count with just the query
    else:
        return None
    return {'counts': {'count': tagged['count'], 'total': total['count']}}


def topic_tag_counts(user_mc_key, topics_id, tag_sets_id, sample_size=None):
    '''
    Get a breakdown of the most-used tags within a set within a single timespan.
     This supports just timespan_id and q from the request, because it has to use sentenceFieldCount,
     not a topicSentenceFieldCount method that takes filters (which doesn't exit)
    '''
    # return [] # SUPER HACK!
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    timespan_query = "timespans_id:{}".format(timespans_id)
    if (q is None) or (len(q) == 0):
        query = timespan_query
    else:
        query = "({}) AND ({})".format(q, timespan_query)
    return _cached_topic_tag_counts(user_mc_key, topics_id, tag_sets_id, sample_size, query)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_tag_counts(user_mc_key, topics_id, tag_sets_id, sample_size, query):
    user_mc = user_mediacloud_client()
    # we don't need ot use topics_id here because the timespans_id is in the query argument
    tag_counts = user_mc.storyTagCount(query, tag_sets_id=tag_sets_id)
    # add in the pct so we can show relative values within the sample
    return tag_counts


def topic_sentence_sample(user_mc_key, topics_id, sample_size=1000, **kwargs):
    '''
    Return a sample of sentences based on the filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_sentence_sample(user_mc_key, topics_id, sample_size, **merged_args)


@cache.cache_on_arguments(function_key_generator=key_generator)
def _cached_topic_sentence_sample(user_mc_key, topics_id, sample_size=1000, **kwargs):
    '''
    Internal helper - don't call this; call topic_sentence_sample instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly. It includes topics_id in the method
    signature to make sure caching works reasonably.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()

    sentences = local_mc.sentenceList(kwargs['q'], "timespans_id:{}".format(kwargs['timespans_id']),
                                     rows=sample_size, sort=local_mc.SORT_RANDOM)
    return sentences


def topic_timespan(topics_id, snapshots_id, foci_id, timespans_id):
    '''
    No timespan/single end point, so we need a helper to do it
    :param snapshots_id:
    :param timespans_id:
    :param foci_id:
    :return: info about one timespan as specified
    '''
    timespans_list = cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id, foci_id)
    matching_timespans = [t for t in timespans_list if t['timespans_id'] == int(timespans_id)]
    if len(matching_timespans) is 0:
        raise ValueError("Unknown timespans_id {}".format(timespans_id))
    # set up a date query clase we can use in other places
    timespan = matching_timespans[0]
    start_date = timespan['start_date'].split(" ")
    end_date = timespan['end_date'].split(" ")
    timespan['fq'] = "publish_day:[{}T{}Z TO {}T{}Z]".format(start_date[0], start_date[1], end_date[0], end_date[1])
    return timespan


def add_to_user_query(query_to_add):
    q_from_request = request.args.get('q')
    if (query_to_add is None) or (len(query_to_add) == 0):
        return q_from_request
    if (q_from_request is None) or (len(q_from_request) == 0):
        return query_to_add
    return "({}) AND ({})".format(q_from_request, query_to_add)


def _api_key():
    api_key = user_mediacloud_key() \
        if is_user_logged_in() else TOOL_API_KEY
    return api_key


def _mc_client(user_mc_key):
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client(user_mc_key)
    return local_mc


'''
For cross-subtopic analysis within a subtopic set, we need to identify the timespan that has the same date
range in each subtopic within the set.  This helper does that annoying work for you. 
'''
def matching_timespans_in_foci(topics_id, timespan_to_match, foci):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    timespans = []
    for focus in foci:
        # find the matching timespan within this focus
        snapshot_timespans = cached_topic_timespan_list(user_mediacloud_key(), topics_id,
                                                        snapshots_id=snapshots_id, foci_id=focus['foci_id'])
        timespan = _matching_timespan(timespan_to_match, snapshot_timespans)
        timespans.append(timespan)
#        if timespan is None:
#            return json_error_response('Couldn\'t find a matching timespan in the '+focus.name+' focus')
    return timespans


def _matching_timespan(timespan_to_match, timespans_to_search):
    match = None
    for t in timespans_to_search:
        if is_timespans_match(t, timespan_to_match):
            match = t
    return match


def is_timespans_match(timespan1, timespan2):
    '''
    Useful to compare two timespans from different subtopics
    :return: true if they match, false if they don't
    '''
    match = (timespan1['start_date'] == timespan2['start_date']) \
            and (timespan1['end_date'] == timespan2['end_date']) \
            and (timespan1['period'] == timespan2['period'])
    return match