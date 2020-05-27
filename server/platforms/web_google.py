import datetime as dt
from typing import List, Dict
import logging
import json
import dateutil.parser
from urllib.parse import urlparse
import subprocess

from server import base_dir
from server.cache import cache
from server.platforms.provider import ContentProvider, MC_DATE_FORMAT


class WebGoogleProvider(ContentProvider):
    """
    Get matching Google News search results.
    """

    def __init__(self):
        super(WebGoogleProvider, self).__init__()
        self._logger = logging.getLogger(__name__)

    def sample(self, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int = 20,
               **kwargs) -> List[Dict]:
        """
        :param query:
        :param start_date:
        :param end_date:
        :param limit:
        :param kwargs:
        :return:
        """
        links = self._fetch_google_results(query, start_date, end_date, limit)
        stories = [self._content_to_row(link) for link in links]
        return stories

    @classmethod
    def _content_to_row(cls, item):
        try:
            publish_date = dateutil.parser.parse(item['metadata']).strftime(MC_DATE_FORMAT)
        except ValueError:
            publish_date = None
        except KeyError:
            publish_date = None
        domain = urlparse(item['url']).netloc
        return {
            'author': domain,
            'publish_date': publish_date,
            'title': item['title'],
            'media_name': domain,
            'media_url': domain,
            'url': item['url'],
        }

    @classmethod
    @cache.cache_on_arguments()
    def _fetch_google_results(cls, query: str, start_date: dt.datetime, end_date: dt.datetime, limit: int) -> list:
        start_query = "after:" + start_date.strftime("%Y-%m-%d")
        end_query = "before:" + (end_date + dt.timedelta(days=1)).strftime('%Y-%m-%d')
        full_query = "%s %s %s" % (query, start_query, end_query)
        results = subprocess.check_output(["{}/scripts/googler".format(base_dir),
                                           "--json",
                                           "-n {}".format(limit),
                                           full_query])
        links = json.loads(results)
        return links

