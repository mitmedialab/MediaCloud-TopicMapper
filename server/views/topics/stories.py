import logging
import flask_login
from flask import jsonify, request, Response
import mediacloud
import mediacloud.error
import concurrent.futures

import server.util.csv as csv
import server.util.tags as tag_util
import server.views.topics.apicache as apicache
import server.views.apicache as base_apicache
import server.util.pushshift as pushshift
import server.util.dates as dates
from server import app, cliff, TOOL_API_KEY
from server.auth import is_user_logged_in, user_mediacloud_key, user_admin_mediacloud_client, user_mediacloud_client
from server.cache import cache
from server.util.request import api_error_handler, filters_from_args
from server.views.topics import access_public_topic, concatenate_query_for_solr, _parse_collection_ids, _parse_media_ids
from server.util.tags import TAG_SPIDERED_STORY

logger = logging.getLogger(__name__)

PRIMARY_ENTITY_TYPES = ['PERSON', 'LOCATION', 'ORGANIZATION']

MEDIA_INFO_POOL_SIZE = 15


@cache.cache_on_arguments()
def _cached_geoname(geonames_id):
    return cliff.geonames_lookup(geonames_id)


@app.route('/api/topics/<topics_id>/stories/counts', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_counts(topics_id):
    if access_public_topic(topics_id):
        local_key = TOOL_API_KEY
    elif is_user_logged_in():
        local_key = user_mediacloud_key()
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})
    query = request.form['keywords'] if 'keywords' in request.form else ''
    #for preview information in subtopics and platforms - scope by media source info
    collections = _parse_collection_ids(request.args)
    sources = _parse_media_ids(request.args)
    merged_args = {}
    if ((sources not in [None, ''] and len(sources) > 0) or collections not in [None, ''] and len(collections) > 0):
        query = concatenate_query_for_solr(query, sources, collections)
        merged_args = {'q': query }
    filtered = apicache.topic_story_count(local_key, topics_id, **merged_args)
    total = apicache.topic_story_count(local_key, topics_id, timespans_id=None, snapshots_id=None, foci_id=None, q=None)
    return jsonify({'counts': {'count': filtered['count'], 'total': total['count']}})


@app.route('/api/topics/<topics_id>/stories/undateable-counts', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_undateable_count(topics_id):
    q = "tags_id_stories:{}".format(tag_util.STORY_UNDATEABLE_TAG)
    return _public_safe_topic_story_count(topics_id, q)


@app.route('/api/topics/<topics_id>/stories/english-counts', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_english_counts(topics_id):
    q = "language:en"
    return _public_safe_topic_story_count(topics_id, q)


def _public_safe_topic_story_count(topics_id, q):
    if access_public_topic(topics_id):
        total = apicache.topic_story_count(TOOL_API_KEY, topics_id, q=apicache.add_to_user_query(None))
        # force a count with just the query
        matching = apicache.topic_story_count(TOOL_API_KEY, topics_id, q=apicache.add_to_user_query(q))
    elif is_user_logged_in():
        total = apicache.topic_story_count(user_mediacloud_key(), topics_id, q=apicache.add_to_user_query(None))
        # force a count with just the query
        matching = apicache.topic_story_count(user_mediacloud_key(), topics_id, q=apicache.add_to_user_query(q))
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})
    return jsonify({'counts': {'count': matching['count'], 'total': total['count']}})


@app.route('/api/topics/<topics_id>/stories', methods=['GET'])
@api_error_handler
def topic_stories(topics_id):
    if access_public_topic(topics_id):
        stories = apicache.topic_story_list(TOOL_API_KEY, topics_id, snapshots_id=None, timespans_id=None,
                                            foci_id=None, q=None)
    elif is_user_logged_in():
        query = request.form['keywords'] if 'keywords' in request.form else ''
        # for preview information in subtopics and platforms - scope by media source info
        collections = _parse_collection_ids(request.args)
        sources = _parse_media_ids(request.args)
        merged_args = {}
        if (sources not in [None, ''] and len(sources) > 0) or collections not in [None, ''] and len(collections) > 0:
            query = concatenate_query_for_solr(query, sources, collections)
            merged_args = {'q': query}
        stories = apicache.topic_story_list(user_mediacloud_key(), topics_id, **merged_args)
    else:
        return jsonify({'status': 'Error', 'message': 'Invalid attempt'})

    return jsonify(stories)


