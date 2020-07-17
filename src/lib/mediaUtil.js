import { lookupReadableMetadataName } from './explorerUtil';

export const VIEW_ALL_STORIES = 'VIEW_ALL_STORIES';
export const VIEW_REGULARLY_COLLECTED = 'VIEW_REGULARLY_COLLECTED';
export const ALL_MEDIA = -1;
// TODO replace these with explorer PICK_ vars
export const MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING = 1;
export const MEDIAPICKER_FEATURED_QUERY_SETTING = 0;

/* this is set up to match the expected params within the metadataCheckboxFieldArray */
export function importTagsFromCustomSearches(tagsObj) {
  if (tagsObj) {
    const updatedTagsObj = {};
    Object.keys(tagsObj).forEach((m) => { // for each tag
      const vals = Object.values(tagsObj[m]);
      if (vals && vals.length > 0) {
        const readableName = lookupReadableMetadataName(parseInt(m, 10));
        updatedTagsObj[readableName] = Object.values(tagsObj[m]).map(a => ({ name: readableName, tags_id: a, tag_sets_id: parseInt(m, 10), label: 'Pub Country', tag_set_label: 'Pub Country', tag_set_name: 'pub_country', selected: true, value: true }));
      }
    });
    return updatedTagsObj;
  }
  return [];
}

export function decodeQueryParamString(queryString) {
  const queriesFromUrl = queryString; // tags and searchstr
  if (queryString.query && queryString.query.search) {
    queriesFromUrl.mediaKeyword = queryString.query.search;
  }
  if (queryString.query && queryString.query.tags) {
    queriesFromUrl.tags = importTagsFromCustomSearches(JSON.parse(queryString.query.tags));
  }
  return queriesFromUrl;
}
