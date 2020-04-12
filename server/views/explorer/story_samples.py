import logging
from flask import jsonify, request, Response
import flask_login
import json
from mediacloud.api import MediaCloud

import server.views.apicache as base_cache
from server import app
import server.util.csv as csv
import server.util.tags as tag_util
from server.auth import user_mediacloud_key
import server.util.pushshift as pushshift
from server.util.request import api_error_handler
from server.views.explorer import parse_as_sample, only_queries_reddit, parse_query_dates, \
    parse_query_with_keywords, file_name_for_download
import server.views.explorer.apicache as apicache

logger = logging.getLogger(__name__)

SAMPLE_STORY_COUNT = 10
INCLUDE_MEDIA_METADATA_IN_CSV = False


@app.route('/api/explorer/stories/sample', methods=['GET'])
@flask_login.login_required
@api_error_handler
def api_explorer_story_sample():
    if only_queries_reddit(request.args):
        start_date, end_date = parse_query_dates(request.args)
        results = pushshift.reddit_top_submissions(query=request.args['q'],
                                                   start_date=start_date, end_date=end_date,
                                                   subreddits=pushshift.NEWS_SUBREDDITS)
    else:
        solr_q, solr_fq = parse_query_with_keywords(request.args)
        results = apicache.random_story_list(solr_q, solr_fq, SAMPLE_STORY_COUNT)
        for story in results:  # add in media info so we can show it to user
            story["media"] = base_cache.media(story["media_id"])
    return jsonify({"results": results})


@app.route('/api/explorer/demo/stories/sample', methods=['GET'])
@api_error_handler
def api_explorer_demo_story_sample():
    search_id = int(request.args['search_id']) if 'search_id' in request.args else None
    if search_id not in [None, -1]:
        solr_q, solr_fq = parse_as_sample(search_id, request.args['index'])
    else:
        solr_q, solr_fq = parse_query_with_keywords(request.args)

    story_sample_result = apicache.random_story_list(solr_q, solr_fq, SAMPLE_STORY_COUNT)
    for story in story_sample_result:
        story["media"] = base_cache.media(story["media_id"])
    return jsonify({"results": story_sample_result})


@app.route('/api/explorer/stories/all-story-urls.csv', methods=['POST'])
@flask_login.login_required
def explorer_stories_csv():
    logger.info(flask_login.current_user.name)
    filename = 'all-story-urls'
    data = request.form
    if 'searchId' in data:
        solr_q, solr_fq = parse_as_sample(data['searchId'], data['uid'])
        filename = filename  # don't have this info + current_query['q']
        # for demo users we only download 100 random stories (ie. not all matching stories)
        return _stream_story_list_csv(filename, solr_q, solr_fq, 100, MediaCloud.SORT_RANDOM, 1)
    else:
        q = json.loads(data['q'])
        filename = file_name_for_download(q['label'], filename)
        # now compute total attention for all results
        if (len(q['collections']) == 0) and only_queries_reddit(q['sources']):
            start_date, end_date = parse_query_dates(q)
            stories = pushshift.reddit_top_submissions(query=q['q'], limit=2000,
                                                       start_date=start_date, end_date=end_date,
                                                       subreddits=pushshift.NEWS_SUBREDDITS)
            props = ['stories_id', 'subreddit', 'publish_date', 'score', 'last_updated', 'title', 'url', 'full_link',
                     'author']
            return csv.stream_response(stories, props, filename)
        else:
            solr_q, solr_fq = parse_query_with_keywords(q)
            # now page through all the stories and download them
            return _stream_story_list_csv(filename, solr_q, solr_fq)


def _stream_story_list_csv(filename, q, fq, stories_per_page=500, sort=MediaCloud.SORT_PROCESSED_STORIES_ID,
                           page_limit=None):
    props = ['stories_id', 'publish_date', 'title', 'url', 'language', 'ap_syndicated',
             'themes', 'media_id', 'media_name', 'media_url']
    if INCLUDE_MEDIA_METADATA_IN_CSV:
        metadata_cols = ['media_pub_country', 'media_pub_state', 'media_language', 'media_about_country',
                         'media_media_type']
        props += metadata_cols
    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    return Response(_story_list_by_page_as_csv_row(user_mediacloud_key(), q, fq, stories_per_page, sort, page_limit, props),
                    mimetype='text/csv; charset=utf-8', headers=headers)


# generator you can use to handle a long list of stories row by row (one row per story)
def _story_list_by_page_as_csv_row(api_key, q, fq, stories_per_page, sort, page_limit, props):
    yield ','.join(props) + '\n'  # first send the column names
    for page in _story_list_by_page(api_key, q, fq, stories_per_page, sort, page_limit):
        for story in page:
            cleaned_row = csv.dict2row(props, story)
            row_string = ','.join(cleaned_row) + '\n'
            yield row_string


# generator you can use to do something for each page of story results
def _story_list_by_page(api_key, q, fq, stories_per_page, sort, page_limit=None):
    last_processed_stories_id = 0  # download oldest first
    page_count = 0
    while True:
        if (page_limit is not None) and (page_count >= page_limit):
            break
        story_page = apicache.story_list_page(api_key, q, fq, last_processed_stories_id, stories_per_page, sort)
        if len(story_page) is 0:  # this is the last page so bail out
            break
        for s in story_page:
            if INCLUDE_MEDIA_METADATA_IN_CSV:
                # add in media metadata to the story (from lazy cache)
                media_id = s['media_id']
                # need to call internal helper because we are in response context and can't automatically fetch current_user
                media = base_cache.get_media_with_key(api_key, media_id)
                for k, v in media['metadata'].items():
                    s['media_{}'.format(k)] = v['label'] if v is not None else None
            # and add in the story metadata too
            for k, v in s['metadata'].items():
                s['story_{}'.format(k)] = v['tag'] if v is not None else None

            story_tag_ids = [t['tags_id'] for t in s['story_tags']]
            # add in the names of any themes
            if tag_util.NYT_LABELER_1_0_0_TAG_ID in story_tag_ids:
                        s['themes'] = ", ".join([t['tag'] for t in s['story_tags']
                                                if t['tag_sets_id'] == tag_util.NYT_LABELS_TAG_SET_ID])
        if story_page != None:
            yield story_page
        last_processed_stories_id = story_page[-1]['processed_stories_id']
        page_count += 1
