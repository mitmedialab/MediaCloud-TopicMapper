from flask import jsonify
import flask_login
from operator import itemgetter
import requests
import logging
import newspaper

from flask import request
import server.util.pushshift as pushshift
from server import app, cliff, NYT_THEME_LABELLER_URL, mc, TOOL_API_KEY
from server.auth import user_mediacloud_client, user_admin_mediacloud_client, user_mediacloud_key
from server.util.request import api_error_handler
import server.util.csv as csv
from server.cache import cache
import server.views.apicache as apicache

QUERY_LAST_FEW_DAYS = "publish_date:[NOW-3DAY TO NOW]"
QUERY_LAST_WEEK = "publish_date:[NOW-7DAY TO NOW]"
QUERY_LAST_MONTH = "publish_date:[NOW-31DAY TO NOW]"
QUERY_LAST_YEAR = "publish_date:[NOW-1YEAR TO NOW]"
QUERY_LAST_DECADE = "publish_date:[NOW-10YEAR TO NOW]"
QUERY_ENGLISH_LANGUAGE = "language:en"

logger = logging.getLogger(__name__)


@app.route('/api/stories/<stories_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_info(stories_id):
    user_mc = user_mediacloud_client()
    admin_mc = user_admin_mediacloud_client()
    if stories_id in [None, 'NaN']:
        return jsonify({'error': 'bad value'})
    if 'text' in request.args and request.args['text'] == 'true':
        story = admin_mc.story(stories_id, text=True)
    else:
        story = user_mc.story(stories_id)
    story["media"] = user_mc.media(story["media_id"])
    return jsonify({'info': story})


@app.route('/api/stories/<stories_id>/raw.html', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_raw(stories_id):
    # only let admins see this
    text = apicache.story_raw_1st_download(user_mediacloud_key(), stories_id)
    return text


@app.route('/api/stories/<stories_id>/entities', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_entities(stories_id):
    entities = entities_from_mc_or_cliff(stories_id)
    return jsonify({'list': entities})


@app.route('/api/stories/<stories_id>/reddit-attention', methods=['GET'])
def story_subreddit_shares(stories_id):
    story = mc.story(stories_id)
    submissions_by_sub = pushshift.reddit_url_submissions_by_subreddit(story['url'])
    return jsonify({
        'total': sum([r['value'] for r in submissions_by_sub]) if submissions_by_sub is not None else 0,
        'subreddits': submissions_by_sub
    })


@app.route('/api/stories/<stories_id>/reddit-attention.csv', methods=['GET'])
def story_subreddit_shares_csv(stories_id):
    story = mc.story(stories_id)
    submissions_by_sub = pushshift.reddit_url_submissions_by_subreddit(story['url'])
    props = ['name', 'value']
    column_names = ['subreddit', 'submissions']
    return csv.stream_response(submissions_by_sub, props, 'story-' + str(stories_id) + '-subreddit',
                               column_names=column_names)


@app.route('/api/admin/story/<stories_id>/storytags.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_tags_csv(stories_id):
    # in the download include all entity types
    admin_mc = user_admin_mediacloud_client()
    if stories_id in [None, 'NaN']:
        return jsonify({'error': 'bad value'})
    story = admin_mc.story(stories_id, text=True)  # Note - this call doesn't pull cliff places
    props = ['tags_id', 'tag', 'tag_sets_id', 'tag_set']
    return csv.stream_response(story['story_tags'], props, 'story-' + str(stories_id) + '-all-tags-and-tag-sets')


@app.route('/api/stories/<stories_id>/entities.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_entities_csv(stories_id):
    # in the download include all entity types
    entities = entities_from_mc_or_cliff(stories_id)
    props = ['type', 'name', 'frequency']
    return csv.stream_response(entities, props, 'story-'+str(stories_id)+'-entities')


def entities_from_mc_or_cliff(stories_id):
    entities = []
    # get entities from MediaCloud, or from CLIFF if not in MC
    cliff_results = cached_story_raw_cliff_results(stories_id)[0]['cliff']
    if (cliff_results == 'story is not annotated') or (cliff_results == "story does not exist"):
        story = mc.story(stories_id, text=True)
        cliff_results = cliff.parse_text(story['story_text'])
    # clean up for reporting
    if 'results' in cliff_results:
        for org in cliff_results['results']['organizations']:
            entities.append({
                'type': 'ORGANIZATION',
                'name': org['name'],
                'frequency': org['count']
            })
        for person in cliff_results['results']['people']:
            entities.append({
                'type': 'PERSON',
                'name': person['name'],
                'frequency': person['count']
            })
        # places don't have frequency set correctly, so we need to sum them
        locations = []
        place_names = set([place['name'] for place in cliff_results['results']['places']['mentions']])
        for place in place_names:
            loc = {
                'type': 'LOCATION',
                'name': place,
                'frequency': len([p for p in cliff_results['results']['places']['mentions'] if p['name'] == place])
            }
            locations.append(loc)
        entities += locations
    # sort smartly
    unique_entities = sorted(entities, key=itemgetter('frequency'), reverse=True)
    return unique_entities


@cache.cache_on_arguments()
def cached_story_raw_cliff_results(stories_id):
    # need to pull story results with the tool key, so we don't need to cache on user key here
    themes = mc.storyRawCliffResults([stories_id])
    return themes


@app.route('/api/stories/<stories_id>/nyt-themes', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_nyt_themes(stories_id):
    results = nyt_themes_from_mc_or_labeller(stories_id)
    themes = results['descriptors600']
    return jsonify({'list': themes})


@app.route('/api/stories/<stories_id>/nyt-themes.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_nyt_themes_csv(stories_id):
    results = nyt_themes_from_mc_or_labeller(stories_id)
    themes = results['descriptors600']
    props = ['label', 'score']
    return csv.stream_response(themes, props, 'story-'+str(stories_id)+'-nyt-themes')


def nyt_themes_from_mc_or_labeller(stories_id):
    results = cached_story_raw_theme_results(stories_id)
    if results['nytlabels'] == 'story is not annotated':
        story = mc.story(stories_id, text=True)
        results = predict_news_labels(story['story_text'])
    else:
        results = results['nytlabels']
    return results


@cache.cache_on_arguments()
def cached_story_raw_theme_results(stories_id):
    # have to use internal tool admin client here to fetch these (permissions)
    themes = mc.storyRawNytThemeResults([stories_id])[0]
    return themes


def predict_news_labels(story_text):
    url = "{}/predict.json".format(NYT_THEME_LABELLER_URL)
    try:
        r = requests.post(url, json={'text': story_text})
        return r.json()
    except requests.exceptions.RequestException as e:
        logger.exception(e)
    return []


@app.route('/api/stories/<stories_id>/images', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_top_image(stories_id):
    story = mc.story(stories_id)
    # use the tool key so anyone can see these images
    story_html = apicache.story_raw_1st_download(TOOL_API_KEY, stories_id)
    article = newspaper.Article(url=story['url'])
    article.set_html(story_html)
    article.parse()
    return jsonify({
        'top': article.top_image,
        'all': list(article.images),
    })
