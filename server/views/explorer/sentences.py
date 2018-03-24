import logging
from flask import jsonify, request
import flask_login
from operator import itemgetter
from server import app, mc
from server.auth import user_admin_mediacloud_client
from server.util.request import api_error_handler
import server.views.explorer.apicache as apicache
import server.util.csv as csv
from server.views.explorer import parse_query_with_args_and_sample_search, parse_query_with_keywords, \
    load_sample_searches, parse_as_sample, file_name_for_download
import datetime
import json

logger = logging.getLogger(__name__)


@app.route('/api/explorer/sentences/count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_explorer_sentences_count():
    user_mc = user_admin_mediacloud_client()
    # dates are required as is one collection, how do we handle default for logged in users?
    solr_query = parse_query_with_keywords(request.args)
    sentence_count_result = apicache.sentence_count(solr_query, request.args['start_date'], request.args['end_date'])
    return jsonify(sentence_count_result)


@app.route('/api/explorer/sentences/list', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_explorer_sentences_list():
    solr_query = parse_query_with_keywords(request.args)
    results = apicache.sentence_list(solr_query, rows=10)
    sentences = []
    if 'docs' in results['response']:
        sentences = [s for s in results['response']['docs'] if s['sentence']]
    return jsonify({'results': sentences})


@app.route('/api/explorer/demo/sentences/count', methods=['GET'])
# handles search id query or keyword query
@api_error_handler
def api_explorer_demo_sentences_count():
    one_month_before_now = datetime.datetime.now() - datetime.timedelta(days=30)
    start_date = one_month_before_now.strftime("%Y-%m-%d")
    end_date = datetime.datetime.now().strftime("%Y-%m-%d")

    search_id = int(request.args['search_id']) if 'search_id' in request.args else None
    index = int(request.args['index']) if 'index' in request.args else None

    if isinstance(search_id, int) and search_id not in [None, -1]:
        SAMPLE_SEARCHES = load_sample_searches()
        current_search = SAMPLE_SEARCHES[search_id]['queries']
        solr_query = parse_query_with_args_and_sample_search(request.args, current_search)

        if index < len(current_search): 
            start_date = current_search[index]['startDate']
            end_date = current_search[index]['endDate']
    else:
        solr_query = parse_query_with_keywords(request.args)
    # why is this call fundamentally different than the cache call???
    results = apicache.sentence_count(solr_query, start_date, end_date)
    
    return jsonify(results)


@app.route('/api/explorer/sentences/count.csv', methods=['POST'])
@api_error_handler
def api_explorer_sentence_count_csv():
    filename = u'sentences-over-time'
    data = request.form
    if 'searchId' in data:
        solr_query = parse_as_sample(data['searchId'], data['index'])
        filename = filename  # don't have this info + current_query['q']
        one_month_before_now = datetime.datetime.now() - datetime.timedelta(days=30)
        start_date = one_month_before_now.strftime("%Y-%m-%d")
        end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    else:
        query_object = json.loads(data['q'])
        solr_query = parse_query_with_keywords(query_object)
        filename = file_name_for_download(query_object['label'], filename)
        start_date = query_object['startDate']
        end_date = query_object['endDate']
    # sentence count needs dates to be sent explicitly -TODO check what has priority
    results = apicache.sentence_count(solr_query, start_date, end_date)  # get dates out of query?
    clean_results = [{'date': date, 'sentences': count} for date, count in results['split'].iteritems() if date not in ['gap', 'start', 'end']]
    clean_results = sorted(clean_results, key=itemgetter('date'))
    props = ['date', 'sentences']
    return csv.stream_response(clean_results, props, filename)
