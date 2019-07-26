from deco import concurrent, synchronized
from collections import defaultdict
import datetime as dt
import requests
import json

from server.cache import cache
from server.util.api_helper import combined_split_and_normalized_counts

DB_TIME_STRING = "%Y-%m-%d %H:%M:%S"

NEWS_SUBREDDITS = ['politics', 'worldnews', 'news', 'conspiracy', 'Libertarian', 'TrueReddit', 'Conservative',
                   'offbeat']


@cache.cache_on_arguments()
def _cached_submission_search(**kwargs):
    r = requests.get('http://api.pushshift.io/reddit/submission/search', params=kwargs)
    return r.json()


def _url_submission_count(start_date: dt.datetime = None, end_date: dt.datetime = None,
                          q: str = None, subreddit: list = None, url: str = None):
    try:
        params = {
            'limit': 10,
            'metadata': True,
        }
        if start_date:
            params['after'] = int(start_date.timestamp())
        if end_date:
            params['before'] = int(end_date.timestamp())
        if url:
            params['url'] = _sanitize_url_for_reddit(url)
        if q:
            params['q'] = q
        if subreddit:
            params['subreddit'] = subreddit
        results = _cached_submission_search(params)
        return results['metadata']['total_results']
    except json.decoder.JSONDecodeError:
        return None


def _sanitize_url_for_reddit(url):
    return url.split('?')[0]


# total shares of a URL on reddit
@concurrent
def _submission_count_worker(url: str, start_date: dt.datetime, end_date: dt.datetime):
    return _url_submission_count(url=url, start_date=start_date, end_date=end_date)


@synchronized
def reddit_url_submission_counts(stories: list, start_date: dt.datetime, end_date: dt.datetime):
    results = defaultdict(dict)
    for s in stories:
        results[s['stories_id']] = _submission_count_worker(s['url'], start_date, end_date)
    return results


def reddit_submissions_count(query: str, start_date: dt.datetime, end_date: dt.datetime, subreddits=None):
    return _url_submission_count(subreddit=subreddits, q=query, start_date=start_date, end_date=end_date)


def reddit_url_submissions_by_subreddit(url: str, start_date: dt.datetime = None, end_date: dt.datetime = None):
    params = {
        'url': _sanitize_url_for_reddit(url),
        'after': int(start_date.timestamp()) if start_date else None,
        'before': int(end_date.timestamp()) if end_date else None,
        'aggs': 'subreddit',
    }
    data = _cached_submission_search(**params)
    results = []
    for d in data['aggs']['subreddit']:
        results.append({
            'name': d['key'],
            'value': d['doc_count'],
        })
    return results


def reddit_submissions_split_count(query: str, start_date: dt.datetime, end_date: dt.datetime,
                                   subreddits=None, period='1d'):
    data = _cached_submission_search(q=query, subreddit=subreddits,
                                     after=int(start_date.timestamp()), before=int(end_date.timestamp()),
                                     aggs='created_utc', frequency=period)
    # make the results match the format we use for stories/count in the Media Cloud API
    results = []
    for d in data['aggs']['created_utc']:
        results.append({
            'date': dt.datetime.fromtimestamp(d['key']).strftime(DB_TIME_STRING),
            'count': d['doc_count'],
        })
    return results


def reddit_submission_normalized_and_split_story_count(query, start_date, end_date, subreddits=None):
    split_count = reddit_submissions_split_count(query, start_date, end_date, subreddits=subreddits)
    matching_total = sum([d['count'] for d in split_count])
    split_count_without_query = reddit_submissions_split_count('', start_date, end_date, subreddits=subreddits)
    no_query_total = sum([d['count'] for d in split_count_without_query])
    return {
        'counts': combined_split_and_normalized_counts(split_count, split_count_without_query),
        'total': matching_total,
        'normalized_total': no_query_total,
    }


def _reddit_submission_to_row(item):
    return {
        'media_name': '/r/{}'.format(item['subreddit']),
        'media_url': item['full_link'],
        'full_link': item['full_link'],
        'stories_id': item['id'],
        'title': item['title'],
        'publish_date': dt.datetime.fromtimestamp(item['created_utc']).strftime(DB_TIME_STRING),
        'url': item['url'],
        'score': item['score'],
        'last_updated': dt.datetime.fromtimestamp(item['updated_utc']).strftime(DB_TIME_STRING),
        'author': item['author'],
        'subreddit': item['subreddit']
    }


@cache.cache_on_arguments()
def _cached_reddit_submissions(**kwargs):
    results = _cached_submission_search(**kwargs)
    cleaned_data = []
    try:
        for row in results['data']:
            item_data = _reddit_submission_to_row(row)
            cleaned_data.append(item_data)
    except StopIteration:
        # not really a problem, just an indication that we have less than kwargs['limit'] results
        pass
    return cleaned_data


def reddit_top_submissions(query, start_date, end_date, subreddits=None, limit=20):
    data = _cached_reddit_submissions(q=query, subreddit=subreddits,
                                      after=int(start_date.timestamp()), before=int(end_date.timestamp()),
                                      limit=limit, sort='desc', sort_type='score')
    return data
