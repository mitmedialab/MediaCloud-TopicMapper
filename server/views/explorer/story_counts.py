import logging
from flask import jsonify, request
import flask_login
import json

from server import app
import server.util.csv as csv
from server.platforms.reddit_pushshift import RedditPushshiftProvider,  NEWS_SUBREDDITS
from server.util.request import api_error_handler
from server.views.explorer import parse_query_with_keywords, file_name_for_download, only_queries_reddit, parse_query_dates
from server.views.media_picker import concatenate_query_for_solr
import server.views.explorer.apicache as apicache

logger = logging.getLogger(__name__)


@app.route('/api/explorer/stories/count.csv', methods=['POST'])
@api_error_handler
@flask_login.login_required
def explorer_story_count_csv():
    filename = 'total-story-count'
    data = request.form
    queries = json.loads(data['queries'])
    label = " ".join([q['label'] for q in queries])
    filename = file_name_for_download(label, filename)
    # now compute total attention for all results
    story_count_results = []
    for q in queries:
        if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
            start_date, end_date = parse_query_dates(q)
            provider = RedditPushshiftProvider()
            story_counts = provider.normalized_count_over_time(query=q['q'],
                                                               start_date=start_date,
                                                               end_date=end_date,
                                                               subreddits=NEWS_SUBREDDITS)
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


@app.route('/api/explorer/stories/split-count', methods=['POST'])
@flask_login.login_required
@api_error_handler
def api_explorer_story_split_count():
    start_date, end_date = parse_query_dates(request.form)
    if only_queries_reddit(request.form):
        provider = RedditPushshiftProvider()
        results = provider.normalized_count_over_time(query=request.form['q'],
                                                      start_date=start_date, end_date=end_date,
                                                      subreddits=NEWS_SUBREDDITS)
    else:
        # get specific stories by keyword
        solr_q, solr_fq = parse_query_with_keywords(request.form)
        # get all the stories (no keyword) so we can support normalization
        solr_open_query = concatenate_query_for_solr(solr_seed_query='*',
                                                     media_ids=request.form['sources'],
                                                     tags_ids=request.form['collections'],
                                                     custom_ids=request.form['searches'])
        results = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)
    return jsonify({'results': results})


@app.route('/api/explorer/stories/split-count.csv', methods=['POST'])
@api_error_handler
@flask_login.login_required
def api_explorer_story_split_count_csv():
    filename = 'stories-over-time'
    data = request.form
    q = json.loads(data['q'])
    filename = file_name_for_download(q['label'], filename)
    # now compute total attention for all results
    start_date, end_date = parse_query_dates(q)
    if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
        provider = RedditPushshiftProvider()
        story_counts = provider.normalized_count_over_time(query=q['q'],
                                                           start_date=start_date,
                                                           end_date=end_date,
                                                           subreddits=NEWS_SUBREDDITS)
    else:
        solr_q, solr_fq = parse_query_with_keywords(q)
        solr_open_query = concatenate_query_for_solr(solr_seed_query='*',
                                                     media_ids=q['sources'],
                                                     tags_ids=q['collections'],
                                                     custom_ids=q['searches'])
        story_counts = apicache.normalized_and_story_split_count(solr_q, solr_open_query, start_date, end_date)
    props = ['date', 'count', 'total_count', 'ratio']
    return csv.stream_response(story_counts['counts'], props, filename)


@app.route('/api/explorer/stories/split-count-all.csv', methods=['POST'])
@api_error_handler
@flask_login.login_required
def api_explorer_combined_story_split_count_csv():
    filename = 'stories-over-time'
    data = request.form
    queries = json.loads(data['queries'])
    label = " ".join([q['label'] for q in queries])
    filename = file_name_for_download(label, filename)
    # now compute total attention for all results
    story_count_results = []
    for q in queries:
        start_date, end_date = parse_query_dates(q)
        if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
            provider = RedditPushshiftProvider()
            story_counts = provider.normalized_count_over_time(query=q['q'],
                                                               start_date=start_date,
                                                               end_date=end_date,
                                                               subreddits=NEWS_SUBREDDITS)
        else:
            solr_q, solr_fq = parse_query_with_keywords(q)
            solr_open_query = concatenate_query_for_solr(solr_seed_query='*', media_ids=q['sources'],
                                                         tags_ids=q['collections'],
                                                     custom_ids=q['searches'])
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
