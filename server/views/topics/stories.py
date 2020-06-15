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
from server import app, cliff
from server.auth import user_mediacloud_key, user_mediacloud_client
from server.cache import cache
from server.util.request import api_error_handler, filters_from_args
from server.views.topics import concatenate_query_for_solr, _parse_collection_ids, _parse_media_ids
from server.util.tags import TAG_SPIDERED_STORY

logger = logging.getLogger(__name__)


@cache.cache_on_arguments()
def _cached_geoname(geonames_id):
    return cliff.geonames_lookup(geonames_id)


@app.route('/api/topics/<topics_id>/stories/counts', methods=['GET'])
@flask_login.login_required
@api_error_handler
def story_counts(topics_id):
    query = request.form['keywords'] if 'keywords' in request.form else ''
    #for preview information in subtopics and platforms - scope by media source info
    collections = _parse_collection_ids(request.args)
    sources = _parse_media_ids(request.args)
    merged_args = {}
    if ((sources not in [None, ''] and len(sources) > 0) or collections not in [None, ''] and len(collections) > 0):
        query = concatenate_query_for_solr(query, sources, collections)
        merged_args = {'q': query }
    filtered = apicache.topic_story_count(user_mediacloud_key(), topics_id, **merged_args)
    total = apicache.topic_story_count(user_mediacloud_key(), topics_id, timespans_id=None, snapshots_id=None, foci_id=None, q=None)
    return jsonify({'counts': {'count': filtered['count'], 'total': total['count']}})


def _public_safe_topic_story_count(topics_id, q):
    total = apicache.topic_story_count(user_mediacloud_key(), topics_id, q=apicache.add_to_user_query(None))
    # force a count with just the query
    matching = apicache.topic_story_count(user_mediacloud_key(), topics_id, q=apicache.add_to_user_query(q))
    return jsonify({'counts': {'count': matching['count'], 'total': total['count']}})


def platform_csv_column_header_prefix(topic_seed_query):
    return "{}_{}_".format(topic_seed_query['platform'], topic_seed_query['source'])


def stream_story_list_csv(user_key, filename, topic, **kwargs):
    filename = topic['name'] + '-' + filename
    has_twitter_data = (topic['ch_monitor_id'] is not None) and (topic['ch_monitor_id'] != 0)

    # we have to make a separate call to the media info if the user wants to inlcude the media metadata
    include_media_metadata = ('media_metadata' in kwargs) and (kwargs['media_metadata'] == '1')
    # we have to make an extra, non-topic storyList calls if the user wants to include subtopics and themes (ie. story tags)
    include_story_tags = ('story_tags' in kwargs) and (kwargs['story_tags'] == '1')
    # if the focusId is a URL Sharing subtopic, then we have platform-specific post/author/channel share counts
    include_platform_url_shares = kwargs['include_platform_url_shares'] if 'include_platform_url_shares' in kwargs else False
    # if this topic includes platforms, then we have URL sharing counts (post/author/channel) for each platform
    include_all_url_shares = kwargs['include_all_url_shares'] if 'include_all_url_shares' in kwargs else False
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

    # do a check to see if the user has added in a real query or not
    if 'q' in params:
        params['q'] = params['q'] if 'q' not in [None, '', 'null', 'undefined'] else None
    params['limit'] = 1000  # an arbitrary value to let us page through with big topics (note, this is the page size)

    # set up the dict keys / column headers that the user cares about for this download
    props = [
        'stories_id', 'publish_date', 'title', 'url', 'language', 'ap_syndicated', 'inlink_count',
        'facebook_share_count'
    ]
    if include_platform_url_shares:
        props += ['post_count', 'channel_count', 'author_count']
    if include_all_url_shares:
        # if the user requested to download all the url sharing counts by platform, we need to grab the config for that
        # which is held in the platform seed query objects
        topic_seed_queries = topic['topic_seed_queries']
        extra_columns = []
        for tsq in topic_seed_queries:
            prefix = platform_csv_column_header_prefix(tsq)
            extra_columns += [prefix+'post_count', prefix+'channel_count', prefix+'author_count']
        props += extra_columns
        params['topic_seed_queries'] = topic_seed_queries
    if has_twitter_data:
        props.append('simple_tweet_count')
    if include_story_tags:
        props += ['themes', 'subtopics']
    props += ['outlink_count', 'media_inlink_count', 'media_id', 'media_name', 'media_url']
    if include_media_metadata:
        props += ['media_pub_country', 'media_pub_state', 'media_language', 'media_about_country', 'media_media_type']

    timestamped_filename = csv.safe_filename(filename)
    headers = {
        "Content-Disposition": "attachment;filename=" + timestamped_filename
    }
    return Response(_topic_story_list_by_page_as_csv_row(user_key, topic['topics_id'], props, **params),
                    mimetype='text/csv; charset=utf-8', headers=headers)


# generator you can use to handle a long list of stories row by row (one row per story)
def _topic_story_list_by_page_as_csv_row(user_key, topics_id, props, **kwargs):
    yield ','.join(props) + '\n'  # first send the column names
    include_all_url_shares = kwargs['include_all_url_shares'] if 'include_all_url_shares' in kwargs else False
    story_count = 0
    link_id = 0
    more_pages = True
    yet_to_hit_story_limit = True
    has_story_limit = ('story_limit' in kwargs) and (kwargs['story_limit'] is not None)
    # page through the story list results, until we run out or we hit the user's desired limit
    while more_pages and ((not has_story_limit) or (has_story_limit and yet_to_hit_story_limit)):
        page = _topic_story_page_with_media(user_key, topics_id, link_id, **kwargs)
        if 'next' in page['link_ids']:
            link_id = page['link_ids']['next']
        else:
            more_pages = False
        for s in page['stories']:
            if include_all_url_shares:
                topic_seed_queries = kwargs['topic_seed_queries']
                # add in each header col
                for item in s['url_sharing_counts']:
                    seed_query = [tsq for tsq in topic_seed_queries if tsq['topic_seed_queries_id'] == item['topic_seed_queries_id']][0]
                    prefix = platform_csv_column_header_prefix(seed_query)
                    s[prefix + "post_count"] = item['post_count']
                    s[prefix + "channel_count"] = item['channel_count']
                    s[prefix + "author_count"] = item['author_count']
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

    include_media_metadata = ('media_metadata' in kwargs) and (kwargs['media_metadata'] == '1')
    include_story_tags = ('story_tags' in kwargs) and (kwargs['story_tags'] == '1')

    # need to make sure invalid params don't make it to API call
    args = {k: v for k, v in kwargs.copy().items() if k in apicache.TOPIC_STORY_LIST_API_PARAMS}
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
        timespans = apicache.cached_topic_timespan_list(topics_id, snapshots_id=s['snapshots_id'], foci_id=None)
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
