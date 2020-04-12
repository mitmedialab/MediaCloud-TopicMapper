import unittest

from server.views.test import BaseAppTest


class HomepageTest(BaseAppTest):
    """
    Make sure the homepage returns, nothing else.
    """

    def testHomePageResponds(self):
        response = self.app.get('/', follow_redirects=True)
        assert response.status_code == 200


if __name__ == "__main__":
    unittest.main()
