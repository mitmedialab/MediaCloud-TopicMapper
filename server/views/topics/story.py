import flask_login
from flask import jsonify, request
import logging
from mediacloud.error import MCException

from server import app, TOOL_API_KEY
from server.auth import is_user_logged_in, user_mediacloud_client, user_mediacloud_key, user_admin_mediacloud_client
from server.util import tags as tag_util, csv as csv
from server.util.request import api_error_handler
from server.views import WORD_COUNT_DOWNLOAD_NUM_WORDS, WORD_COUNT_DOWNLOAD_SAMPLE_SIZE
from server.views.topics import apicache as apicache
from server.views.topics.stories import _cached_geoname, stream_story_list_csv

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/stories/<stories_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story(topics_id, stories_id):
    if is_user_logged_in():
        local_mc = user_mediacloud_client()
        story_topic_info = apicache.topic_story_list(user_mediacloud_key(), topics_id, stories_id=stories_id)
        story_topic_info = story_topic_info['stories'][0]
        '''
        all_fb_count = []
        more_fb_count = True
        link_id = 0
        while more_fb_count:
            fb_page = local_mc.topicStoryListFacebookData(topics_id, limit=100, link_id=link_id)

            all_fb_count = all_fb_count + fb_page['counts']
            if 'next' in fb_page['link_ids']:
                link_id = fb_page['link_ids']['next']
                more_fb_count = True
            else:
                more_fb_count = False

        for fb_item in all_fb_count:
            if int(fb_item['stories_id']) == int(stories_id):
                story_topic_info['facebook_collection_date'] = fb_item['facebook_api_collect_date']
        '''
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})

    try:
        story_info = local_mc.story(stories_id)  # add in other fields from regular call
        for k in story_info.keys():
            story_topic_info[k] = story_info[k]
        for tag in story_info['story_tags']:
            if tag['tag_sets_id'] == tag_util.GEO_TAG_SET:
                geonames_id = int(tag['tag'][9:])
                try:
                    tag['geoname'] = _cached_geoname(geonames_id, language)
                except Exception as e:
                    # query to CLIFF failed :-( handle it gracefully
                    logger.exception(e)
                    tag['geoname'] = {}
    except MCException:
        logger.warning("Story {} wasn't found in a regular story API call, but is it topic {}".format(
            stories_id, topics_id
        ))
    return jsonify(story_topic_info)


@app.route('/api/stories/<stories_id>/storyUpdate', methods=['POST'])
@flask_login.login_required
@api_error_handler
def topic_story_update(stories_id):
    user_mc = user_admin_mediacloud_client()
    optional_args = {
        'title': request.form['title'] if 'title' in request.form else None,
        'description': request.form['description'] if 'description' in request.form else '',
        'guid': request.form['guid'] if 'guid' in request.form else 'guid',
        'url': request.form['url'] if 'url' in request.form else 'url',
        'language': request.form['language'] if 'language' in request.form else 'en',
        'publish_date': request.form['publish_date'] if 'publish_date' in request.form else None,
        #'custom_date': request.form['custom_date'] if 'custom_date' in request.form else False,
        'undateable': bool(request.form['undateable'] == 'true') if 'active' in request.form else False,
    }
    stories = user_mc.storyUpdate(stories_id, **optional_args)

    return jsonify(stories)


@app.route('/api/topics/<topics_id>/stories/<stories_id>/words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_words(topics_id, stories_id):
    word_list = apicache.topic_word_counts(user_mediacloud_key(), topics_id, q='stories_id:'+stories_id)[:100]
    return jsonify(word_list)


@app.route('/api/topics/<topics_id>/stories/<stories_id>/words.csv', methods=['GET'])
@flask_login.login_required
def story_words_csv(topics_id, stories_id):
    query = apicache.add_to_user_query('stories_id:'+stories_id)
    ngram_size = request.args['ngram_size'] if 'ngram_size' in request.args else 1  # default to word count
    word_counts = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, ngram_size, q=query,
                                              num_words=WORD_COUNT_DOWNLOAD_NUM_WORDS,
                                              sample_size=WORD_COUNT_DOWNLOAD_SAMPLE_SIZE)
    return csv.stream_response(word_counts, apicache.WORD_COUNT_DOWNLOAD_COLUMNS,
                               'topic-{}-story-{}-sampled-ngrams-{}-word'.format(
                                   topics_id, stories_id, ngram_size))


@app.route('/api/topics/<topics_id>/stories/<stories_id>/inlinks', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_inlinks(topics_id, stories_id):
    inlinks = apicache.topic_story_list(TOOL_API_KEY, topics_id,
                                        link_to_stories_id=stories_id, limit=50)
    return jsonify(inlinks)


@app.route('/api/topics/<topics_id>/stories/<stories_id>/inlinks.csv', methods=['GET'])
@flask_login.login_required
def story_inlinks_csv(topics_id, stories_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_list_csv(user_mediacloud_key(), 'story-'+stories_id+'-inlinks', topic,
                                 link_to_stories_id=stories_id)


@app.route('/api/topics/<topics_id>/stories/<stories_id>/outlinks', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_outlinks(topics_id, stories_id):
    outlinks = apicache.topic_story_list(user_mediacloud_key(), topics_id, link_from_stories_id=stories_id, limit=50)
    return jsonify(outlinks)


@app.route('/api/topics/<topics_id>/stories/<stories_id>/outlinks.csv', methods=['GET'])
@flask_login.login_required
def story_outlinks_csv(topics_id, stories_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_list_csv(user_mediacloud_key(), 'story-'+stories_id+'-outlinks', topic,
                                 link_from_stories_id=stories_id)