import logging
from flask import jsonify, request
import flask_login
import json

from server import app
import server.util.csv as csv
import server.util.pushshift as pushshift
from server.util.request import api_error_handler
from server.views.explorer import parse_as_sample,\
    parse_query_with_keywords, load_sample_searches, file_name_for_download, concatenate_query_for_solr,\
    DEFAULT_COLLECTION_IDS, only_queries_reddit, parse_query_dates
import server.views.explorer.apicache as apicache

SAMPLE_SEARCHES = load_sample_searches()
logger = logging.getLogger(__name__)


@app.route('/api/explorer/stories/count.csv', methods=['POST'])
def explorer_story_count_csv():
    filename = 'total-story-count'
    data = request.form
    if 'searchId' in data:
        queries = SAMPLE_SEARCHES[data['searchId']]['queries']
    else:
        queries = json.loads(data['queries'])
    label = " ".join([q['label'] for q in queries])
    filename = file_name_for_download(label, filename)
    # now compute total attention for all results
    story_count_results = []
    for q in queries:
        if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
            start_date, end_date = parse_query_dates(q)
            story_counts = pushshift.reddit_submission_normalized_and_split_story_count(query=q['q'],
                                                                                        start_date=start_date,
                                                                                        end_date=end_date,
                                                                                        subreddits=pushshift.NEWS_SUBREDDITS)
        else:
            solr_q, solr_fq = parse_query_with_keywords(q)
            solr_open_query = concatenate_query_for_solr(solr_seed_query='*', media_ids=q['sources'],
                                                         tags_ids=q['collections'])
            story_counts = apicache.normalized_and_story_count(solr_q, solr_fq, solr_open_query)
        story_count_results.append({
            'query': q['label'],
            'matching_stories': story_counts['total'],
            'total_stories': story_counts['normalized_total'],
            'ratio': float(story_counts['total']) / float(story_counts['normalized_total'])
        })
    props = ['query', 'matching_stories', 'total_stories', 'ratio']
    return csv.stream_response(story_count_results, props, filename)


@app.route('/api/explorer/stories/split-count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_explorer_story_split_count():
    search_id = int(request.args['search_id']) if 'search_id' in request.args else None
    start_date, end_date = parse_query_dates(request.args)
    if only_queries_reddit(request.args):
        results = pushshift.reddit_submission_normalized_and_split_story_count(query=request.args['q'],
                                                                               start_date=start_date, end_date=end_date,
                                                                               subreddits=pushshift.NEWS_SUBREDDITS)
    else:
        # get specific stories by keyword
        if isinstance(search_id, int) and search_id not in [None, -1]:
            solr_q, solr_fq = parse_as_sample(search_id, request.args['index'])
        else:
            solr_q, solr_fq = parse_query_with_keywords(request.args)
        # get all the stories (no keyword) so we can support normalization
        solr_open_query = concatenate_query_for_solr(solr_seed_query='*',
                                                     media_ids=request.args['sources'],
                                                     tags_ids=request.args['collections'])
        results = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)
    return jsonify({'results': results})


@app.route('/api/explorer/demo/stories/split-count', methods=['GET'])
# handles search id query or keyword query
@api_error_handler
def api_explorer_demo_story_split_count():
    search_id = int(request.args['search_id']) if 'search_id' in request.args else None

    if isinstance(search_id, int) and search_id not in [None, -1]:
        solr_q, solr_fq = parse_as_sample(search_id, request.args['index'])
    else:
        start_date, end_date = parse_query_dates(request.args)
        solr_q, solr_fq = parse_query_with_keywords(request.args)
    # why is this call fundamentally different than the cache call???
    solr_open_query = concatenate_query_for_solr(solr_seed_query='*',
                                                 media_ids=[],
                                                 tags_ids=DEFAULT_COLLECTION_IDS)
    results = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)

    return jsonify({'results': results})


@app.route('/api/explorer/stories/split-count.csv', methods=['POST'])
@api_error_handler
def api_explorer_story_split_count_csv():
    filename = 'stories-over-time'
    data = request.form
    if 'searchId' in data:
        filename = filename  # don't have this info + current_query['q']
        q = SAMPLE_SEARCHES[data['index']]
    else:
        q = json.loads(data['q'])
    filename = file_name_for_download(q['label'], filename)
    # now compute total attention for all results
    start_date, end_date = parse_query_dates(q)
    if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
        story_counts = pushshift.reddit_submission_normalized_and_split_story_count(query=q['q'],
                                                                                    start_date=start_date,
                                                                                    end_date=end_date,
                                                                                    subreddits=pushshift.NEWS_SUBREDDITS)
    else:
        solr_q, solr_fq = parse_query_with_keywords(q)
        solr_open_query = concatenate_query_for_solr(solr_seed_query='*', media_ids=q['sources'],
                                                     tags_ids=q['collections'])
        story_counts = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)
    props = ['date', 'count', 'total_count', 'ratio']
    return csv.stream_response(story_counts['counts'], props, filename)


@app.route('/api/explorer/stories/split-count-all.csv', methods=['POST'])
@api_error_handler
def api_explorer_combined_story_split_count_csv():
    filename = 'stories-over-time'
    data = request.form
    if 'searchId' in data:
        filename = filename  # don't have this info + current_query['q']
        queries = SAMPLE_SEARCHES[data['searchId']]['queries']
    else:
        queries = json.loads(data['queries'])
    label = " ".join([q['label'] for q in queries])
    filename = file_name_for_download(label, filename)
    # now compute total attention for all results
    story_count_results = []
    for q in queries:
        start_date, end_date = parse_query_dates(q)
        if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
            story_counts = pushshift.reddit_submission_normalized_and_split_story_count(query=q['q'],
                                                                                        start_date=start_date,
                                                                                        end_date=end_date,
                                                                                        subreddits=pushshift.NEWS_SUBREDDITS)
        else:
            solr_q, solr_fq = parse_query_with_keywords(q)
            solr_open_query = concatenate_query_for_solr(solr_seed_query='*', media_ids=q['sources'],
                                                         tags_ids=q['collections'])
            story_counts = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)
        story_count_results.append({
            'label': q['label'],
            'by_date': story_counts['counts'],
        })
    # now combine them by date
    data = []
    dates = [d['date'] for d in story_count_results[0]['by_date']]
    for idx in range(len(dates)):
        row = {'date': dates[idx]}
        for q in story_count_results:
            row[q['label'] +'-count'] = q['by_date'][idx]['count']
            row[q['label'] +'-total_count'] = q['by_date'][idx]['total_count']
            row[q['label'] +'-ratio'] = q['by_date'][idx]['ratio']
        data.append(row)    
    props = ['date'] + [q['label']+ '-count' for q in queries] + [q['label']+ '-total_count' for q in queries] + [q['label']+ '-ratio' for q in queries]
    return csv.stream_response(data, props, filename)
