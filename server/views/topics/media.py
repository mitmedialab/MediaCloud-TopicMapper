import logging
import json
from flask import jsonify, request, Response
import flask_login

from server import app, TOOL_API_KEY
from server.views import WORD_COUNT_DOWNLOAD_NUM_WORDS, WORD_COUNT_DOWNLOAD_SAMPLE_SIZE
from server.auth import user_mediacloud_key, user_mediacloud_client, user_admin_mediacloud_client, is_user_logged_in
from server.util import csv
from server.views.topics import validated_sort, TOPIC_MEDIA_CSV_PROPS
from server.views.topics.attention import stream_topic_split_story_counts_csv
from server.views.topics.stories import stream_story_list_csv
import server.views.topics.apicache as apicache
import server.views.apicache as base_apicache
from server.util.request import filters_from_args, api_error_handler
from server.views.topics import access_public_topic


logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/media', methods=['GET'])
@api_error_handler
def topic_media(topics_id):
    if access_public_topic(topics_id):
        media_list = apicache.topic_media_list(TOOL_API_KEY, topics_id, snapshots_id=None, timespans_id=None,
                                               foci_id=None, sort=None, limit=None, link_id=None)
    elif is_user_logged_in():
        media_list = apicache.topic_media_list(user_mediacloud_key(), topics_id)
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})

    return jsonify(media_list)


