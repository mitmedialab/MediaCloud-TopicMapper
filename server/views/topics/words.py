import logging
from flask import request, jsonify
import flask_login

from server import app, TOOL_API_KEY
from server.views import WORD_COUNT_DOWNLOAD_NUM_WORDS, WORD_COUNT_SAMPLE_SIZE
import server.util.csv as csv
from server.util.request import api_error_handler, arguments_required, filters_from_args
from server.auth import user_mediacloud_key, is_user_logged_in
from server.views.topics.splitstories import stream_topic_split_story_counts_csv
from server.views.topics.stories import stream_story_list_csv
import server.views.topics.apicache as apicache
from server.views.topics import access_public_topic

logger = logging.getLogger(__name__)

WORD_CONTEXT_SIZE = 5   # for sentence fragments, this is the amount of words before & after that we return


@app.route('/api/topics/<topics_id>/words/subtopic-comparison.csv', methods=['GET'])
@flask_login.login_required
@arguments_required('focal_sets_id')
@api_error_handler
def topic_compare_subtopic_top_words(topics_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    selected_focal_sets_id = request.args['focal_sets_id']
    word_count = request.args['word_count'] if 'word_count' in request.args else 20
    # first we need to figure out which timespan they are working on
    selected_snapshot_timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id=snapshots_id)
    selected_timespan = None
    for t in selected_snapshot_timespans:
        if t['timespans_id'] == int(timespans_id):
            selected_timespan = t
    focal_set = apicache.topic_focal_set(user_mediacloud_key(), topics_id, snapshots_id, selected_focal_sets_id)
    timespans = apicache.matching_timespans_in_foci(topics_id, selected_timespan, focal_set['foci'])
    for idx in range(0, len(timespans)):
        data = apicache.topic_word_counts(user_mediacloud_key(), topics_id,
                                          timespans_id=timespans[idx]['timespans_id'])
        focal_set['foci'][idx]['top_words'] = data
    # stitch together the counts to download now
    data = []
    headers = [f['name'] for f in focal_set['foci']]
    for idx in range(0, word_count):
        row = {f['name']: u"{} ({})".format(f['top_words'][idx]['term'], f['top_words'][idx]['count'])
               for f in focal_set['foci']}
        data.append(row)
    return csv.stream_response(data, headers,
                               'topic-{}-subtopic-{}-{}-top-words-comparison'.format(
                                   topics_id, focal_set['name'], selected_focal_sets_id))


@app.route('/api/topics/<topics_id>/words/<word>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word(topics_id, word):
    response = apicache.topic_word_counts(user_mediacloud_key(), topics_id, q=word)[:1]
    return jsonify(response)


@app.route('/api/topics/<topics_id>/words', methods=['GET'])
@api_error_handler
def topic_words(topics_id):
    sample_size = request.args['sample_size'] if 'sample_size' in request.args else WORD_COUNT_SAMPLE_SIZE

    if access_public_topic(topics_id):
        results = apicache.topic_word_counts(TOOL_API_KEY, topics_id, snapshots_id=None, timespans_id=None, foci_id=None, q=None)
    elif is_user_logged_in():
        results = apicache.topic_word_counts(user_mediacloud_key(), topics_id, sample_size=sample_size)[:200]
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})

    totals = []  # important so that these get reset on the client when they aren't requested
    logger.debug(request.args)
    if (is_user_logged_in()) and ('withTotals' in request.args) and (request.args['withTotals'] == "true"):
        # handle requests to return these results
        # and also data to compare it to for the whole topic focus
        totals = apicache.topic_word_counts(user_mediacloud_key(), topics_id, timespans_id=None, q=None, sample_size=sample_size)

    response = {
        'list': results,
        'totals': totals,
        'sample_size': str(sample_size)
    }
    return jsonify(response)