@app.route('/api/topics/<topics_id>/stories.csv', methods=['GET'])
@flask_login.login_required
def topic_stories_csv(topics_id):
    user_mc = user_admin_mediacloud_client()
    topic = user_mc.topic(topics_id)
    story_limit = request.args['storyLimit'] if 'storyLimit' in request.args else None
    story_tags = (request.args['storyTags'] == '1') if 'storyTags' in request.args else False
    media_metadata = (request.args['mediaMetadata'] == '1') if 'mediaMetadata' in request.args else False
    reddit_submissions = (request.args['redditData'] == '1') if 'redditData' in request.args else False
    include_fb_date = (request.args['fbData'] == '1') if 'fbData' in request.args else False
    return stream_story_list_csv(user_mediacloud_key(), "stories", topic,
                                 story_limit=story_limit, reddit_submissions=reddit_submissions,
                                 story_tags=story_tags, fb_data=include_fb_date,
                                 media_metadata=media_metadata)


def stream_story_list_csv(user_key, filename, topic, **kwargs):
    filename = topic['name'] + '-' + filename
    has_twitter_data = (topic['ch_monitor_id'] is not None) and (topic['ch_monitor_id'] != 0)

    # as_attachment = kwargs['as_attachment'] if 'as_attachment' in kwargs else True
    include_media_metadata = ('media_metadata' in kwargs) and (kwargs['media_metadata'] is True)
    include_story_tags = ('story_tags' in kwargs) and (kwargs['story_tags'] is True)
    include_reddit_submissions = ('reddit_submissions' in kwargs) and (kwargs['reddit_submissions'] is True)
    include_fb_date = kwargs['fb_data'] if 'fb_data' in kwargs else False
    all_stories = []
    params = kwargs.copy()

    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'timespans_id': timespans_id,
        'snapshots_id': snapshots_id,
        'foci_id': foci_id,
        'q': q,
        'sort': request.args['sort'] if 'sort' in request.args else None,
    }
    params.update(merged_args)

    story_count = apicache.topic_story_count(user_key, topic['topics_id'],
                                             snapshots_id=params['snapshots_id'], timespans_id=params['timespans_id'],
                                             foci_id=params['foci_id'], q=params['q'])
    logger.info("Total stories to download: {}".format(story_count['count']))

    if 'as_attachment' in params:
        del params['as_attachment']
    if 'fb_data' in params:
        del params['fb_data']
    if 'q' in params:
        params['q'] = params['q'] if 'q' not in [None, '', 'null', 'undefined'] else None
    params['limit'] = 1000  # an arbitrary value to let us page through with big topics

    # determine which props the user actually wants to download
    props = [
        'stories_id', 'publish_date', 'title', 'url', 'language', 'ap_syndicated', 'inlink_count',
        'facebook_share_count',
    ]
    if has_twitter_data:
        props.append('simple_tweet_count')
    if include_reddit_submissions:
        props.append('reddit_submissions')
    if include_fb_date:
        props.append('facebook_collection_date')
    if include_story_tags:
        props += ['themes', 'subtopics']
    props += ['outlink_count', 'media_inlink_count', 'media_id', 'media_name', 'media_url']
    if include_media_metadata:
        props += ['media_pub_country', 'media_pub_state', 'media_language', 'media_about_country', 'media_media_type']

    if include_fb_date:
        all_fb_count = []
        more_fb_count = True
        link_id = 0
        local_mc = user_mediacloud_client(user_key)
        while more_fb_count:
            fb_page = local_mc.topicStoryListFacebookData(topic['topics_id'], limit=100, link_id=link_id)

            all_fb_count = all_fb_count + fb_page['counts']
            if 'next' in fb_page['link_ids']:
                link_id = fb_page['link_ids']['next']
                more_fb_count = True
            else:
                more_fb_count = False

        # now iterate through each list and set up the fb collection date
        for s in all_stories:
            for fb_item in all_fb_count:
                if int(fb_item['stories_id']) == int(s['stories_id']):
                    s['facebook_collection_date'] = fb_item['facebook_api_collect_date']

    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    return Response(_topic_story_list_by_page_as_csv_row(user_key, topic['topics_id'], props, **params),
                    mimetype='text/csv; charset=utf-8', headers=headers)


@app.route('/api/topics/<topics_id>/stories/story-links.csv', methods=['GET'])
@flask_login.login_required
def get_topic_story_links_csv(topics_id):
    user_mc = user_mediacloud_client()
    topic = user_mc.topic(topics_id)
    return stream_story_link_list_csv(user_mediacloud_key(), topic['name'] + '-story-links', topics_id)


def stream_story_link_list_csv(user_key, filename, topics_id, **kwargs):
    params = kwargs.copy()
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id
    }
    params.update(merged_args)
    if 'q' in params:
        params['q'] = params['q'] if 'q' not in [None, '', 'null', 'undefined'] else None
    params['limit'] = 500  # an arbitrary value based on testing to let us page through with big topics

    props = [
        'stories_id', 'media_id', 'publish_date', 'title', 'url', 'language', 'ap_syndicated',
        'inlink_count', 'outlink_count'
        # 'media_pub_country', 'media_pub_state', 'media_language', 'media_about_country', 'media_media_type'
    ]

    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    return Response(_topic_story_link_list_by_page_as_csv_row(user_key, topics_id, props, **params),
                    mimetype='text/csv; charset=utf-8', headers=headers)


