from collections import defaultdict
import datetime as dt
import requests
from typing import List, Dict
import logging

from server.platforms.provider import ContentProvider, MC_DATE_FORMAT
from server.cache import cache
from server.util.dates import unix_to_solr_date

PS_REDDIT_SEARCH_URL = 'https://api.pushshift.io/reddit/submission/search/?'

NEWS_SUBREDDITS = ['politics', 'worldnews', 'news', 'conspiracy', 'Libertarian', 'TrueReddit', 'Conservative',
                   'offbeat']


class RedditPushshiftProvider(ContentProvider):

    def __init__(self):
        super(RedditPushshiftProvider, self).__init__()
        self._logger = logging.getLogger(__name__)

    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20, **kwargs) -> List[Dict]:
        """
        Return a list of top submissions matching the query.
        :param start_date: 
        :param end_date:
        :param limit:
        :param kwargs: Options: 'subreddits': List[str]
        :return:
        """
        subreddits = kwargs['subreddits'] if 'subreddits' in kwargs else []
        data = self._cached_submission_search(q=query, subreddits=subreddits,
                                              start_date=start_date, end_date=end_date,
                                              limit=limit, sort='desc', sort_type='score')
        cleaned_data = [self._submission_to_row(item) for item in data['data'][:limit]]
        return cleaned_data

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        Count how reddit sumissions match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs: Options: 'subreddits': List[str]
        :return:
        """
        subreddits = kwargs['subreddits'] if 'subreddits' in kwargs else []
        data = self._cached_submission_search(q=query, subreddits=subreddits,
                                              start_date=start_date, end_date=end_date,
                                              aggs='created_utc', frequency='1y', size=0)
        if len(data['aggs']['created_utc']) == 0:
            return 0
        counts = [r['doc_count'] for r in data['aggs']['created_utc']]
        return sum(counts)

    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> Dict:
        """
        How many reddit submissions over time match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs: Options: 'subreddits': List[str], period: str (default '1d')
        :return:
        """
        subreddits = kwargs['subreddits'] if 'subreddits' in kwargs else []
        period = kwargs['period'] if 'period' in kwargs else '1d'
        data = self._cached_submission_search(q=query, subreddits=subreddits,
                                              start_date=start_date, end_date=end_date,
                                              aggs='created_utc', frequency=period, size=0)
        # make the results match the format we use for stories/count in the Media Cloud API
        results = []
        for d in data['aggs']['created_utc']:
            results.append({
                'date': dt.datetime.fromtimestamp(d['key']).strftime(MC_DATE_FORMAT),
                'timestamp': d['key'],
                'count': d['doc_count'],
            })
        return {'counts': results}

    @cache.cache_on_arguments()
    def _cached_submission_search(self, query: str = None, start_date: dt.datetime = None, end_date: dt.datetime = None,
                                  subreddits: List[str] = None, **kwargs) -> Dict:
        """
        Run a generic query against Pushshift.io to retrieve Reddit data
        :param start_date:
        :param end_date:
        :param subreddits:
        :param kwargs: any other params you want to send over the Pushshift as part of your query (sort, sort_type,
        limit, aggs, etc)
        :return:
        """
        headers = {'Content-type': 'application/json'}
        params = defaultdict()
        if query is not None:
            params['q'] = query
        if subreddits is not None:
            params['subreddit'] = ",".join(subreddits)
        if (start_date is not None) and (end_date is not None):
            params['after'] = unix_to_solr_date(int(start_date.timestamp()))
            params['before'] = unix_to_solr_date(int(end_date.timestamp()))
        # and now add in any other arguments they have sent in
        params.update(kwargs)
        r = requests.get(PS_REDDIT_SEARCH_URL, headers=headers, params=params)
        # temp = r.url # useful assignment for debugging investigations
        return r.json()

    @classmethod
    def _submission_to_row(cls, item: Dict) -> Dict:
        """
        turn a Reddit submission into something that looks like a Media Cloud story
        :param item:
        :return:
        """
        return {
            'media_name': '/r/{}'.format(item['subreddit']),
            'media_url': item['full_link'],
            'full_link': item['full_link'],
            'stories_id': item['id'],
            'title': item['title'],
            'publish_date': dt.datetime.fromtimestamp(item['created_utc']).strftime(MC_DATE_FORMAT),
            'url': item['url'],
            'score': item['score'],
            'last_updated': dt.datetime.fromtimestamp(item['updated_utc']).strftime(MC_DATE_FORMAT) if 'updated_utc' in item else None,
            'author': item['author'],
            'subreddit': item['subreddit']
        }

    @classmethod
    def _sanitize_url_for_reddit(cls, url: str) -> str:
        """
        Naive normalization, but works OK
        :return:
        """
        return url.split('?')[0]

    def url_submissions_by_sub(self, url: str) -> List[Dict]:
        """
        Extra helper to return submission counts by subreddit
        :return:
        """
        data = self._cached_submission_search(url=self._sanitize_url_for_reddit(url), aggs='subreddit', size=0)
        results = []
        for d in data['aggs']['subreddit']:
            results.append({
                'name': d['key'],
                'value': d['doc_count'],
            })
        return results


