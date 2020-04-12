"""
This helper caches some tag sets that we use all the time to json files. This is helpful because those
tag sets don't change very often, so reading them from json is much faster than querying the back-end and 
caching in memory.
"""

from server.scripts.gen_tags_in_tag_set_json import write_tags_in_set_to_json
import server.util.tags as tag_util

tag_sets_to_cache = [tag_util.TAG_SETS_ID_PUBLICATION_COUNTRY,
                     tag_util.TAG_SETS_ID_PUBLICATION_STATE,
                     tag_util.TAG_SETS_ID_PRIMARY_LANGUAGE,
                     tag_util.TAG_SETS_ID_COUNTRY_OF_FOCUS,
                     tag_util.TAG_SETS_ID_MEDIA_TYPE
                     ]

write_tags_in_set_to_json(tag_sets_to_cache, only_public_tags=False)
