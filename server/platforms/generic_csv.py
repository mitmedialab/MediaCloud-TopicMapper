import datetime as dt
import collections
import csv
from typing import List, Dict
import random
import logging
import os
import dateutil.parser

from server import app
from server.cache import cache
from server.platforms.provider import ContentProvider, MC_DATE_FORMAT

MC_DAY_FORMAT = "%Y-%m-%d"


class GenericCsvProvider(ContentProvider):
    """
    User uploads a CSV with content they've gotten from some platofrm we don't provide.
    Required fields: content, author, publish_date
    Optional fields: channel, url, post_id
    """

    def __init__(self, path_to_file: str = None):
        super(GenericCsvProvider, self).__init__()
        self._logger = logging.getLogger(__name__)
        if path_to_file is not None:
            self._data = self._load_from_file(path_to_file)

    def set_filename(self, filename: str):
        path_to_file = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        self._load_from_file(path_to_file)

    def _load_from_file(self, path_to_file: str) -> List[Dict]:
        data = []
        with open(path_to_file, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
        for row in data:
            # this validates the date the same way to back-end parses it
            row['publish_date'] = dateutil.parser.parse(row['publish_date'])
        self._data = data

    @cache.cache_on_arguments()
    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20,
               **kwargs) -> List[Dict]:
        """
        Return a list of random content .
        :param query:
        :param start_date:
        :param end_date:
        :param limit:
        :param kwargs:
        :return:
        """
        return [self._content_to_row(item) for item in random.sample(self._data, min(len(self._data), limit))]

    @cache.cache_on_arguments()
    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        Count how many items are in the CSV
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        return len(self._data)

    @cache.cache_on_arguments()
    def count_over_time(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> Dict:
        """
        How many items match are in the CSV by day?
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        groups = collections.defaultdict(list)
        # group by day
        for row in self._data:
            groups[row['publish_date'].strftime(MC_DAY_FORMAT)].append(row)
        results = [{
            'date': date,
            'timestamp': dt.datetime.strptime(date, MC_DAY_FORMAT).timestamp(),
            'count': len(items),
        } for date, items in groups.items()]
        return {'counts': results}

    @classmethod
    def _content_to_row(cls, item):
        return {
            'author': item['author'],
            'publish_date': item['publish_date'].strftime(MC_DATE_FORMAT),
            'title': item['content'][0:100],
            'media_name': item['author'] if (('author' in item) and (item['author'] is not None)) else 'CSV Upload',
            'media_url': None,
            'url': item['url'] if 'url' in item else None,
        }
