from server import mc, TOOL_API_KEY
from server.cache import cache
from server.auth import user_mediacloud_client, user_admin_mediacloud_client
from server.views.explorer import dates_as_filter_query
import server.util.wordembeddings as wordembeddings
from server.util.api_helper import combined_split_and_normalized_counts, add_missing_dates_to_split_story_counts
from server.util.tags import processed_for_entities_query_clause, processed_for_themes_query_clause, is_bad_theme, \
    NYT_LABELS_TAG_SET_ID, CLIFF_ORGS, CLIFF_PEOPLE, GEO_TAG_SET
import server.views.apicache as base_cache
from server.views import TAG_SAMPLE_SIZE, TAG_COUNT_SAMPLE_SIZE


def normalized_and_story_count(q, fq, open_q):
    results = {}
    mc_api_key = base_cache.api_key()
    results['total'] = _cached_total_story_count(mc_api_key, q, fq)['count']
    results['normalized_total'] = _cached_total_story_count(mc_api_key, open_q, fq)['count']
    return results


def normalized_and_story_split_count(q, open_q, start_date, end_date):
    results = {}
    fq = dates_as_filter_query(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
    mc_api_key = base_cache.api_key()
    matching = cached_story_split_count(mc_api_key, q, fq)
    matching = add_missing_dates_to_split_story_counts(matching['counts'], start_date, end_date)
    total = cached_story_split_count(mc_api_key, open_q, fq)
    total = add_missing_dates_to_split_story_counts(total['counts'], start_date, end_date)
    results['counts'] = combined_split_and_normalized_counts(matching, total)
    results['total'] = sum([day['count'] for day in matching])
    results['normalized_total'] = sum([day['count'] for day in total])
    return results


@cache.cache_on_arguments()
def cached_story_split_count(mc_api_key, q, fq):
    local_mc = base_cache.mc_client()
    results = local_mc.storyCount(q, fq, split=True)
    return results


def sentence_list(q, fq=None, rows=1000, include_stories=True):
    # can't cache by user api key here because we need to use tool mc to get sentences (ie. admin only)
    return _cached_sentence_list(TOOL_API_KEY, q, fq, rows, include_stories)


@cache.cache_on_arguments()
def _cached_sentence_list(mc_api_key, q, fq, rows, include_stories=True):
    # need to get an admin client with the tool key so they have sentence read permissions
    tool_mc = user_admin_mediacloud_client(mc_api_key)
    sentences = tool_mc.sentenceList(q, fq, sort=mc.SORT_RANDOM)[:rows]
    stories_id_list = [str(s['stories_id']) for s in sentences]
    if (len(stories_id_list) > 0) and include_stories:
        # this is the fastest way to get a list of stories by id
        stories = user_mediacloud_client().storyList("stories_id:({})".format(" ".join(stories_id_list)))
        stories_by_id = {s['stories_id']: s for s in stories}  # build a quick lookup table by stories_id
        for s in sentences:
            s['story'] = stories_by_id[s['stories_id']]
    return sentences


def top_tags_with_coverage(q, fq, tag_sets_id, limit=TAG_SAMPLE_SIZE):
    tag_counts = _most_used_tags(q, fq, tag_sets_id)
    if int(tag_sets_id) in [GEO_TAG_SET, CLIFF_ORGS, CLIFF_PEOPLE]:
        coverage = _entity_coverage(q, fq)
    elif int(tag_sets_id) == NYT_LABELS_TAG_SET_ID:
        coverage = _theme_coverage(q, fq)
    else:
        raise RuntimeError("Unknown tag_sets_id for computing coverage: {}".format(tag_sets_id))
    for t in tag_counts:  # add in pct of what's been run through CLIFF to total results
        try:
            t['pct'] = float(t['count']) / coverage['counts']
        except ZeroDivisionError:
            t['pct'] = 0
    coverage['results'] = tag_counts[:limit]
    return coverage


def _most_used_tags(q, fq, tag_sets_id):
    # top tags used in stories matching query (pass in None for no limit)
    api_key = base_cache.api_key()
    tags = _cached_most_used_tags(api_key, q, fq, tag_sets_id, TAG_COUNT_SAMPLE_SIZE)
    # extract bogus NYT tags
    for t in tags:
        if is_bad_theme(t['tags_id']):
            tags.remove(t)
    return tags


def _entity_coverage(q, fq):
    return tag_set_coverage(q, '({}) AND {}'.format(q, processed_for_entities_query_clause()), fq)


def _theme_coverage(q, fq):
    return tag_set_coverage(q, '({}) AND {}'.format(q, processed_for_themes_query_clause()), fq)


def tag_set_coverage(total_q, subset_q, fq):
    api_key = base_cache.api_key()
    coverage = {
        'totals': _cached_total_story_count(api_key, total_q, fq)['count'],
        'counts': _cached_total_story_count(api_key, subset_q, fq)['count'],
    }
    coverage['coverage_percentage'] = 0 if coverage['totals'] is 0 else float(coverage['counts'])/float(coverage['totals'])
    return coverage


@cache.cache_on_arguments()
def _cached_most_used_tags(api_key, q, fq, tag_sets_id, sample_size=None):
    # top tags used in stories matching query
    # api_key used for caching at the user level
    local_mc = base_cache.mc_client()
    return local_mc.storyTagCount(q, fq, tag_sets_id=tag_sets_id, limit=sample_size)


def story_count(q, fq):
    api_key = base_cache.api_key()
    return _cached_total_story_count(api_key, q, fq)


@cache.cache_on_arguments()
def _cached_total_story_count(api_key, q, fq):
    # api_key is included to keep the cache at the user-level
    local_mc = base_cache.mc_client()
    count = local_mc.storyCount(q, fq)
    return count


def random_story_list(q, fq, limit):
    return story_list_page(q, fq, stories_per_page=limit, sort=mc.SORT_RANDOM)


def story_list_page(q, fq, last_processed_stories_id=None, stories_per_page=1000, sort=mc.SORT_PROCESSED_STORIES_ID):
    return _cached_story_list_page(base_cache.api_key(), q, fq, last_processed_stories_id, stories_per_page, sort)


@cache.cache_on_arguments()
def _cached_story_list_page(api_key, q, fq, last_processed_stories_id, stories_per_page, sort):
    # be user-specific in this cache to be careful about permissions on stories
    # api_key passed in just to make this a user-level cache
    local_client = base_cache.mc_client()
    return local_client.storyList(q, fq, last_processed_stories_id=last_processed_stories_id, rows=stories_per_page,
                                  sort=sort)


def word_count(q, fq, ngram_size, num_words, sample_size):
    api_key = base_cache.api_key()
    return _cached_word_count(api_key, q, fq, ngram_size, num_words, sample_size)


@cache.cache_on_arguments()
def _cached_word_count(api_key, q, fq, ngram_size, num_words, sample_size):
    local_mc = base_cache.mc_client()
    return local_mc.wordCount(q, fq, ngram_size=ngram_size, num_words=num_words, sample_size=sample_size)


def word2vec_google_2d(words):
    return _cached_word2vec_google_2d(words)


@cache.cache_on_arguments()
def _cached_word2vec_google_2d(words):
    # don't need to be user-level cache here - can be app-wide because results are from another service that doesn't
    # have any concept of permissioning
    word2vec_results = wordembeddings.google_news_2d(words)
    return word2vec_results


def tag_set(tag_sets_id):
    return _cached_tag_set(base_cache.api_key(), tag_sets_id)


@cache.cache_on_arguments()
def _cached_tag_set(api_key, tag_sets_id):
    local_mc = base_cache.mc_client()
    return local_mc.tagSet(tag_sets_id)

