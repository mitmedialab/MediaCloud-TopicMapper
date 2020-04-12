import datetime
import logging
import flask_login
import mediacloud.api

from server import user_db, login_manager

logger = logging.getLogger(__name__)

ROLE_ADMIN = 'admin'                        # Do everything, including editing users
ROLE_ADMIN_READ_ONLY = 'admin-readonly'     # Read access to admin interface
ROLE_MEDIA_EDIT = 'media-edit'              # Add / edit media; includes feeds
ROLE_STORY_EDIT = 'story-edit'              # Add / edit stories
ROLE_TM = 'tm'                              # Topic mapper; includes media and story editing
ROLE_STORIES_API = 'stories-api'            # Access to the stories api
ROLE_SEARCH = 'search'                      # Access to the /search pages
ROLE_TM_READ_ONLY = 'tm-readonly'           # Topic mapper; excludes media and story editing


# User class
class User(flask_login.UserMixin):

    def __init__(self, profile):
        self.profile = profile
        self.name = profile['email']
        self.id = profile['api_key']
        self.active = profile['active']
        self.created = datetime.datetime.now()

    def is_active(self):
        return self.active

    @property
    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return True

    def has_auth_role(self, role):
        my_roles = self.profile['auth_roles']
        return (ROLE_ADMIN in my_roles) or (role in my_roles)

    def create_in_db_if_needed(self):
        if self.exists_in_db():
            logger.debug("user %s already in db", self.name)
            user_db.update_user(self.name, {'api_key': self.id, 'profile': self.profile})
            return
        logger.debug("user %s created in db", self.name)
        user_db.add_user(self.name, self.id, self.profile)

    def exists_in_db(self):
        return user_db.includes_user_named(self.name)

    def get_properties(self):
        return {
            'email': self.name,
            'key': self.id,
            'profile': self.profile
        }

    @classmethod
    def get(cls, userid):
        try:
            return User(user_db.find_by_api_key(userid)['profile'])
            # return User.cached[userid]
        except Exception:
            # be safer here... if anything goes wrong make them login again
            return None


@login_manager.user_loader
def load_user(userid):
    # Flask-login uses this method to lookup users to see if they are logged in already
    logger.debug("trying to load_user %s", userid)
    return User.get(userid)


def is_user_logged_in():
    if flask_login.current_user is None:
        return False
    return flask_login.current_user.is_authenticated


def login_user(user):
    flask_login.login_user(user, remember=True)
    user.create_in_db_if_needed()
    logger.debug("  login succeeded")


def user_has_auth_role(role):
    return flask_login.current_user.has_auth_role(role)


def user_is_admin():
    return user_has_auth_role('admin')


def create_user(profile):
    user = User(profile)
    user.create_in_db_if_needed()
    logger.debug("  added to user cache %s", user.id)
    return user


def load_from_db_by_username(username):
    return user_db.find_by_username(username)


def user_name():
    return flask_login.current_user.name


def user_mediacloud_key():
    # Return the IP-restricted API token for this user from the cookie (note: this is the server IP)
    return flask_login.current_user.profile['api_key']


def user_admin_mediacloud_client(user_mc_key=None):
    # Return a mediacloud admin client for the logged in user.  Passing in a key lets you ovveride reading it out
    # of the request object (which you might not have access to)
    mc_key_to_use = user_mc_key
    if mc_key_to_use is None:
        mc_key_to_use = user_mediacloud_key()
    user_mc = mediacloud.api.AdminMediaCloud(mc_key_to_use)
    return user_mc


def user_mediacloud_client(user_mc_key=None):
    # Return a mediacloud client for the logged in user.  Passing in a key lets you ovveride reading it out
    # of the request object (which you might not have access to)
    mc_key_to_use = user_mc_key
    if mc_key_to_use is None:
        mc_key_to_use = user_mediacloud_key()
    user_mc = mediacloud.api.MediaCloud(mc_key_to_use)
    return user_mc
