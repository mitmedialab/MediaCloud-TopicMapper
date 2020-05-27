"""
This writes all the collections in a tag set to a json file.  This is useful for caching tag_sets that don't change 
often.
"""
import logging
import sys
import json
import codecs
import os

from server import mc, TOOL_API_KEY, data_dir
import server.views.sources.apicache as apicache

logger = logging.getLogger(__name__)


def write_tags_in_set_to_json(tag_sets_id_list, only_public_tags=True, filepath=None):
    logger.info("Starting to generate a list of all the collections in tag sets: {}".format(tag_sets_id_list))
    for tag_sets_id in tag_sets_id_list:
        filename = "tags_in_{}.json".format(tag_sets_id)
        tag_set = mc.tagSet(tag_sets_id)
        logger.info("  {}".format(tag_set['label']))
        tags_list = apicache.tags_in_tag_set(TOOL_API_KEY, tag_sets_id, only_public_tags)
        output_filepath = os.path.join(data_dir, filename) if filepath is None else filepath
        with open(output_filepath, 'wb') as f:
            json.dump(tags_list, codecs.getwriter('utf-8')(f), ensure_ascii=False)
        logger.info("    wrote {} collections to {}".format(len(tags_list['tags']), filename))
    logger.info("Done")


if __name__ == '__main__':
    if len(sys.argv) == 1:
        logger.error("You need to pass in a tag set id (tag_sets_id)!")
        sys.exit()
    tag_sets_ids = sys.argv[1:]
    write_tags_in_set_to_json(tag_sets_ids)
