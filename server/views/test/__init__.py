import json
import unittest

from server import app, mc

TEST_USER_EMAIL = "mediacloud-testing@media.mit.edu"
TEST_USER_PASSWORD = "FAKE_PASSWORD"  # change this to the fake user's password (TODO: replace with env-var)


class BaseAppTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.admin_mc = mc
        pass

    def tearDown(self):
        pass

    def loginAsTestUser(self):
        response = self.app.post(
            '/api/login',
            data=dict(email=TEST_USER_EMAIL, password=TEST_USER_PASSWORD),
            follow_redirects=True,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        return response

    def logout(self):
        self.app.get('/api/user/logout')

    def jsonFrom(self, response):
        response_text = response.get_data(as_text=True)
        return json.loads(response_text)
