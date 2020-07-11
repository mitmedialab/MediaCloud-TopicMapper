"""
This servers as a cache of basic MC query operations that is available apps. Note that all of these are cached agnostic
to the user (ie. it is a cross-user cache). This is because we don't have visibility permissions at the level of things
like stories, sources, etc.
"""

from server import TOOL_API_KEY
from server.cache import cache
import server.util.wordembeddings as wordembeddings
from server.auth import user_mediacloud_client, user_admin_mediacloud_client, user_is_admin
from server.util.tags import is_bad_theme, NYT_LABELS_TAG_SET_ID


def media(media_id):
    return _cached_media(None, media_id)


def get_media_with_key(mc_api_key, media_id):
    # in Response contexts we can't automatically fetch the user_key from the session, so we have to support
    # a way to pass it in intentionally
    return _cached_media(mc_api_key, media_id)


@cache.cache_on_arguments()
def _cached_media(mc_api_key, media_id):
    # api_key passed in just to make this a user-level cache
    user_mc = user_mediacloud_client(mc_api_key)
    return user_mc.media(media_id)


def collection(tags_id):
    # Yes collections are just tags, but this is a helpful convenience method included to make the code more readable
    return _cached_tag(tags_id)


def tag(tags_id):
    return _cached_tag(tags_id)


@cache.cache_on_arguments()
def _cached_tag(tags_id):
    user_mc = user_mediacloud_client()
    return user_mc.tag(tags_id)


def story_count(q, fq, **kwargs):
    # post it so long queries work
    return _cached_story_count(q, fq, http_method='POST', **kwargs)


@cache.cache_on_arguments()
def _cached_story_count(q, fq, **kwargs):
    # api_key passed in to make this a user-level cache
    user_mc = user_mediacloud_client()
    return user_mc.storyCount(solr_query=q, solr_filter=fq,  **kwargs)


def word_count(q, fq, **kwargs):
    # post it so long queries work
    return _cached_word_count(q, fq, http_method='POST', **kwargs)


@cache.cache_on_arguments()
def _cached_word_count(q, fq, **kwargs):
    # api_key passed in just to make this a user-level cache
    user_mc = user_mediacloud_client()
    return user_mc.wordCount(solr_query=q, solr_filter=fq,  **kwargs)


def story(stories_id, **kwargs):
    return _cached_story(None, stories_id, **kwargs)


def story_raw_1st_download(api_key, stories_id):
    cached_story = _cached_story(api_key, stories_id, raw_1st_download=True)
    return cached_story['raw_first_download_file']


@cache.cache_on_arguments()
def _cached_story(api_key, stories_id, **kwargs):
    user_mc = user_admin_mediacloud_client(api_key) if (user_is_admin() or api_key == TOOL_API_KEY) else user_mediacloud_client(api_key)
    return user_mc.story(stories_id, **kwargs)


def word2vec_google_2d(words):
    return _cached_word2vec_google_2d(words)


@cache.cache_on_arguments()
def _cached_word2vec_google_2d(words):
    # don't need to be user-level cache here - can be app-wide because results are from another service that doesn't
    # have any concept of permissioning
    word2vec_results = wordembeddings.google_news_2d(words)
    return word2vec_results


def tag_set(tag_sets_id):
    return _cached_tag_set(tag_sets_id)


@cache.cache_on_arguments()
def _cached_tag_set(tag_sets_id):
    user_mc = user_mediacloud_client()
    return user_mc.tagSet(tag_sets_id)


def top_tags(q, fq, tag_sets_id, sample_size=None):
    # top tags used in stories matching query (pass in None for no limit)
    tags = _cached_top_tags(q, fq, tag_sets_id, sample_size)
    # extract bogus NYT tags that we created in the wrong set a long time ago
    if tag_sets_id == NYT_LABELS_TAG_SET_ID:
        for t in tags:
            if is_bad_theme(t['tags_id']):
                tags.remove(t)
    return tags


@cache.cache_on_arguments()
def _cached_top_tags(q, fq, tag_sets_id, sample_size=None):
    # post it so long queries work
    user_mc = user_mediacloud_client()
    return user_mc.storyTagCount(q, fq, tag_sets_id=tag_sets_id, limit=sample_size, http_method='POST')


def story_list(api_key, q, fq, **kwargs):
    # Need to support API key here because we use this in Response contexts, where we can't fetch the API key out of the
    # session. Also post it so long queries work
    return _cached_story_list(api_key, q, fq, http_method='POST', **kwargs)


@cache.cache_on_arguments()
def _cached_story_list(api_key, q, fq, **kwargs):
    user_mc = user_mediacloud_client(api_key)
    return user_mc.storyList(q, fq,  **kwargs)


def tag_set_coverage(total_q, subset_q, fq):
    coverage = {
        'totals': story_count(total_q, fq)['count'],
        'counts': story_count(subset_q, fq)['count'],
    }
    coverage['coverage_percentage'] = 0 if coverage['totals'] == 0 else float(coverage['counts'])/float(coverage['totals'])
    return coverage


def tag_list(**kwargs):
    return cached_tag_list(**kwargs)


@cache.cache_on_arguments()
def cached_tag_list(**kwargs):
    user_mc = user_mediacloud_client()
    return user_mc.tagList(**kwargs)


def stats():
    return cached_stats()


@cache.cache_on_arguments()
def cached_stats():
    user_mc = user_mediacloud_client()
    return user_mc.stats()