# generator you can use to handle a long list of stories row by row (one row per story)
def _topic_story_link_list_by_page_as_csv_row(user_key, topics_id, props, **kwargs):
    local_mc = user_admin_mediacloud_client(user_key)
    spec_props = [
        'source_stories_id', 'source_media_id', 'source_publish_date', 'source_title', 'source_url', 'source_language',
        'source_ap_syndicated', 'source_inlink_count', 'source_outlink_count',
        'ref_stories_id', 'ref_media_id', 'ref_publish_date', 'ref_title', 'ref_url', 'ref_language',
        'ref_ap_syndicated', 'ref_inlink_count', 'ref_outlink_count',
        # 'media_pub_country', 'media_pub_state', 'media_language', 'media_about_country', 'media_media_type'
    ]
    yield ','.join(spec_props) + '\n'  # first send the column names
    link_id = 0
    more_pages = True
    while more_pages:
        # fetch one page of the links, which only include story ids
        story_link_page = apicache.topic_story_link_list_by_page(user_key, topics_id, link_id=link_id, **kwargs)
        # now get the full story info by combining the story ids into a one big list
        story_src_ids = [str(s['source_stories_id']) for s in story_link_page['links']]
        story_ref_ids = [str(s['ref_stories_id']) for s in story_link_page['links']]
        page_story_ids = list(set(story_src_ids + story_ref_ids))
        # note: ideally this would use the stories_id argument to pass them in, but that isn't working :-(
        stories_info_list = apicache.topic_story_list_by_page(user_key, topics_id, stories_id=page_story_ids,
                                                              link_id=None, limit=kwargs['limit'])
        # now add in the story info to each row from the links results, so story info is there along with the stories_id
        for s in story_link_page['links']:
            for s_info in stories_info_list['stories']:
                if s['source_stories_id'] == s_info['stories_id']:
                    s['source_info'] = s_info
                if s['ref_stories_id'] == s_info['stories_id']:
                    s['ref_info'] = s_info
        # now that we have all the story info, stream this page of info the user
        for s in story_link_page['links']:
            try:
                cleaned_source_info = csv.dict2row(props, s['source_info'])
                cleaned_ref_info = csv.dict2row(props, s['ref_info'])
                row_string = ','.join(cleaned_source_info) + ',' + ','.join(cleaned_ref_info) + '\n'
                yield row_string
            except KeyError as ke:
                yield "error getting story info on link from {} to {}\n".format(s['ref_stories_id'],
                                                                                s['source_stories_id'])
                logger.exception(ke)
        # figure out if we have more pages to process or not
        if 'next' in story_link_page['link_ids']:
            link_id = story_link_page['link_ids']['next']
        else:
            more_pages = False


# generator you can use to handle a long list of stories row by row (one row per story)
def _topic_story_list_by_page_as_csv_row(user_key, topics_id, props, **kwargs):
    yield ','.join(props) + '\n'  # first send the column names
    story_count = 0
    link_id = 0
    more_pages = True
    yet_to_hit_story_limit = True
    has_story_limit = ('story_limit' in kwargs) and (kwargs['story_limit'] is not None)
    while more_pages and ((not has_story_limit) or (has_story_limit and yet_to_hit_story_limit)):
        page = _topic_story_page_with_media(user_key, topics_id, link_id, **kwargs)
        if 'next' in page['link_ids']:
            link_id = page['link_ids']['next']
        else:
            more_pages = False
        for s in page['stories']:
            # first foci down to just the readable names
            s['subtopics'] = ["{}: {}".format(f['focal_set_name'], f['name']) for f in s['foci']]
            cleaned_row = csv.dict2row(props, s)
            row_string = ','.join(cleaned_row) + '\n'
            yield row_string
        story_count += len(page['stories'])
        yet_to_hit_story_limit = has_story_limit and (story_count < int(kwargs['story_limit']))


def _media_info_worker(info):
    return base_apicache.get_media_with_key(info['user_key'], info['media_id'])


