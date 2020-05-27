import logging
from typing import List, Dict
import datetime as dt
from server.util.api_helper import combined_split_and_normalized_counts

# helpful for turning any date into the standard Media Cloud date format
MC_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class ContentProvider(object):
    """
    An abstract wrapper to be implemented for each platform we want to preview content from.
    Any unimplemented methods raise an Exception
    """

    def __init__(self):
        self._logger = logging.getLogger(__name__)

    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20,
               **kwargs) -> List[Dict]:
        raise NotImplementedError("Subclasses should implement sampleContent!")

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        raise NotImplementedError("Subclasses should implement contentCount!")

    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> Dict:
        raise NotImplementedError("Subclasses should implement contentCountOverTime!")

    def words(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 100,
              **kwargs) -> List[Dict]:
        raise NotImplementedError("Subclasses should implement contentWords!")

    def normalized_count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime,
                                   **kwargs) -> Dict:
        """
        Useful for rendering attention-over-time charts with extra information suitable for normalizing
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        matching_content_counts = self.count_over_time(query, start_date, end_date, **kwargs)['counts']
        matching_total = sum([d['count'] for d in matching_content_counts])
        no_query_content_counts = self.count_over_time('', start_date, end_date, **kwargs)['counts']
        no_query_total = sum([d['count'] for d in no_query_content_counts])
        return {
            'counts': combined_split_and_normalized_counts(matching_content_counts, no_query_content_counts),
            'total': matching_total,
            'normalized_total': no_query_total,
        }
