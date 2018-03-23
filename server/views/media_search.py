import logging

from server.auth import user_mediacloud_client

logger = logging.getLogger(__name__)

MAX_SOURCES = 40


def media_search(search_str, tags_id=None):
    mc = user_mediacloud_client()
    return mc.mediaList(name_like=search_str, tags_id=tags_id, rows=MAX_SOURCES, sort="num_stories")


def collection_search(search_str, public_only, tag_sets_id_list):
    user_mc = user_mediacloud_client()
    return user_mc.tagList(tag_sets_id_list, public_only=public_only, name_like=search_str)
