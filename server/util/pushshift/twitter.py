import requests
import collections
import json
import datetime as dt

from server.cache import cache
from server.util.pushshift.reddit import DB_TIME_STRING

PS_TWITTER_SEARCH_URL = 'https://twitter-es.pushshift.io/twitter_verified,twitter_verified2/_search'


@cache.cache_on_arguments()
def _cached_query(query, limit=None, sort=None, start_date: dt.datetime = None, end_date: dt.datetime = None, aggs=None):
    headers = {'Content-type': 'application/json'}
    q = collections.defaultdict()
    if sort is not None:
        q['sort'] = {'created_at': sort}
    if limit is not None:
        q['size'] = limit
    q['query'] = {}
    if (start_date is not None) and (end_date is not None):
        q['query']['bool'] = {}
        q['query']['bool']['must'] = [
            {'range': {
                'created_at': {
                    'gte': int(start_date.timestamp()),
                    'lte': int(end_date.timestamp())
                }
            }},
            {'match': {'text': query}}
        ]
    else:
        q['query']['match'] = {'text': query}
    if aggs is not None:
        q['aggs'] = aggs
    r = requests.get(PS_TWITTER_SEARCH_URL, headers=headers, data=json.dumps(q))
    return r.json()


def matching_tweets(query, start_date: dt.datetime = None, end_date: dt.datetime = None, limit=50, sort='desc'):
    results = _cached_query(query, limit, sort, start_date, end_date)
    data = []
    if 'hits' in results:
        for obj in results['hits']['hits']:
            tweet = obj['_source']
            data.append(_tweet_to_row(tweet))
    return data


def tweet_split_count(query, start_date: dt.datetime = None, end_date: dt.datetime = None):
    aggs = {
        'time': {
            'date_histogram': {
                'field': 'created_at',
                'interval': 'day',
            }
        }
    }
    results = _cached_query(query, limit=None, sort=None, start_date=start_date, end_date=end_date, aggs=aggs)
    buckets = results['aggregations']['time']['buckets']
    data = []
    for d in buckets:
        data.append({
            'date': dt.datetime.fromtimestamp(d['key'] / 1000).strftime(DB_TIME_STRING),
            'timestamp': d['key'],
            'count': d['doc_count'],
        })
    return {'counts': data}


def tweet_count(query, start_date: dt.datetime = None, end_date: dt.datetime = None):
    aggs = {
        'time': {
            'date_histogram': {
                'field': 'created_at',
                'interval': 'year',
            }
        }
    }
    results = _cached_query(query, limit=None, sort=None, start_date=start_date, end_date=end_date, aggs=aggs)
    buckets = results['aggregations']['time']['buckets']
    data = []
    for d in buckets:
        data.append({
            'date': dt.datetime.fromtimestamp(d['key'] / 1000).strftime(DB_TIME_STRING),
            'timestamp': d['key'],
            'count': d['doc_count'],
        })
    return sum([d['count'] for d in data])


def _tweet_to_row(item):
    return {
        'media_name': 'Twitter',
        'media_url': 'https://twitter.com/{}'.format(item['screen_name']),
        'full_link': 'https://twitter.com/{}/status/{}'.format(item['screen_name'], item['id_str']),
        'stories_id': item['id'],
        'title': item['text'],
        'publish_date': dt.datetime.strptime(item['created_at'], '%a %b %d %H:%M:%S %z %Y').strftime(DB_TIME_STRING),
        'url': 'https://twitter.com/{}/status/{}'.format(item['screen_name'], item['id_str']),
        'last_updated': dt.datetime.fromtimestamp(item['updated_utc']).strftime(DB_TIME_STRING) if 'updated_utc' in item else None,
        'author': item['screen_name'],
        'language': item['lang'],
        'retweet_count': item['retweet_count'],
        'favorite_count': item['favorite_count'],
    }
