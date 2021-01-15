# pylint: disable=too-many-instance-attributes

import logging
import os
from operator import itemgetter
import json
import codecs

from server import base_dir, mc, TOOL_API_KEY
from server.auth import user_mediacloud_client
from server.cache import cache
from server.util.stringutil import snake_to_camel
from server.util.config import get_default_config

logger = logging.getLogger(__name__)

# constants related to NYT labels (ie. tags on stories indicating what they are about)
NYT_LABELS_SAMPLE_SIZE = 10000  # the sample size to use for looking at NYT descriptor tags
BAD_NYT_THEME_TAGS = ['no index terms from nytimes', 'recordings (audio)']

# constants related to the CLIFF-based geotagging (ie. tags on stories indicating places they are about)
GEO_SAMPLE_SIZE = 10000  # the sample size to use for looking at geo tags

# Source collection tags sets
COLLECTION_SET_PARTISANSHIP_QUINTILES_2016 = [9360520, 9360521, 9360522, 9360523, 9360524, ]
COLLECTION_SET_PARTISANSHIP_QUINTILES_2019 = [200363048, 200363049, 200363050, 200363061, 200363062, ]


def _load_media_collection_config():
    """
    To allow for per-instance configuration, the specific collections to show in various places are stored
    in this static file.
    """
    with open(os.path.join(base_dir, 'server', 'static', 'data', 'media-collection-tag-sets.json')) as f:
        return json.load(f)


class TagSetDiscoverer:
    class __TagSetDiscoverer:
        def __init__(self):
            self._discover()

        def as_dict(self):
            current_state = {}
            for prop, value in vars(self).items():
                current_state[snake_to_camel(prop[1:])] = value
            current_state['mediaMetadataSets'] = self.media_metadata_sets()
            current_state['mediaMetadataSetsByName'] = {
                'mediaPrimaryLanguageSet': self.media_primary_language_set,
                'mediaPubCountrySet': self.media_pub_country_set,
                'mediaPubStateSet': self.media_pub_state_set,
                'mediaSubjectCountrySet': self.media_subject_country_set,
                'mediaTypeSet': self.media_type_set,
            }
            current_state['collectionSets'] = self.collection_sets()
            return current_state

        def _discover_by_name(self, tag_sets, tag_set_name):
            tag_set = [ts for ts in tag_sets if ts['name'] == tag_set_name][0]
            return tag_set['tag_sets_id']

        def _discover(self):
            try:
                tag_sets = mc.tagSetList(rows=500)
                self._nyt_themes_set = self._discover_by_name(tag_sets, 'nyt_labels')
                self._nyt_themes_versions_set = self._discover_by_name(tag_sets, 'nyt_labels_version')
                self._cliff_versions_set = self._discover_by_name(tag_sets, 'geocoder_version')
                self._cliff_places_set = self._discover_by_name(tag_sets, 'mc-geocoder@media.mit.edu')
                self._cliff_people_set = self._discover_by_name(tag_sets, 'cliff_people')
                self._cliff_orgs_set = self._discover_by_name(tag_sets, 'cliff_organizations')
                self._media_pub_country_set = self._discover_by_name(tag_sets, 'pub_country')
                self._media_pub_state_set = self._discover_by_name(tag_sets, 'pub_state')
                self._media_primary_language_set = self._discover_by_name(tag_sets, 'primary_language')
                self._media_subject_country_set = self._discover_by_name(tag_sets, 'subject_country')
                self._media_type_set = self._discover_by_name(tag_sets, 'media_format')
                self._collections_set = self._discover_by_name(tag_sets, 'collection')
                self._geo_collections_set = self._discover_by_name(tag_sets, 'geographic_collection')
                self._partisan_2019_collections_set = self._discover_by_name(tag_sets, 'twitter_partisanship')
                self._partisan_2016_collections_set = self._discover_by_name(tag_sets, 'retweet_partisanship_2016_count_10')
                self._extractor_versions_set = self._discover_by_name(tag_sets, 'extractor_version')
                self._date_guess_methods_set = self._discover_by_name(tag_sets, 'date_guess_method')
            except Exception as e:
                logger.error("Couldn't find a required tag set. See /doc/required-tags.md for more info on all the "
                             "tag-sets the back-end should expose")
                logger.exception(e)

        @property
        def nyt_themes_set(self):
            return self._nyt_themes_set

        @property
        def nyt_themes_versions_set(self):
            return self._nyt_themes_versions_set

        @property
        def cliff_versions_set(self):
            return self._cliff_versions_set

        @property
        def cliff_places_set(self):
            return self._cliff_places_set

        @property
        def cliff_people_set(self):
            return self._cliff_people_set

        @property
        def cliff_orgs_set(self):
            return self._cliff_orgs_set

        @property
        def media_pub_country_set(self):
            return self._media_pub_country_set

        @property
        def media_pub_state_set(self):
            return self._media_pub_state_set

        @property
        def media_primary_language_set(self):
            return self._media_primary_language_set

        @property
        def media_subject_country_set(self):
            return self._media_subject_country_set

        @property
        def media_type_set(self):
            return self._media_type_set

        def media_metadata_sets(self):
            return [
                self.media_pub_country_set,
                self.media_pub_state_set,
                self.media_primary_language_set,
                self.media_subject_country_set,
                self.media_type_set
            ]

        @property
        def collections_set(self):
            return self._collections_set

        @property
        def geo_collections_set(self):
            return self._geo_collections_set

        @property
        def partisan_2019_collections_set(self):
            return self._partisan_2019_collections_set

        @property
        def partisan_2016_collections_set(self):
            return self._partisan_2016_collections_set

        def collection_sets(self):
            # a list of all the tag sets that count as ones that hold collections (for searching and listing purposes)
            return [
                self.collections_set,
                self.geo_collections_set,
                self.partisan_2019_collections_set,
                self.partisan_2016_collections_set
            ]

        @property
        def extractor_versions_set(self):
            return self._extractor_versions_set

        @property
        def date_guess_methods_set(self):
            return self._date_guess_methods_set

    instance = None

    def __init__(self):
        if not TagSetDiscoverer.instance:
            TagSetDiscoverer.instance = TagSetDiscoverer.__TagSetDiscoverer()

    def __getattr__(self, name):
        return getattr(self.instance, name)


