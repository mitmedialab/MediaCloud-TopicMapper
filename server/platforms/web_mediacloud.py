import datetime as dt
from typing import List, Dict
import logging
from mediacloud.api import MediaCloud

from server.platforms.provider import ContentProvider
import server.views.apicache as base_apicache
from server.views.media_picker import concatenate_query_for_solr


class WebMediaCloudProvider(ContentProvider):

    def __init__(self, api_key):
        super(WebMediaCloudProvider, self).__init__()
        self._logger = logging.getLogger(__name__)
        self._api_key = api_key

    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20,
               **kwargs) -> List[Dict]:
        """
        Return a list of stories matching the query.
        :param query:
        :param start_date:
        :param end_date:
        :param limit:
        :param kwargs: sources and collections
        :return:
        """
        q, fq = self._as_query_and_filter_query(query, start_date, end_date, **kwargs)
        story_list = base_apicache.story_list(self._api_key, q, fq)
        return story_list

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        Count how many verified tweets match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        q, fq = self._as_query_and_filter_query(query, start_date, end_date, **kwargs)
        story_count_result = base_apicache.story_count(self._api_key, q, fq)
        return story_count_result['count']

    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> List[Dict]:
        """
        How many verified tweets over time match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        q, fq = self._as_query_and_filter_query(query, start_date, end_date, **kwargs)
        story_count_result = base_apicache.story_count(self._api_key, q, fq, split=True)
        return story_count_result

    def words(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 100,
              **kwargs) -> List[Dict]:
        """
        Get the top words based on a sample
        :param query:
        :param start_date:
        :param end_date:
        :param limit:
        :param kwargs:
        :return:
        """
        q, fq = self._as_query_and_filter_query(query, start_date, end_date, **kwargs)
        results = base_apicache.word_count(self._api_key, q, fq)[:limit]
        return results

    @classmethod
    def _as_query_and_filter_query(self, query: str, start_date: dt.datetime, end_date: dt.datetime,
                                   **kwargs) -> (str, str):
        """
        Take all the query params and return q and fq suitable for a media cloud solr-syntax query
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs: sources and collections
        :return:
        """
        media_ids = kwargs['sources'] if 'sources' in kwargs else []
        tags_ids = kwargs['collections'] if 'collections' in kwargs else []
        q = concatenate_query_for_solr(query, media_ids, tags_ids)
        fq = MediaCloud.publish_date_query(start_date, end_date)
        return q, fq
