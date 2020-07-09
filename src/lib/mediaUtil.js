// import { notEmptyString } from './formValidators';
import { lookupReadableMetadataName } from './explorerUtil';

export const VIEW_ALL_STORIES = 'VIEW_ALL_STORIES';
export const VIEW_REGULARLY_COLLECTED = 'VIEW_REGULARLY_COLLECTED';
export const ALL_MEDIA = -1;

/* this is set up to match the expected params within the metadataCheckboxFieldArray */
export function importTagsFromCustomSearches(tagsObj) {
  if (tagsObj) {
    const updatedTagsObj = { tags: {} };
    Object.keys(tagsObj).forEach((m) => { // for each tag
      const vals = Object.values(tagsObj[m]).map(a => a);
      if (vals && vals.length > 0) {
        // const tagSet = Object.values(tagsObj[m]).map(a => a).reduce(ts => ts);
        const readableName = lookupReadableMetadataName(parseInt(m, 10));
        updatedTagsObj.tags[readableName] = Object.values(tagsObj[m]).map(a => ({ name: readableName, tags_id: a, tag_sets_id: parseInt(m, 10), label: 'Pub Country', tag_set_label: 'Pub Country', tag_set_name: 'pub_country', selected: true, value: true }));
      }
      return null;
    });
    return updatedTagsObj.tags;
  }
  return [];
}

export function decodeQueryParamString(queryString) {
  const queriesFromUrl = queryString; // tags and searchstr
  if (queryString.query && queryString.query.search) {
    queriesFromUrl.mediaKeyword = queryString.query.search;
  }
  if (queryString.query && queryString.query.tags) {
    queriesFromUrl.tags = JSON.parse(queryString.query.tags);
    queriesFromUrl.tags = importTagsFromCustomSearches(queriesFromUrl.tags);
  }
  return queriesFromUrl;
}
