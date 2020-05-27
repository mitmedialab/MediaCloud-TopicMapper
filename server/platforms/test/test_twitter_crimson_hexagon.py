import unittest
import datetime as dt

from server import config
from server.platforms.twitter_crimson_hexagon import TwitterCrimsonHexagonProvider

TEST_MONITOR_ID = 123456789  # replace with an active live CH Monitor to test effectively


class TwitterCrimsonHexagonProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = TwitterCrimsonHexagonProvider(config.get('CRIMSON_HEXAGON_API_KEY'))

    def test_sample(self):
        results = self._provider.sample(None, start_date=dt.datetime(2019, 1, 1), end_date=dt.datetime(2020, 1, 1),
                                        monitor_id=TEST_MONITOR_ID)
        assert isinstance(results, list) is True

    def test_count_over_time(self):
        results = self._provider.count_over_time(None, start_date=dt.datetime(2019, 1, 1),
                                                 end_date=dt.datetime(2020, 1, 1), monitor_id=TEST_MONITOR_ID)
        assert 'counts' in results
        assert isinstance(results['counts'], list) is True
        assert len(results['counts']) > 6

    def test_count(self):
        results = self._provider.count(None, start_date=dt.datetime(2019, 1, 1), end_date=dt.datetime(2020, 1, 1),
                                       monitor_id=TEST_MONITOR_ID)
        assert results['counts'] > 0

    def test_words(self):
        results = self._provider.words(None, start_date=dt.datetime(2019, 1, 1), end_date=dt.datetime(2020, 1, 1),
                                       monitor_id=TEST_MONITOR_ID)
        last_count = 999999999999
        for item in results:
            assert item['count'] > 0
            assert item['count'] <= last_count
            last_count = item['count']

