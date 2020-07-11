# pylint: disable=protected-access

import unittest
import datetime as dt

from server.platforms.web_google import WebGoogleProvider

TERM = "robot"
DAY_WINDOW = 100  # window in days to search for term


class WebGoogleProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = WebGoogleProvider()

    def test_fetch_google_results(self):
        results = self._provider._fetch_google_results(
            TERM,
            start_date=dt.datetime.now() - dt.timedelta(days=DAY_WINDOW),
            end_date=dt.datetime.now(),
            limit=10
        )
        assert isinstance(results, list) is True