class TagDiscoverer:
    class __TagDiscoverer:
        def __init__(self):
            self._discover()

        def as_dict(self):
            current_state = {}
            for prop, value in vars(self).items():
                current_state[snake_to_camel(prop[1:])] = value
            return current_state

        def _from_tag_and_set_names(self, tag_sets, tag_set_name, tag_name):
            tag_set = [ts for ts in tag_sets if ts['name'] == tag_set_name][0]
            tags_in_set = mc.tagList(tag_sets_id=tag_set['tag_sets_id'])
            tag = [t for t in tags_in_set if t['tag'] == tag_name][0]
            return tag['tags_id']

        def _all_from_set_name(self, tag_sets, tag_set_name):
            tag_set = [ts for ts in tag_sets if ts['name'] == tag_set_name][0]
            tags = tags_in_tag_set(TOOL_API_KEY, tag_set['tag_sets_id'])
            return [t['tags_id'] for t in tags]

        def _discover(self):
            try:
                tag_sets = mc.tagSetList(rows=500)
                self._is_spidered_story_tag = self._from_tag_and_set_names(tag_sets, 'spidered', 'spidered')
                self._is_undateable_story_tag = self._from_tag_and_set_names(tag_sets, 'date_invalid', 'undateable')
                self._nyt_themes_version_tags = self._all_from_set_name(tag_sets, 'nyt_labels_version')
                self._cliff_version_tags = self._all_from_set_name(tag_sets, 'geocoder_version')
                # load up the list of tag sets that should be treated as ones that hold collections of media sources
                collection_config = _load_media_collection_config()
                self._default_collection_tag = collection_config['defaultCollection']['tagsId']
                featured_tag_lists = [t['tags'] for t in collection_config['featuredCollections']['entries']]
                self._featured_collection_tags = [t for t_list in featured_tag_lists for t in t_list]
            except Exception as e:
                logger.error("Couldn't find a required tag. See /doc/required-tags.md for more info on all the tags "
                             "the back-end should expose")
                logger.exception(e)

        @property
        def is_spidered_story_tag(self):
            return self._is_spidered_story_tag

        @property
        def is_undateable_story_tag(self):
            return self._is_undateable_story_tag

        @property
        def nyt_themes_version_tags(self):
            return self._nyt_themes_version_tags

        @property
        def cliff_version_tags(self):
            return self._cliff_version_tags

        @property
        def default_collection_tag(self):
            return self._default_collection_tag

        @property
        def featured_collection_tags(self):
            return self._featured_collection_tags

    instance = None

    def __init__(self):
        if not TagDiscoverer.instance:
            TagDiscoverer.instance = TagDiscoverer.__TagDiscoverer()

    def __getattr__(self, name):
        return getattr(self.instance, name)

# load the config helper
config = get_default_config()


def processed_for_themes_query_clause():
    """
    :return: A solr query clause you can use to filter for stories that have been tagged by any version
     of our CLIFF geotagging engine (ie. tagged with people, places, and organizations)
    """
    return "(tags_id_stories:({}))".format(" ".join([str(t) for t in TagSetDiscoverer().nyt_themes_version_tags]))


def processed_for_entities_query_clause():
    """
    :return: A solr query clause you can use to filter for stories that have been tagged by any version
     of our CLIFF geotagging engine (ie. tagged with people, places, and organizations)
    """
    return "(tags_id_stories:({}))".format(" ".join([str(t) for t in TagDiscoverer().cliff_version_tags]))


