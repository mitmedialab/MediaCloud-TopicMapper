import logging
from flask import jsonify, request
import flask_login
from server import app
from server.util.request import api_error_handler
import server.views.explorer.apicache as apicache
from server.platforms.reddit_pushshift import RedditPushshiftProvider,  NEWS_SUBREDDITS
from server.views.explorer import parse_query_with_keywords, only_queries_reddit, parse_query_dates

logger = logging.getLogger(__name__)

WORD_CONTEXT_SIZE = 5   # for sentence fragments, this is the amount of words before & after that we return


@app.route('/api/explorer/sentences/list', methods=['POST'])
@flask_login.login_required
@api_error_handler
def api_explorer_sentences_list():
    around_word = 'word' in request.form
    if only_queries_reddit(request.form):
        start_date, end_date = parse_query_dates(request.form)
        provider = RedditPushshiftProvider()
        results = provider.samples(query=request.args['q'], start_date=start_date, end_date=end_date,
                                   subreddits=NEWS_SUBREDDITS)
        results = [{
            'sentence': r['title'],
            'publish_date': r['publish_date'],
            'story': r,
        } for r in results]
    else:
        solr_q, solr_fq = parse_query_with_keywords(request.form)
        # so we can support large samples or just a few to show
        rows = int(request.form['rows']) if 'rows' in request.form else 10
        results = apicache.sentence_list(solr_q, solr_fq, rows=rows, include_stories=(not around_word))
    if around_word:
        word = request.form['word']
        results = [_sentence_fragment_around(word, s['sentence']) for s in results if s['sentence'] is not None]
        results = [s for s in results if s is not None]
    return jsonify({'results': results})


def _sentence_fragment_around(keyword, sentence):
    """
    Turn a sentence into a sentence fragment, including just the 5 words before and after the keyword we are looking at.
    We do this to enforce our rule that full sentences (even without metadata) never leave our servers).
    Warning: this makes simplistic assumptions about word tokenization
    :return: a sentence fragment around keyword, or None if keyword can't be found
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
