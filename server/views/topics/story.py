import flask_login
from flask import jsonify
import logging
from mediacloud.error import MCException

from server import app
from server.auth import user_mediacloud_key
from server.util import tags as tag_util
from server.util.request import api_error_handler
import server.views.apicache as base_apicache
from server.views.topics import apicache as apicache
from server.views.topics.stories import _cached_geoname

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/stories/<stories_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story(topics_id, stories_id):
    story_topic_info = apicache.topic_story_list(user_mediacloud_key(), topics_id, stories_id=stories_id)
    story_topic_info = story_topic_info['stories'][0]
    try:
        story_info = base_apicache.story(stories_id)  # add in other fields from regular call
        for k in story_info.keys():
            story_topic_info[k] = story_info[k]
        for tag in story_info['story_tags']:
            if tag['tag_sets_id'] == tag_util.GEO_TAG_SET:
                geonames_id = int(tag['tag'][9:])
                try:
                    tag['geoname'] = _cached_geoname(geonames_id, story_info['language'])
                except Exception as e:
                    # query to CLIFF failed :-( handle it gracefully
                    logger.exception(e)
                    tag['geoname'] = {}
    except MCException:
        logger.warning("Story {} wasn't found in a regular story API call, but is it topic {}".format(
            stories_id, topics_id
        ))
    return jsonify(story_topic_info)