@app.route('/api/topics/<topics_id>/words.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_words_csv(topics_id):
    query = apicache.add_to_user_query(None)
    sample_size = request.args['sample_size'] if 'sample_size' in request.args else WORD_COUNT_SAMPLE_SIZE
    ngram_size = request.args['ngram_size'] if 'ngram_size' in request.args else 1  # default to word count
    word_counts = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, ngram_size=ngram_size, q=query,
                                              num_words=WORD_COUNT_DOWNLOAD_NUM_WORDS, sample_size=sample_size)
    return csv.stream_response(word_counts, apicache.WORD_COUNT_DOWNLOAD_COLUMNS,
                               'topic-{}-sampled-ngrams-{}-word'.format(topics_id, ngram_size))


@app.route('/api/topics/<topics_id>/words/<word>/split-story/count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_split_story_counts(topics_id, word):
    return jsonify(apicache.topic_split_story_counts(user_mediacloud_key(), topics_id, q=word))


@app.route('/api/topics/<topics_id>/words/<word>/split-story/count.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_split_story_counts_csv(topics_id, word):
    return stream_topic_split_story_counts_csv(user_mediacloud_key(), 'word-'+word+'-split-story-counts',
        topics_id, q=word)


@app.route('/api/topics/<topics_id>/words/<word>/stories', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_stories(topics_id, word):
    response = apicache.topic_story_list(user_mediacloud_key(), topics_id, q=word)
    return jsonify(response)


@app.route('/api/topics/<topics_id>/words/<word>/stories.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_stories_csv(topics_id, word):
    return stream_story_list_csv(user_mediacloud_key(), 'word-'+word+'-stories', topics_id)


@app.route('/api/topics/<topics_id>/words/<word>/words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_associated_words(topics_id, word):
    query = apicache.add_to_user_query(word)
    response = apicache.topic_word_counts(user_mediacloud_key(), topics_id, q=query)[:100]
    return jsonify(response)


@app.route('/api/topics/<topics_id>/words/<word>/words.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_associated_words_csv(topics_id, word):
    query = apicache.add_to_user_query(word)
    ngram_size = request.args['ngram_size'] if 'ngram_size' in request.args else 1  # default to word count
    word_counts = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, ngram_size=ngram_size, q=query)
    return csv.stream_response(word_counts, apicache.WORD_COUNT_DOWNLOAD_COLUMNS,
                               'topic-{}-{}-sampled-ngrams-{}-word'.format(topics_id, word, ngram_size))


@app.route('/api/topics/<topics_id>/words/<word>/sample-usage', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_usage_sample(topics_id, word):
    # gotta respect the manual query if there is one
    q = apicache.add_to_user_query(word)
    # need to use tool API key here because non-admin users can't pull sentences
    results = apicache.topic_sentence_sample(TOOL_API_KEY, topics_id, sample_size=1000, q=q)
    # TODO: only pull the 5 words before and after so we
    fragments = [_sentence_fragment_around(word, s['sentence']) for s in results if s['sentence'] is not None]
    fragments = [f for f in fragments if f is not None]
    return jsonify({'fragments': fragments})


def _sentence_fragment_around(keyword, sentence):
    '''
    Turn a sentence into a sentence fragment, including just the 5 words before and after the keyword we are looking at.
    We do this to enforce our rule that full sentences (even without metadata) never leave our servers).
    Warning: this makes simplistic assumptions about word tokenization
    ::return:: a sentence fragment around keyword, or None if keyword can't be found
    '''
    try:
        words = sentence.split()  # super naive, but works ok
        keyword_index = None
        for index, word in enumerate(words):
            if keyword_index is not None:
                continue
            if word.lower().startswith(keyword.replace("*", "").lower()):
                keyword_index = index
        if keyword_index is None:
            return None
        min_word_index = max(0, keyword_index - WORD_CONTEXT_SIZE)
        max_word_index = min(len(words), keyword_index + WORD_CONTEXT_SIZE)
        fragment_words = words[min_word_index:max_word_index]
        return " ".join(fragment_words)
    except ValueError:
        return None


# Can't do this yet because topics/media/list doesn't support q as a parameter :-(
'''
@app.route('/api/topics/<topics_id>/words/<word>/media', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_media(topics_id, word):
    response = topic_media_list(user_mediacloud_key(), topics_id, q=word)
    return jsonify(response)
'''