def is_metadata_tag_set(tag_sets_id):
    """
    Find out if a tag set is one used to hold metadata on a Source.
    :param tag_sets_id: the id of tag set
    :return: True if it is a valid metadata tag set, False if it is not
    """
    return int(tag_sets_id) in TagSetDiscoverer().media_metadata_sets()


def is_bad_theme(tag_text: str):
    """
    Find out if a tag set is one used to hold metadata on a Source.
    :param tag_text: the test of the tag (so it isn't hard-coded to our intsall)
    :return: True if it is a valid metadata tag set, False if it is not
    """
    return tag_text in BAD_NYT_THEME_TAGS


def label_for_metadata_tag(tag):
    label = None
    tag_sets_id = tag['tag_sets_id']
    if tag_sets_id == TagSetDiscoverer().media_pub_country_set:
        label = tag['tag'][-3:]
    elif tag_sets_id == TagSetDiscoverer().media_pub_state_set:
        label = tag['tag'][4:]
    elif tag_sets_id == TagSetDiscoverer().media_primary_language_set:
        label = tag['tag']
    elif tag_sets_id == TagSetDiscoverer().media_subject_country_set:
        label = tag['tag']
    elif tag_sets_id == TagSetDiscoverer().media_type_set:
        label = tag['tag']
    return label


static_tag_set_cache_dir = os.path.join(base_dir, 'server', 'static', 'data')


def tags_in_tag_set(mc_api_key, tag_sets_id):
    return tag_set_with_tags(mc_api_key, tag_sets_id, False, True)['tags']


def tag_set_with_tags(mc_api_key, tag_sets_id, only_public_tags=False, use_file_cache=False):
    # don't need to cache here, because either you are reading from a file, or each page is cached
    local_mc = user_mediacloud_client(mc_api_key)
    if use_file_cache:
        file_name = "tags_in_{}.json".format(tag_sets_id)
        file_path = os.path.join(static_tag_set_cache_dir, file_name)
        if os.path.isfile(file_path):
            return cached_tag_set_file(file_path)   # more caching!
    tag_set = local_mc.tagSet(tag_sets_id)
    # page through tags
    more_tags = True
    all_tags = []
    last_tags_id = 0
    while more_tags:
        tags = _cached_tag_page(mc_api_key, tag_set['tag_sets_id'], last_tags_id, 500, only_public_tags)
        all_tags = all_tags + tags
        if len(tags) > 0:
            last_tags_id = tags[-1]['tags_id']
        more_tags = len(tags) != 0
    # double check the show_on_media because that controls public or not
    tag_list = [t for t in all_tags if (only_public_tags is False) or
                (t['show_on_media'] == 1 or t['show_on_media'] is True)]
    # sort by label (or tag if no label exists)
    for t in tag_list:
        t['sort_key'] = t['label'].lower() if t['label'] else t['tag'].lower()
    tag_list = sorted(tag_list, key=itemgetter('sort_key'))
    for t in tag_list:
        del t['sort_key']
    tag_set['tags'] = tag_list
    tag_set['name'] = tag_set['label']
    return tag_set


@cache.cache_on_arguments()
def _cached_tag_page(mc_api_key, tag_sets_id, last_tags_id, rows, public_only):
    # user agnositic here because the list of tags in a collection only changes for users based on public_only
    local_mc = user_mediacloud_client(mc_api_key)
    tag_list = local_mc.tagList(tag_sets_id=tag_sets_id, last_tags_id=last_tags_id, rows=rows, public_only=public_only)
    return tag_list


@cache.cache_on_arguments()
def cached_tag_set_file(file_path):
    # hold the file in memory to reduce reads
    with codecs.open(file_path, 'r', 'utf-8') as json_data:
        data = json.load(json_data)
        return data


def media_with_tag(tags_id, cached=False):
    more_media = True
    all_media = []
    max_media_id = 0
    while more_media:
        logger.debug("last_media_id %s", str(max_media_id))
        if cached:
            media = cached_media_with_tag_page(tags_id, max_media_id)
        else:
            media = _media_with_tag_page(tags_id, max_media_id)
        all_media = all_media + media
        if len(media) > 0:
            max_media_id = media[len(media) - 1]['media_id']
        more_media = len(media) == 100
    return sorted(all_media, key=lambda t: t['name'].lower())


@cache.cache_on_arguments()
def cached_media_with_tag_page(tags_id, max_media_id):
    """
    We have to do this on the page, not the full list because memcache has a 1MB cache upper limit,
    and some of the collections have TONS of sources
    Ok to be a cross-user cache here
    """
    return _media_with_tag_page(tags_id, max_media_id)


def _media_with_tag_page(tags_id, max_media_id):
    user_mc = user_mediacloud_client()
    return user_mc.mediaList(tags_id=tags_id, last_media_id=max_media_id, rows=100)