@app.route('/api/topics/<topics_id>/media/<media_id>', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media(topics_id, media_id):
    user_mc = user_admin_mediacloud_client()
    combined_media_info = apicache.topic_media_list(user_mediacloud_key(), topics_id, media_id=media_id)['media'][0]
    media_info = user_mc.media(media_id)
    for key in list(media_info.keys()):
        if key not in list(combined_media_info.keys()):
            combined_media_info[key] = media_info[key]
    return jsonify(combined_media_info)


@app.route('/api/topics/<topics_id>/media.csv', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_media_csv(topics_id):
    sort = validated_sort(request.args.get('sort'))
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    return _stream_media_list_csv(user_mediacloud_key(), 'media-for-topic-' + topics_id, topics_id, sort=sort,
                                  snapshots_id=snapshots_id, timespans_id=timespans_id, foci_id=foci_id, q=q)


@app.route('/api/topics/<topics_id>/media/<media_id>/split-story/count', methods=['GET'])
@flask_login.login_required
@api_error_handler
def topic_media_split_story_count(topics_id, media_id):
    return jsonify(apicache.topic_split_story_counts(user_mediacloud_key(), topics_id,
                                                     q="media_id:{}".format(media_id)))


@app.route('/api/topics/<topics_id>/media/<media_id>/split-story/count.csv', methods=['GET'])
@flask_login.login_required
def topic_media_story_split_count_csv(topics_id, media_id):
    return stream_topic_split_story_counts_csv(user_mediacloud_key(), 'media-'+str(media_id)+'-split-story-counts',
                                               topics_id, q="media_id:{}".format(media_id))


@app.route('/api/topics/<topics_id>/media/<media_id>/stories', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media_stories(topics_id, media_id):
    sort = validated_sort(request.args.get('sort'))
    limit = request.args.get('limit')
    stories = apicache.topic_story_list(user_mediacloud_key(), topics_id,
                                        media_id=media_id, sort=sort, limit=limit)
    return jsonify(stories)


@app.route('/api/topics/<topics_id>/media/<media_id>/stories.csv', methods=['GET'])
@flask_login.login_required
def media_stories_csv(topics_id, media_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_list_csv(user_mediacloud_key(), 'media-'+media_id+'-stories', topic,
                                 media_id=media_id, timespans_id=timespans_id, q=q)


@app.route('/api/topics/<topics_id>/media/<media_id>/inlinks', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media_inlinks(topics_id, media_id):
    sort = validated_sort(request.args.get('sort'))
    limit = request.args.get('limit')
    inlinks = apicache.topic_story_list(user_mediacloud_key(), topics_id,
                                        link_to_media_id=media_id, sort=sort, limit=limit)
    return jsonify(inlinks)


@app.route('/api/topics/<topics_id>/media/<media_id>/inlinks/all', methods=['GET'])
@flask_login.login_required
@api_error_handler
def all_media_inlinks(topics_id, media_id):
    all_stories = []
    more_stories = True
    link_id = 0
    sort = validated_sort(request.args.get('sort'))
    while more_stories:
        page = apicache.topic_story_list(user_mediacloud_key(), topics_id, link_to_media_id=media_id, sort=sort,
                                         link_id=link_id, limit=1000)
        story_list = page['stories']

        all_stories = all_stories + story_list
        if 'next' in page['link_ids']:
            link_id = page['link_ids']['next']
            more_stories = True
        else:
            more_stories = False

    return jsonify({"stories": all_stories})


@app.route('/api/topics/<topics_id>/media/<media_id>/inlinks.csv', methods=['GET'])
@flask_login.login_required
def media_inlinks_csv(topics_id, media_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_list_csv(user_mediacloud_key(), 'media-'+media_id+'-inlinks', topic,
                                 link_to_media_id=media_id, timespans_id=timespans_id, q=q)


@app.route('/api/topics/<topics_id>/media/<media_id>/outlinks', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media_outlinks(topics_id, media_id):
    sort = validated_sort(request.args.get('sort'))
    limit = request.args.get('limit')
    outlinks = apicache.topic_story_list(user_mediacloud_key(), topics_id,
                                         link_from_media_id=media_id, sort=sort, limit=limit)
    return jsonify(outlinks)


@app.route('/api/topics/<topics_id>/media/<media_id>/outlinks/all', methods=['GET'])
@flask_login.login_required
@api_error_handler
def all_media_outlinks(topics_id, media_id):
    all_stories = []
    more_stories = True
    link_id = 0
    sort = validated_sort(request.args.get('sort'))
    while more_stories:
        page = apicache.topic_story_list(user_mediacloud_key(), topics_id, link_from_media_id=media_id,
                                         sort=sort, link_id=link_id, limit=1000)
        story_list = page['stories']

        all_stories = all_stories + story_list
        if 'next' in page['link_ids']:
            link_id = page['link_ids']['next']
            more_stories = True
        else:
            more_stories = False

    return jsonify({"stories": all_stories})


@app.route('/api/topics/<topics_id>/media/<media_id>/outlinks.csv', methods=['GET'])
@flask_login.login_required
def media_outlinks_csv(topics_id, media_id):
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_list_csv(user_mediacloud_key(), 'media-'+media_id+'-outlinks', topic,
                                 link_from_media_id=media_id, timespans_id=timespans_id, q=q)


@app.route('/api/topics/<topics_id>/media/media-links.csv', methods=['GET'])
@flask_login.login_required
def get_topic_media_links_csv(topics_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_media_link_list_csv(user_mediacloud_key(), topic['name'] + '-media-links', topics_id)


def stream_media_link_list_csv(user_mc_key, filename, topics_id, **kwargs):
    params = kwargs.copy()
    merged_args = {
        'snapshots_id': request.args['snapshotId'],
        'timespans_id': request.args['timespanId'],
        'foci_id': request.args['focusId'] if 'foci_id' in request.args else None,
    }
    params.update(merged_args)
    if 'q' in params:
        params['q'] = params['q'] if 'q' not in [None, '', 'null', 'undefined'] else None
    params['limit'] = 1000  # an arbitrary value to let us page through with big topics

    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    columns = ['src_media_id', 'src_media_name', 'src_media_url', 'ref_media_id', 'ref_media_name', 'ref_media_url']
    return Response(_topic_media_link_list_by_page_as_csv_row(user_mc_key, topics_id, columns, **params),
                    mimetype='text/csv; charset=utf-8', headers=headers)


def _media_info_worker(info):
    return base_apicache.get_media_with_key(info['key'], info['media_id'])


# generator you can use to handle a long list of stories row by row (one row per story)
def _topic_media_link_list_by_page_as_csv_row(user_mc_key, topics_id, props, **kwargs):
    yield ','.join(props) + '\n'  # first send the column names
    more_media = True
    link_id = 0
    basic_media_props = ['media_id', 'name', 'url']
    while more_media:
        # fetch one page of data
        media_link_page = apicache.topic_media_link_list_by_page(TOOL_API_KEY, topics_id, link_id, **kwargs)
        # get the media info for all the media sources
        media_src_ids = [str(s['source_media_id']) for s in media_link_page['links']]
        media_ref_ids = [str(s['ref_media_id']) for s in media_link_page['links']]
        media_src_ids = set(media_src_ids + media_ref_ids)  # make it distinct
        # TODO: PARALLELIZE - can't use executor here, because we are out of the context?
        media_lookup = {int(mid): _media_info_worker({'key': user_mc_key, 'media_id': mid})
                        for mid in media_src_ids}
        # connect the link data to the media info data
        for link_pair in media_link_page['links']:
            link_pair['source_info'] = media_lookup[int(link_pair['source_media_id'])]
            link_pair['ref_info'] = media_lookup[int(link_pair['ref_media_id'])]
        # stream this page's results to the client
        for s in media_link_page['links']:
            cleaned_source_info = csv.dict2row(basic_media_props, s['source_info'])
            cleaned_ref_info = csv.dict2row(basic_media_props, s['ref_info'])
            row_string = ','.join(cleaned_source_info) + ',' + ','.join(cleaned_ref_info) + '\n'
            yield row_string
        # set up to grab the next page
        if 'next' in media_link_page['link_ids']:
            link_id = media_link_page['link_ids']['next']
        else:
            more_media = False


def _stream_media_list_csv(user_mc_key, filename, topics_id, **kwargs):
    # Helper method to stream a list of media back to the client as a csv.  Any args you pass in will be
    # simply be passed on to a call to topicMediaList.
    all_media = []
    more_media = True
    params = kwargs
    params['limit'] = 1000  # an arbitrary value to let us page through with big pages
    try:

        while more_media:
            page = apicache.topic_media_list(user_mc_key, topics_id, **params)
            media_list = page['media']

            all_media = all_media + media_list

            if 'next' in page['link_ids']:
                params['link_id'] = page['link_ids']['next']
                more_media = True
            else:
                more_media = False

        return csv.download_media_csv(all_media, filename, TOPIC_MEDIA_CSV_PROPS)
    except Exception as exception:
        return json.dumps({'error': str(exception)}, separators=(',', ':')), 400


@app.route('/api/topics/<topics_id>/media/<media_id>/words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def media_words(topics_id, media_id):
    query = apicache.add_to_user_query('media_id:'+media_id)
    word_list = apicache.topic_word_counts(user_mediacloud_key(), topics_id, q=query)[:100]
    return jsonify(word_list)


@app.route('/api/topics/<topics_id>/media/<media_id>/words.csv', methods=['GET'])
@flask_login.login_required
def media_words_csv(topics_id, media_id):
    query = apicache.add_to_user_query('media_id:'+media_id)
    ngram_size = request.args['ngram_size'] if 'ngram_size' in request.args else 1  # default to word count
    word_counts = apicache.topic_ngram_counts(user_mediacloud_key(), topics_id, ngram_size=ngram_size, q=query,
                                              num_words=WORD_COUNT_DOWNLOAD_NUM_WORDS,
                                              sample_size=WORD_COUNT_DOWNLOAD_SAMPLE_SIZE)
    return csv.stream_response(word_counts, apicache.WORD_COUNT_DOWNLOAD_COLUMNS,
                               'topic-{}-media-{}-sampled-ngrams-{}-word'.format(topics_id, media_id, ngram_size))
