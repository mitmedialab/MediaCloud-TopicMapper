import datetime
import logging
from pymongo import MongoClient, DESCENDING

logger = logging.getLogger(__name__)


class AppDatabase:
    # DB wrapper for accessing local storge that supports the app.
    # In theory this makes switching out storage backends easier, by gauranteeing _conn is private.

    def __init__(self, db_uri):
        self.uri = db_uri
        self.created = datetime.datetime.now()
        # pull db name off the end of the URI
        self._db_name = db_uri.split('/')[-1]
        self._conn = MongoClient(db_uri)[self._db_name]

    def check_connection(self):
        return self._conn.test.insert_one({'dummy': 'test'})


class UserDatabase(AppDatabase):
    # DB access for maintaining user-related data; one document per user

    def includes_user_named(self, username):
        return self.find_by_username(username) is not None

    def add_user(self, username, api_key, profile):
        return self._conn.users.insert({
            'username': username,
            'api_key': api_key,
            'profile': profile,
            'favoriteTopics': [],
            'favoriteSources': [],
            'favoriteCollections': [],
            'savedQueries': [],  # holdover from Dashboard
            'searches': [],
        })

    def delete_user(self, username):
        return self.delete_one({'username': username})

    def find_by_username(self, username):
        return self._find_user_by_prop('username', username)

    def find_by_api_key(self, api_key):
        return self._find_user_by_prop('api_key', api_key)

    def _find_user_by_prop(self, prop_name, prop_value):
        return self._conn.users.find_one({prop_name: prop_value})

    def get_users_lists(self, username, list_name):
        user_data = self.find_by_username(username)
        if list_name in user_data:
            return user_data[list_name]
        # be a little safe about checking for lists
        return []

    def add_item_to_users_list(self, username, list_name, item):
        return self._conn.users.update_one({'username': username}, {'$push': {list_name: item}})

    def remove_item_from_users_list(self, username, list_name, item):
        return self._conn.users.update_one({'username': username}, {'$pull': {list_name: item}})

    def update_user(self, username, values_to_update):
        return self._conn.users.update_one({'username': username}, {'$set': values_to_update})


class AnalyticsDatabase(AppDatabase):
    # DB access for maintaining user-related data; one document per user

    TYPE_MEDIA = 'media'
    TYPE_COLLECTION = 'collection'

    ACTION_SOURCE_MGR_VIEW = 'sources-view'
    ACTION_EXPLORER_QUERY = 'explorer-query'

    def increment_count(self, the_type, the_id, the_action, amount=1):
        # type - media | collection
        # id - media_id | tags_id
        # action - explorer-query | sources-view | topics-usage
        if (the_id is not None) and (len(the_id) > 0):  # some extra validation
            return self._conn.analytics.update_one(
                {'type': the_type, 'id': int(the_id)},
                {'$inc': {the_action: amount}},
                upsert=True
            )
        return None

    def top(self, the_type, the_action, limit=50):
        return self._conn.analytics.find({'type': the_type}).sort(the_action, DESCENDING).limit(limit)
