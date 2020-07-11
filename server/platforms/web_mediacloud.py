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
        story_list = base_apicache.story_list(None, q, fq)
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
        story_count_result = base_apicache.story_count(q, fq)
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
        story_count_result = base_apicache.story_count(q, fq, split=True)
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
        top_words = base_apicache.word_count(q, fq)[:limit]
        return top_words

    def tags(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> List[Dict]:
        _q, fq = self._as_query_and_filter_query(query, start_date, end_date, **kwargs)
        tags_sets_id = kwargs['tags_sets_id'] if 'tags_sets_id' in kwargs else None
        top_tags = base_apicache.top_tags(query, fq, tags_sets_id)
        return top_tags

    @classmethod
    def _as_query_and_filter_query(cls, query: str, start_date: dt.datetime, end_date: dt.datetime,
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
        fq = MediaCloud.dates_as_query_clause(start_date, end_date)
        return q, fq
