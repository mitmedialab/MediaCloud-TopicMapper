import unittest
import datetime as dt

from server.platforms.web_google import WebGoogleProvider

TERM = "robot"
DAY_WINDOW = 100  # window in days to search for tem


class WebGoogleProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = WebGoogleProvider()

    def test_fetch_posts_from_api(self):
        results = self._provider._fetch_posts_from_api(
            TERM,
            start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
            end_date=dt.datetime.now()
        )
        assert isinstance(results, list) is True
