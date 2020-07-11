# pylint: disable=protected-access

import unittest
import os

from server.platforms.generic_csv import GenericCsvProvider

THIS_DIR = os.path.dirname(os.path.realpath(__file__))
SAMPLE_FILE_1 = os.path.join(THIS_DIR, 'sample_generic_csv.csv')
SAMPLE_FILE_2 = os.path.join(THIS_DIR, 'sample_crowdtangle.csv')


class GenericCsvProviderTest(unittest.TestCase):

    def setUp(self):
        self._provider = GenericCsvProvider()

    def test_load_from_file(self):
        self._provider._load_from_file(SAMPLE_FILE_1)
        assert len(self._provider._data) == 2
        self._provider._load_from_file(SAMPLE_FILE_2)
        assert len(self._provider._data) == 6

    def test_count(self):
        self._provider._load_from_file(SAMPLE_FILE_1)
        assert self._provider.count(None, None, None) == 2

    def test_sample(self):
        self._provider._load_from_file(SAMPLE_FILE_2)
        results = self._provider.sample(None, None, None)
        for post in results:
            assert post['author'] is not None

    def test_count_over_time(self):
        self._provider._load_from_file(SAMPLE_FILE_2)
        results = self._provider.count_over_time(None, None, None)
        for item in results['counts']:
            assert 'date' in item
            assert 'count' in item

    def test_normalized_count_over_time(self):
        self._provider._load_from_file(SAMPLE_FILE_2)
        results = self._provider.normalized_count_over_time(None, None, None)
        assert 'counts' in results
        assert 'total' in results
        assert results['total'] > 0
        assert 'normalized_total' in results