# generator you can use to do something for each page of story results
def _topic_story_page_with_media(user_key, topics_id, link_id, **kwargs):
    media_lookup = {}

    include_media_metadata = ('media_metadata' in kwargs) and (kwargs['media_metadata'] is True)
    include_story_tags = ('story_tags' in kwargs) and (kwargs['story_tags'] is True)
    include_reddit_submissions = ('reddit_submissions' in kwargs) and (kwargs['reddit_submissions'] is True)

    args = kwargs.copy()   # need to make sure invalid params don't make it to API call
    optional_args = ['media_metadata', 'story_limit', 'reddit_submissions', 'story_tags', 'include_fb_date']
    for key in optional_args:
        if key in args:
            del args[key]
    story_page = apicache.topic_story_list_by_page(user_key, topics_id, link_id=link_id, **args)

    if len(story_page['stories']) > 0:  # be careful to not construct malformed query if no story ids

        # build a media lookup table in parallel so it is faster
        if include_media_metadata:
            with concurrent.futures.ProcessPoolExecutor() as executor:
                media_ids = set([s['media_id'] for s in story_page['stories']])
                jobs = [{'user_key': user_key, 'media_id': mid} for mid in media_ids]
                job_results = executor.map(_media_info_worker, jobs)  # blocks until they are all done
                media_lookup = {j['media_id']: j for j in job_results}

        if include_story_tags:
            story_ids = [str(s['stories_id']) for s in story_page['stories']]
            stories_with_tags = apicache.story_list(user_key, 'stories_id:(' + " ".join(story_ids) + ")", args['limit'])

        # update story info for each story in the page, put it into the [stories] field, send updated page with
        # stories back
        for s in story_page['stories']:

            # add in media metadata to the story (from page-level cache built earlier)
            if include_media_metadata:
                media = media_lookup[s['media_id']]
                # add in media metadata items
                for k, v in media['metadata'].items():
                    s['media_{}'.format(k)] = v['label'] if v is not None else None

            # build lookup for id => story for all stories in stories with tags (non topic results)
            if include_story_tags:
                for st in stories_with_tags:
                    if s['stories_id'] == st['stories_id']:
                        s.update(st)
                        foci_names = [f['name'] for f in s['foci']]
                        s['subtopics'] = ", ".join(foci_names)
                        s['themes'] = ''
                        story_tag_ids = [t['tags_id'] for t in s['story_tags']]
                        if tag_util.NYT_LABELER_1_0_0_TAG_ID in story_tag_ids:
                            story_tag_ids = [t['tag'] for t in s['story_tags']
                                             if t['tag_sets_id'] == tag_util.NYT_LABELS_TAG_SET_ID]
                            s['themes'] = ", ".join(story_tag_ids)

        # now add in reddit share data if requested
        if include_reddit_submissions:
            story_reddit_submissions = pushshift.reddit_url_submission_counts(story_page['stories'])
            for s in story_page['stories']:
                s['reddit_submissions'] = story_reddit_submissions[s['stories_id']]

    return story_page


@app.route('/api/topics/<topics_id>/stories/counts-by-snapshot', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_counts_by_snapshot(topics_id):
    user_mc = user_mediacloud_client(user_mediacloud_key())
    snapshots = user_mc.topicSnapshotList(topics_id)
    counts = {}
    for s in snapshots:
        # get the count of stories in the overally timespan for this snapshot
        timespans = apicache.cached_topic_timespan_list(user_mediacloud_key(), topics_id,
                                                        snapshots_id=s['snapshots_id'], foci_id=None)
        try:
            total = timespans[0]['story_count']
        except mediacloud.error.MCException:
            total = 0
        except IndexError:  # this doesn't have any snapshots (ie. it failed to generate correctly)
            total = 0
        # search by tag to find out how many stories were spidered
        spidered = 0
        try:
            spidered = apicache.topic_story_count(user_mediacloud_key(), topics_id,
                                                  snapshots_id=s['snapshots_id'], foci_id=None,
                                                  timespans_id=timespans[0]['timespans_id'],
                                                  q="* AND tags_id_stories:{}".format(TAG_SPIDERED_STORY))['count']
        except mediacloud.error.MCException:
            spidered = 0
        except IndexError:  # this doesn't have any snapshots (ie. it failed to generate correctly)
            total = 0
        seeded = total - spidered
        counts[s['snapshots_id']] = {'total': total, 'spidered': spidered, 'seeded': seeded}
    return jsonify(counts)


@app.route('/api/topics/<topics_id>/stories/top-on-dates', methods=['GET'])
@flask_login.login_required
@api_error_handler
def top_by_date(topics_id):
    # we have to query by timespan instead of date, because topicStoryList doesn't support the `fq` param
    weekly_timespans_id = request.args['selectedTimespanId']
    # this will read all filters, and limit and sort from request automatically, so we have to override the timespans_id
    top_stories = apicache.topic_story_list(user_mediacloud_key(), topics_id, timespans_id=weekly_timespans_id)
    results = {
        'stories': top_stories['stories']
    }
    return jsonify(results)
