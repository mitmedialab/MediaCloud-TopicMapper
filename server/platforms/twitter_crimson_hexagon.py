import datetime as dt
import requests
from operator import itemgetter
from typing import List, Dict
import logging

from server.platforms.provider import ContentProvider, MC_DATE_FORMAT
from server.cache import cache

CRIMSON_HEXAGON_BASE_URL = 'https://api.crimsonhexagon.com/api/monitor/'
CRIMSON_HEXAGON_DATE_FORMAT = '%Y-%m-%d'


class TwitterCrimsonHexagonProvider(ContentProvider):

    def __init__(self, api_key):
        super(TwitterCrimsonHexagonProvider, self).__init__()
        self._logger = logging.getLogger(__name__)
        self._api_key = api_key

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        The number of tweets in the  monitor.
        :param query: ignored
        :param start_date: ignored in favor of the monitor's start/end dates
        :param end_date: ignored in favor of the monitor's start/end dates
        :param kwargs: monitor_id
        :return:
        """
        params = {
            'id': kwargs['monitor_id'],
            'groupBy': 'DAILY',
        }
        monitor_start, monitor_end = self._monitor_dates(kwargs['monitor_id'])
        results = self._cached_query('volume', monitor_start, monitor_end, params)
        return results['numberOfDocuments']

    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> Dict:
        """
        The number of tweets in the  monitor, broken out by day.
        :param query: ignored
        :param start_date: ignored in favor of the monitor's start/end dates
        :param end_date: ignored in favor of the monitor's start/end dates
        :param kwargs: monitor_id
        :return:
        """
        params = {
            'id': kwargs['monitor_id'],
            'groupBy': 'DAILY',
        }
        monitor_start, monitor_end = self._monitor_dates(kwargs['monitor_id'])
        results = self._cached_query('volume', monitor_start, monitor_end, params)
        data = []
        for d in results['volume']:
            item_start_date = dt.datetime.strptime(d['startDate'][:10], CRIMSON_HEXAGON_DATE_FORMAT)
            data.append({
                'date': item_start_date.strftime(MC_DATE_FORMAT),
                'timestamp': item_start_date.timestamp(),
                'count': d['numberOfDocuments'],
            })
        return {'counts': data}

    def words(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 100, **kwargs) -> List[Dict]:
        """
        The top words in tweets in the monitor.
        :param query: ignored
        :param start_date: ignored in favor of the monitor's start/end dates
        :param end_date: ignored in favor of the monitor's start/end dates
        :param limit:
        :param kwargs: monitor_id
        :return:
        """
        params = {
            'id': kwargs['monitor_id'],
        }
        monitor_start, monitor_end = self._monitor_dates(kwargs['monitor_id'])
        results = self._cached_query('wordcloud', monitor_start, monitor_end, params)
        data = []
        for term, freq in results['data'].items():
            data.append({
                'count': freq,
                'stem': term,
                'term': term,
            })
        data = sorted(data, key=itemgetter('count'), reverse=True)
        return data[:limit]

    @cache.cache_on_arguments()
    def _monitor_details(self, monitor_id) -> Dict:
        """
        Fetch the basic metadata about the monior the user wants to import from.
        :param monitor_id:
        :return:
        """
        monitor = self._cached_query('detail', None, None, {'id': monitor_id})
        return monitor

    def _monitor_dates(self, monitor_id) -> (str, str):
        """
        We need to use the monitor dates for all the preview information, because if we pass in the topic
        dates then their API throws an error saying there is a mismatch. This can happen when a topic has a larger
        date range than the monitor did. We are OK to use their dates because on the back-end we just import *all* the
        content in the monitor (it doesn't filter by the dates of the topic).
        :param monitor_id:
        :return:
        """
        monitor = self._monitor_details(monitor_id)
        return monitor['resultsStart'], monitor['resultsEnd']

    @cache.cache_on_arguments()
    def _cached_query(self, url, start_date: str, end_date: str, params: Dict) -> Dict:
        """
        :param url:
        :param start_date: the monitor's start date
        :param end_date: the monitor's end date
        :param params: should one item, called 'id' that is the monitor's id
        :return:
        """
        headers = {'Content-type': 'application/json'}
        params['auth'] = self._api_key
        if start_date is not None:
            params['start'] = start_date
        if end_date is not None:
            params['end'] = end_date
        r = requests.get(CRIMSON_HEXAGON_BASE_URL+url, headers=headers, params=params)
        return r.json()

    @classmethod
    def _tweet_to_row(cls, item):
        return {
            'media_name': 'Twitter',
            'media_url': '/'.join(item['url'].split('/')[:4]),
            'full_link': item['url'],
            'stories_id': item['url'].split('/')[-1],
            'title': item['title'],
            'publish_date': 'unknown',
            'url': item['url'],
            'last_updated': 'unknown',
            'author': item['url'].split('/')[3],
            'language': item['language'],
            'retweet_count': '?',
            'favorite_count': '?',
        }
