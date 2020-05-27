import datetime as dt
import requests
import json
import collections
from typing import List, Dict
import logging

from server.platforms.provider import ContentProvider, MC_DATE_FORMAT
from server.cache import cache

PS_TWITTER_SEARCH_URL = 'https://twitter-es.pushshift.io/twitter_verified/_search'


class TwitterPushshiftProvider(ContentProvider):

    def __init__(self):
        super(TwitterPushshiftProvider, self).__init__()
        self._logger = logging.getLogger(__name__)

    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20, **kwargs) -> List[Dict]:
        """
        Return a list of verified tweets matching the query.
        :param query:
        :param start_date:
        :param end_date: 
        :param kwargs:
        :return:
        """
        results = self._cached_query(query, start_date, end_date, limit=limit, sort='desc')
        data = []
        if 'hits' in results:
            for obj in results['hits']['hits']:
                tweet = obj['_source']
                data.append(self._tweet_to_row(tweet))
        return data

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        Count how many verified tweets match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        aggs = {
            'time': {
                'date_histogram': {
                    'field': 'created_at',
                    'interval': 'year',
                }
            }
        }
        results = self._cached_query(query, start_date=start_date, end_date=end_date, aggs=aggs)
        buckets = results['aggregations']['time']['buckets']
        data = []
        for d in buckets:
            data.append({
                'date': dt.datetime.fromtimestamp(d['key'] / 1000).strftime(MC_DATE_FORMAT),
                'timestamp': d['key'],
                'count': d['doc_count'],
            })
        return sum([d['count'] for d in data])

    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> Dict:
        """
        How many verified tweets over time match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs: Options: 'subreddits': List[str], period: str (default '1d')
        :return:
        """
        aggs = {
            'time': {
                'date_histogram': {
                    'field': 'created_at',
                    'interval': 'day',
                }
            }
        }
        results = self._cached_query(query, start_date=start_date, end_date=end_date, aggs=aggs)
        buckets = results['aggregations']['time']['buckets']
        data = []
        for d in buckets:
            data.append({
                'date': dt.datetime.fromtimestamp(d['key'] / 1000).strftime(MC_DATE_FORMAT),
                'timestamp': d['key'],
                'count': d['doc_count'],
            })
        return {'counts': data}

    @cache.cache_on_arguments()
    def _cached_query(self, query: str = None, start_date: dt.datetime = None, end_date: dt.datetime = None,
                                  **kwargs) -> Dict:
        """
        Run a generic query against Pushshift.io to retrieve Reddit data
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs: any other params you want to send over the Pushshift as part of your query (sort, limit, aggs)
        :return:
        """
        headers = {'Content-type': 'application/json'}
        q = collections.defaultdict()
        if 'sort' in kwargs:
            q['sort'] = {'created_at': kwargs['sort']}
        if 'limit' in kwargs:
            q['size'] = kwargs['limit']
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
        if 'aggs' in kwargs:
            q['aggs'] = kwargs['aggs']
        r = requests.get(PS_TWITTER_SEARCH_URL, headers=headers, data=json.dumps(q))
        return r.json()

    @classmethod
    def _tweet_to_row(cls, item):
        return {
            'media_name': 'Twitter',
            'media_url': 'https://twitter.com/{}'.format(item['screen_name']),
            'full_link': 'https://twitter.com/{}/status/{}'.format(item['screen_name'], item['id_str']),
            'stories_id': item['id'],
            'title': item['text'],
            'publish_date': dt.datetime.strptime(item['created_at'], '%a %b %d %H:%M:%S %z %Y').strftime(
                MC_DATE_FORMAT),
            'url': 'https://twitter.com/{}/status/{}'.format(item['screen_name'], item['id_str']),
            'last_updated': dt.datetime.fromtimestamp(item['updated_utc']).strftime(
                MC_DATE_FORMAT) if 'updated_utc' in item else None,
            'author': item['screen_name'],
            'language': item['lang'],
            'retweet_count': item['retweet_count'],
            'favorite_count': item['favorite_count'],
        }

