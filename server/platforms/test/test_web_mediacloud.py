import unittest
import datetime as dt

from server import config
from server.platforms.web_mediacloud import WebMediaCloudProvider

TERM = "robot"
DAY_WINDOW = 100  # window in days to search for tem


class WebMediaCloudProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = WebMediaCloudProvider(config.get('MEDIA_CLOUD_API_KEY'))

    def test_sample(self):
        results = self._provider.sample(TERM, start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
                                        end_date=dt.datetime.now())
        assert isinstance(results, list) is True

    def test_count_over_time(self):
        results = self._provider.count_over_time(TERM, start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
                                                 end_date=dt.datetime.now())
        assert 'counts' in results
        assert isinstance(results['counts'], list) is True
        assert len(results['counts']) > 0

    def test_count(self):
        results = self._provider.count(TERM, start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
                                       end_date=dt.datetime.now())
        assert results > 0

    def test_words(self):
        results = self._provider.words(TERM, start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
                                       end_date=dt.datetime.now())
        for word in results:
            assert word['count'] > 0
