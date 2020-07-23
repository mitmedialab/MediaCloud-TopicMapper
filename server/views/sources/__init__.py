from server.util.tags import COLLECTION_SET_PEW_2018, COLLECTION_SET_PARTISANSHIP_QUINTILES_2020
from server.util.csv import SOURCE_LIST_CSV_METADATA_PROPS

SOURCE_LIST_CSV_EDIT_PROPS = ['media_id', 'url', 'name'] + \
                             SOURCE_LIST_CSV_METADATA_PROPS + \
                             ['public_notes', 'editor_notes', 'stories_per_day', 'first_story']


SOURCE_FEED_LIST_CSV_PROPS = ['media_id', 'url', 'name'] + \
                             ['public_notes', 'editor_notes', 'stories_per_day', 'first_story', 'active_feed_count',
                              'num_stories_90', 'latest_scrape_job', 'num_stories_last_year']

# hand-made whitelist of collections to show up as "featured" on source mgr homepage and in the media picker
FEATURED_COLLECTION_LIST = COLLECTION_SET_PEW_2018 + COLLECTION_SET_PARTISANSHIP_QUINTILES_2020 + [
    34412118,  # India national
    34412232,  # Russia national
    38379799,  # France - State & Local
    9272347,   # ABYZ Global English
    34412476,  # UK National
    34412202,  # Ghana National
    38381372,  # US Massachusetts State/Local
]
