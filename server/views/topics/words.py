import logging
from flask import request, jsonify
import flask_login

from server import app, TOOL_API_KEY, executor
import server.util.csv as csv
from server.util.request import api_error_handler, arguments_required, filters_from_args, json_error_response
from server.auth import user_mediacloud_key
import server.views.topics.apicache as apicache

logger = logging.getLogger(__name__)

WORD_CONTEXT_SIZE = 5   # for sentence fragments, this is the amount of words before & after that we return
WORD2VEC_TIMESPAN_POOL_PROCESSES = 10


@app.route('/api/topics/<topics_id>/words/subtopic-comparison.csv', methods=['GET'])
@flask_login.login_required
@arguments_required('focal_sets_id')
@api_error_handler
def topic_compare_subtopic_top_words(topics_id):
    snapshots_id, timespans_id, _foci_id, _q = filters_from_args(request.args)
    selected_focal_sets_id = request.args['focal_sets_id']
    word_count = request.args['word_count'] if 'word_count' in request.args else 20
    # first we need to figure out which timespan they are working on
    selected_snapshot_timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id,
                                                                      snapshots_id=snapshots_id)
    selected_timespan = None
    for t in selected_snapshot_timespans:
        if t['timespans_id'] == int(timespans_id):
            selected_timespan = t
    try:
        focal_set = apicache.topic_focal_set(user_mediacloud_key(), topics_id, snapshots_id, selected_focal_sets_id)
    except ValueError:
        return json_error_response('Invalid Focal Set Id')
    timespans = apicache.matching_timespans_in_foci(topics_id, selected_timespan, focal_set['foci'])
    for idx in range(0, len(timespans)):
        data = apicache.topic_word_counts(user_mediacloud_key(), topics_id,
                                          timespans_id=timespans[idx]['timespans_id'])
        focal_set['foci'][idx]['top_words'] = data
    # stitch together the counts to download now
    data = []
    headers = [f['name'] for f in focal_set['foci']]
    for idx in range(0, word_count):
        row = {f['name']: "{} ({})".format(f['top_words'][idx]['term'], f['top_words'][idx]['count'])
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


@app.route('/api/topics/<topics_id>/words/<word>/sample-usage', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_word_usage_sample(_topics_id, word):
    # gotta respect the manual query if there is one
    q = apicache.add_to_user_query('\"{}\"'.format(word))
    # need to use tool API key here because non-admin users can't pull sentences
    results = apicache.topic_sentence_sample(TOOL_API_KEY, sample_size=1000, q=q)
    # only pull the 5 words before and after so we aren't leaking full content to users
    fragments = [_sentence_fragment_around(word, s['sentence']) for s in results if s['sentence'] is not None]
    fragments = [f for f in fragments if f is not None]
    return jsonify({'fragments': fragments})


def _sentence_fragment_around(keyword, sentence):
    """
    Turn a sentence into a sentence fragment, including just the 5 words before and after the keyword we are looking at.
    We do this to enforce our rule that full sentences (even without metadata) never leave our servers).
    Warning: this makes simplistic assumptions about word tokenization
    ::return:: a sentence fragment around keyword, or None if keyword can't be found
    """
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


@app.route('/api/topics/<topics_id>/words/<word>/similar', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_similar_words(topics_id, word):
    results = apicache.topic_similar_words(topics_id, '\"{}\"'.format(word))
    return jsonify(results)


# Helper function for pooling word2vec timespans process
@executor.job
def _grab_timespan_embeddings(job):
    ts_word_counts = apicache.cached_topic_word_counts(job['api_key'], job['topics_id'], num_words=250,
                                                       timespans_id=int(job['timespan']['timespans_id']),
                                                       snapshots_id=job['snapshots_id'],
                                                       foci_id=job['foci_id'],
                                                       q=job['q'])

    # Remove any words not in top words overall
    ts_word_counts = [x for x in ts_word_counts if x['term'] in job['overall_words']]

    # Replace specific timespan embeddings with overall so coordinates are consistent
    for word in ts_word_counts:
        word['w2v_x'] = job['overall_embeddings'][word['term']][0]
        word['w2v_y'] = job['overall_embeddings'][word['term']][1]

    return {'timespan': job['timespan'], 'words': ts_word_counts}


def _get_all_timespan_embeddings(jobs):
    # need to get the generator to actually run and return real data
    results = [item for item in _grab_timespan_embeddings.map(jobs)]
    return results


@app.route('/api/topics/<topics_id>/word2vec-timespans', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_w2v_timespan_embeddings(topics_id):
    snapshots_id, _timespans_id, foci_id, q = filters_from_args(request.args)
    # Retrieve embeddings for overall topic
    overall_word_counts = apicache.topic_word_counts(user_mediacloud_key(), topics_id, num_words=50,
                                                     snapshots_id=snapshots_id, timespans_id=None, foci_id=foci_id, q=q)
    overall_words = [x['term'] for x in overall_word_counts]
    overall_embeddings = {x['term']: (x['google_w2v_x'], x['google_w2v_y']) for x in overall_word_counts}

    # Retrieve top words for each timespan
    timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id, foci_id)

    # Retrieve embeddings for each timespan
    jobs = [{
        'api_key': user_mediacloud_key(),
        'topics_id': topics_id,
        'snapshots_id': snapshots_id,
        'foci_id': foci_id,
        'overall_words': overall_words,
        'overall_embeddings': overall_embeddings,
        'q': q,
        'timespan': t,
    } for t in timespans]
    embeddings_by_timespan = _get_all_timespan_embeddings(jobs)
    return jsonify({'list': embeddings_by_timespan})
