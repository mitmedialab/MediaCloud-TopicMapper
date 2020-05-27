import unittest
import datetime as dt

from server.platforms.twitter_pushshift import TwitterPushshiftProvider

TERM = "trump"


class TwitterPushshiftProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = TwitterPushshiftProvider()

    def test_sample(self):
        results = self._provider.sample(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                        end_date=dt.datetime.now())
        assert isinstance(results, list) is True
        for tweet in results:
            assert TERM in tweet['title'].lower()
            # TODO: check `created_at` to validate the search limits worked

    def test_count_over_time(self):
        results = self._provider.count_over_time(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                                 end_date=dt.datetime.now())
        assert 'counts' in results
        assert isinstance(results['counts'], list) is True
        assert len(results['counts']) is 6

    def test_count(self):
        results = self._provider.count(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                       end_date=dt.datetime.now())
        assert results > 0
