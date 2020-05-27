import datetime as dt
from typing import List, Dict
import logging
import dateutil.parser

from server.cache import cache
from server.platforms.provider import ContentProvider, MC_DATE_FORMAT
import requests

# 2014-09-21T00:00:00Z
YT_DATE_FORMAT = "%Y-%m-%dT%H:%M:%SZ"

YT_SEARCH_API_URL = 'https://www.googleapis.com/youtube/v3/search'


class YouTubeYouTubeProvider(ContentProvider):
    """
    Get matching YouTube videos
    """

    def __init__(self, api_key):
        super(YouTubeYouTubeProvider, self).__init__()
        self._logger = logging.getLogger(__name__)
        self._api_key = api_key

    def count(self, query: str, start_date: dt.datetime, end_date: dt.datetime, **kwargs) -> int:
        """
        Count how many videos match the query.
        :param query:
        :param start_date:
        :param end_date:
        :param kwargs:
        :return:
        """
        results = self._fetch_results_from_api(query, start_date, end_date)
        return results['pageInfo']['totalResults']

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
        results = self._fetch_results_from_api(query, start_date, end_date, limit)
        # make sure we pull out only the videos (even through we requested only videos
        videos = []
        for search_result in results['items']:
            if search_result["id"]["kind"] == "youtube#video":
                videos.append(search_result)
        # format them like stories to return
        stories = [self._content_to_row(v) for v in videos]
        return stories

    @classmethod
    def _content_to_row(cls, item):
        try:
            publish_date = dateutil.parser.parse(item['snippet']['publishedAt']).strftime(MC_DATE_FORMAT)
        except ValueError:
            publish_date = None
        except KeyError:
            publish_date = None
        return {
            'stories_id': item['id']['videoId'],
            'author': item['snippet']['channelTitle'],
            'publish_date': publish_date,
            'title': item['snippet']['title'],
            'media_name': item['snippet']['channelTitle'],
            'media_url': "https://www.youtube.com/channel/{}".format(item['snippet']['channelId']),
            'url': "https://www.youtube.com/watch?v={}".format(item['id']['videoId'])
        }

    @cache.cache_on_arguments()
    def _fetch_results_from_api(self, query: str, start_date: dt.datetime, end_date: dt.datetime,
                                limit: int = 20, order: str = "relevance", page_token: str = None) -> dict:
        params = {
            'key': self._api_key,
            'q': query,
            'publishedAfter': start_date.strftime(YT_DATE_FORMAT),
            'publishedBefore': end_date.strftime(YT_DATE_FORMAT),
            'type': 'video',
            'part': 'snippet, id',
            'maxResults': limit,
            'order': order,
            'pageToken': page_token,
        }
        response = requests.get(YT_SEARCH_API_URL, params=params)
        return response.json()
