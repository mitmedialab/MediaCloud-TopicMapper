import unittest
import time

from server.views.test import BaseAppTest, TEST_USER_EMAIL


class UserLoginTest(BaseAppTest):
    """
    Make sure a user can login with the email and password, and can't if password is wrong
    """

    def testWrongPassword(self):
        response = self.app.post(
            '/api/login',
            data=dict(email=TEST_USER_EMAIL, password='NOT_MY_PASSWORD'),
            follow_redirects=True,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 500
        time.sleep(1)  # need to sleep here after a failed attempt to avoid backend error about login frequency

    def testCanLogin(self):
        response = self.loginAsTestUser()
        assert response.status_code == 200
        content = self.jsonFrom(response)
        assert content['email'] == TEST_USER_EMAIL
        assert 'key' in content
        assert 'profile' in content
        assert 'auth_roles' in content['profile']
        self.logout()


class UserConsentTest(BaseAppTest):
    """
    Make sure a non-consenting user can mark themselves as consenting
    """

    def _getUserByEmail(self, email):
        matching_users = self.admin_mc.userList(search=email)['users']
        return matching_users[0]

    def setUp(self):
        super().setUp()
        # look up user id
        self.test_user = self._getUserByEmail(TEST_USER_EMAIL)
        # mark them as not consented
        self.admin_mc.userUpdate(self.test_user['auth_users_id'], has_consented=False)

    def tearDown(self):
        # mark them as consented again
        self.admin_mc.userUpdate(self.test_user['auth_users_id'], has_consented=True)
        super().tearDown()

    def testAddConsent(self):
        response = self.loginAsTestUser()
        # verify they aren't rejected from logging in, but are missing consent
        assert response.status_code == 200
        content = self.jsonFrom(response)
        assert 'profile' in content
        assert 'has_consented' in content['profile']
        assert content['profile']['has_consented'] is False
        # make sure cached profile says consent is false
        content = self.jsonFrom(self.app.get(
            '/api/login-with-cookie',
            follow_redirects=True,
        ))
        assert 'profile' in content
        assert 'has_consented' in content['profile']
        assert content['profile']['has_consented'] is False
        # now accept consent
        self.app.post(
            '/api/user/update',
            data=dict(has_consented=True, full_name="Media Cloud Testing User", notes="For manual & automated testing"),
            follow_redirects=True,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        # make sure cached profile object says consent is true now
        content = self.jsonFrom(self.app.get(
            '/api/login-with-cookie',
            follow_redirects=True,
        ))
        assert 'profile' in content
        assert 'has_consented' in content['profile']
        assert content['profile']['has_consented'] is True
        # verify consent has changed to true
        response = self.loginAsTestUser()
        content = self.jsonFrom(response)
        assert 'profile' in content
        assert 'has_consented' in content['profile']
        assert content['profile']['has_consented'] is True



if __name__ == "__main__":
    unittest.main()
