import logging

from server import mc
from server.auth import user_mediacloud_client, user_admin_mediacloud_client
from flask import jsonify, request

logger = logging.getLogger(__name__)

MAX_SOURCES = 40

def media_search_with_page(search_str, tags_id=None, **kwargs):
    link_id = request.args.get('linkId') if 'linkId' in request.args else 0
    user_mc = user_admin_mediacloud_client()
    media_page = user_mc.mediaList(name_like=search_str, tags_id=tags_id, last_media_id=link_id, rows=100, sort="num_stories", **kwargs)
    if len(media_page) ==0:
        last_media_id = -1
    else:
        last_media_id = media_page[len(media_page)-1]['media_id']
    return media_page, last_media_id

def media_search(search_str, tags_id=None, **kwargs):
    mc = user_mediacloud_client()
    return mc.mediaList(name_like=search_str, tags_id=tags_id, rows=MAX_SOURCES, sort="num_stories", **kwargs)


def collection_search(search_str, public_only, tag_sets_id_list):
    user_mc = user_mediacloud_client()
    return user_mc.tagList(tag_sets_id_list, public_only=public_only, name_like=search_str)
