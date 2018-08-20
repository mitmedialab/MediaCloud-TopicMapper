from flask import jsonify
import flask_login
from operator import itemgetter
import requests
import logging

from flask import request
from server import app, cliff, NYT_THEME_LABELLER_URL, mc
from server.auth import user_mediacloud_client, user_admin_mediacloud_client
from server.util.request import api_error_handler
import server.util.csv as csv
from server.cache import cache, key_generator

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
    if 'text' in request.args and request.args['text'] == 'true':
        story = admin_mc.story(stories_id, text=True)
    else:
        story = user_mc.story(stories_id)
    story["media"] = user_mc.media(story["media_id"])
    return jsonify({'info': story})


@app.route('/api/stories/<stories_id>/entities', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_entities(stories_id):
    entities = entities_from_mc_or_cliff(stories_id)
    return jsonify({'list': entities})


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
    if (cliff_results == u'"story is not annotated"') or (cliff_results == u"story does not exist"):
        story = mc.story(stories_id, text=True)
        cliff_results = cliff.parseText(story['story_text'])
    # clean up for reporting
    for org in cliff_results['results']['organizations']:
        entities.append({
            'type': 'ORGANIZATION',
            'name': org['name'],
            'frequency': org['count']
        })
    for person in cliff_results ['results']['people']:
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


@cache.cache_on_arguments(function_key_generator=key_generator)
def cached_story_raw_cliff_results(stories_id):
    # need to pull story results with the tool key, so we don't need to cache on user key here
    themes = mc.storyRawCliffResults([stories_id])
    return themes


@app.route('/api/stories/<stories_id>/nyt-themes', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_nyt_themes(stories_id):
    themes = nyt_themes_from_mc_or_labeller(stories_id)['descriptors600']
    return jsonify({'list': themes})


@app.route('/api/stories/<stories_id>/nyt-themes.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_nyt_themes_csv(stories_id):
    themes = nyt_themes_from_mc_or_labeller(stories_id)['descriptors600']
    props = ['label', 'score']
    return csv.stream_response(themes, props, 'story-'+str(stories_id)+'-nyt-themes')


def nyt_themes_from_mc_or_labeller(stories_id):
    results = cached_story_raw_theme_results(stories_id)
    if results['nytlabels'] == u'"story is not annotated"':
        story = mc.story(stories_id, text=True)
        results = predict_news_labels(story['story_text'])
    else:
        results = results['nytlabels']
    return results


@cache.cache_on_arguments(function_key_generator=key_generator)
def cached_story_raw_theme_results(stories_id):
    user_mc = user_mediacloud_client()
    themes = user_mc.storyRawNytThemeResults([stories_id])[0]
    return themes


def predict_news_labels(story_text):
    url = "{}/predict.json".format(NYT_THEME_LABELLER_URL)
    try:
        r = requests.post(url, json={'text': story_text})
        return r.json()
    except requests.exceptions.RequestException as e:
        l.exception(e)
    return []
