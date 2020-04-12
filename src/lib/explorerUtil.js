import slugify from 'slugify';
import uuidv4 from 'uuid/v4';
import { trimToMaxLength, queryAsString } from './stringUtil';
import { notEmptyString } from './formValidators';
import { downloadViaFormPost } from './apiUtil';
import { downloadSvg } from '../components/util/svg';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE, PUBLICATION_COUNTRY, PUBLICATION_STATE, COUNTRY_OF_FOCUS, PRIMARY_LANGUAGE, MEDIA_TYPE, PUB_COUNTRY_TAG_NAME, PUB_STATE_TAG_NAME, PRIMARY_LANGUAGE_TAG_NAME, COUNTRY_OF_FOCUS_TAG_NAME, MEDIA_TYPE_TAG_NAME } from './tagUtil';
import messages from '../resources/messages';

export const DEFAULT_SOURCES = '';

export const DEFAULT_COLLECTION = 58722749;

export const DEFAULT_COLLECTION_OBJECT_ARRAY = [{ id: DEFAULT_COLLECTION, tags_id: DEFAULT_COLLECTION, label: 'U.S. Top Online News 2017' }];

export const PICK_FEATURED = 0;
export const PICK_SOURCE_AND_COLLECTION = 1;

// export const PICK_ADVANCED = 3;
export const ACTION_MENU_ITEM_CLASS = 'action-icon-menu-item';

export const COVERAGE_REQUIRED = 0.8;

export const QUERY_LABEL_CHARACTER_LIMIT = 30;
export const QUERY_LABEL_AUTOMAGIC_DISPLAY_LIMIT = 27;
export const ENTITY_DISPLAY_TOP_TEN = 10;

export const KEYWORD = 'q';
export const MEDIA = 'media';
export const DATES = ['startDate', 'endDate'];

export const LEFT = 0;
export const RIGHT = 1;

export function serializeQueriesForUrl(queries) {
  return encodeURIComponent(JSON.stringify(queries));
}

export const getQFromCodeMirror = queryAsString;

export const metadataQueryFields = new Set([PUBLICATION_COUNTRY, PUBLICATION_STATE, PRIMARY_LANGUAGE, COUNTRY_OF_FOCUS, MEDIA_TYPE]);

// grab media keyword and array of tags Ids (irregardless of metadata type) to send to python
export function serializeSearchTags(searches) {
  let tagArrays = [];
  const currentSearch = [];
  // assumes q is an array
  searches.map((q) => {
    if (q && q.tags) {
      tagArrays = Object.keys(q.tags).map((m) => {
        if (metadataQueryFields.has(m)) {
          const vals = Object.values(q.tags[m]).map(a => a.tags_id).filter(t => t);
          if (vals && vals.length > 0) { // grab just the tags_id that are selected
            return vals;
          }
        }
        return '';
      });
      tagArrays = tagArrays.filter(t => Array.isArray(t));
      currentSearch.push(`{"media_keyword": "${notEmptyString(q.mediaKeyword) ? q.mediaKeyword : ''}", "tags_id_media": "${JSON.stringify(tagArrays)}"}`);
    }
    return false;
  });
  return currentSearch.length ? `[${currentSearch}]` : '';
}


export function replaceCurlyQuotes(stringWithQuotes) {
  let removedQuotes = stringWithQuotes.replace(/[\u2018]/g, "'").replace(/[\u2019]/g, "'"); // replace single curly quotes
  removedQuotes = removedQuotes.replace(/[\u201C]/g, '"').replace(/[\u201D]/g, '"'); // replace double curly quotes
  return removedQuotes;
}
/* deletions, duplications and new queries shouldn't be shown in results until they have fetched results */
export function ensureSafeSortedQueries(queries) {
  const unDeletedQueries = queries.filter(q => q.deleted !== true);
  return unDeletedQueries.filter(q => q.new !== true).sort((a, b) => a.sortPosition - b.sortPosition);
}

/* deletions, duplications and new queries may result in an intermediate state in which the results and queries are not yet in alignment. Use
this function to handle these cases. sort resutls according to query sortPositions */
export function ensureSafeResults(queries, results) {
  const unDeletedQueries = queries.filter(q => q.deleted !== true);
  let safeQueryWithResults = null;

  if (results !== undefined && results !== null && results.length > 0) {
    safeQueryWithResults = unDeletedQueries.map(q => ({ ...q, ...results.find(r => r.uid === q.uid) }));
    const nonEmptyQueries = safeQueryWithResults.filter(q => q.q !== undefined && q.results && q.results !== undefined);
    safeQueryWithResults = Object.values(nonEmptyQueries).sort((a, b) => a.sortPosition - b.sortPosition);
    const allQueriesHaveResults = safeQueryWithResults.filter(q => q.results); // trying to handle not-yet fetched queries (dupes/new)
    return allQueriesHaveResults.length === safeQueryWithResults.length ? safeQueryWithResults : [];
  }
  return [];
}

/* deletions may result in an intermediate state in which the selectedTabIndex hasn't been updated yet. Use
this function to handle these cases */

export function ensureSafeTabIndex(array, index) {
  return index > (array.length - 1) ? array.length - 1 : index;
}

export function getUidIndex(uid, array) {
  return array.findIndex(a => a.uid !== null && a.uid === uid);
}

export function generateQueryParamObject(query, skipEncoding) {
  return {
    label: skipEncoding ? query.label : encodeURIComponent(query.label),
    q: skipEncoding ? query.q : encodeURIComponent(query.q),
    color: skipEncoding ? query.color : encodeURIComponent(query.color),
    startDate: query.startDate,
    endDate: query.endDate,
    sources: query.sources && query.sources.length > 0 ? query.sources.map(s => (s.id ? s.id : s)) : [], // id field or the id itself
    // handle an object or an id, and also make sure to screen out -1 (placeholder for ALL_MEDIA)
    collections: query.collections && query.collections.length > 0 ? query.collections.map(c => (c.id ? c.id : c)).filter(c => c > 0) : [],
    searches: query.searches && query.searches.length > 0 ? serializeSearchTags(query.searches) : [],
  };
}


export function lookupReadableMetadataName(tagSetsId) {
  switch (tagSetsId) {
    case TAG_SET_PUBLICATION_COUNTRY:
      return PUBLICATION_COUNTRY;
    case TAG_SET_PUBLICATION_STATE:
      return PUBLICATION_STATE;
    case TAG_SET_PRIMARY_LANGUAGE:
      return PRIMARY_LANGUAGE;
    case TAG_SET_COUNTRY_OF_FOCUS:
      return COUNTRY_OF_FOCUS;
    case TAG_SET_MEDIA_TYPE:
      return MEDIA_TYPE;
    default:
      return null;
  }
}


export function getShortName(tagName, formatMessage) {
  switch (tagName) {
    case PUB_COUNTRY_TAG_NAME:
      return formatMessage(messages.pubCountryShort);
    case PUB_STATE_TAG_NAME:
      return formatMessage(messages.pubStateShort);
    case PRIMARY_LANGUAGE_TAG_NAME:
      return formatMessage(messages.languageShort);
    case COUNTRY_OF_FOCUS_TAG_NAME:
      return formatMessage(messages.countryShort);
    case MEDIA_TYPE_TAG_NAME:
      return formatMessage(messages.mediaTypeShort);
    default:
      return null;
  }
}

export function hasMultipleMetadataTags(tagsObj) {
  const tagObj = {};
  Object.keys(tagsObj).forEach((m) => { // for each tag
    if (metadataQueryFields.has(m)) { // that is metadata
      const vals = Object.values(tagsObj[m]).map(a => (a.selected ? a.tags_id : null)).filter(t => t);
      if (vals && vals.length > 0) { // grab just the tags_id that are selected
        const tagSetsId = tagsObj[m][0].tag_sets_id;
        tagObj[tagSetsId] = true;
      }
    }
    return tagObj;
  });
  return Object.values(tagObj).filter(t => t).length > 1;
}

// for display in UI
export function stringifyTags(tags, formatMessage) {
  const htmlTags = Object.keys(tags)
    .filter(t => metadataQueryFields.has(t) > 0 && Array.isArray(tags[t]) && tags[t].length > 0)
    .map((i, index) => {
      const obj = tags[i];
      const metadataName = getShortName((obj.map(a => a.tag_set_name).reduce(l => l)), formatMessage);
      const tagsObj = obj.map(a => (a.selected ? a.label : '')).filter(l => notEmptyString(l));
      if (tagsObj.length > 0) {
        const tagsString = tagsObj.length > 1 ? tagsObj.join(' OR ') : tagsObj;
        const andTags = hasMultipleMetadataTags(tags) && index ? ' AND ' : '';
        return `${andTags}${metadataName}: ${tagsString}`;
      }
      return [];
    });
  return htmlTags.join(' ');
}

// serialize to URL (not python which expects JSON & solr tags!) in the form - searches: [{ media_keyword, <metadataId1>:[], <metadataId2>:[] }, {...}]
export function prepSearches(searches) {
  const tagObj = {};
  const currentSearch = [];
  // assuming q is an array
  searches.map((q) => {
    if (q && q.tags) {
      Object.keys(q.tags).forEach((m) => { // for each tag
        if (metadataQueryFields.has(m)) { // that is metadata
          const vals = Object.values(q.tags[m]).map(a => (a.selected ? a.tags_id : null)).filter(t => t);
          if (vals && vals.length > 0) { // grab just the tags_id that are selected
            const tagSetsId = q.tags[m][0].tag_sets_id;
            /* into the format
            {tag_sets_id: [tags_id, ...], tag_sets_id, tag_set_label}
            */
            tagObj[tagSetsId] = vals;
            tagObj[tagSetsId].tag_sets_id = tagSetsId;
          }
          return tagObj;
        }
        return null;
      });
      currentSearch.push({ media_keyword: q.mediaKeyword, ...tagObj });
    }
    return false;
  });
  return currentSearch;
}

export function generateQueryParamString(queries) {
  const queriesForUrl = queries.map(q => generateQueryParamObject(q, false));
  return JSON.stringify(queriesForUrl);
}

export function decodeQueryParamString(queryString) {
  const queriesForUrl = JSON.parse(queryString).map(query => ({
    label: notEmptyString(query.label) ? decodeURIComponent(query.label) : '',
    q: notEmptyString(query.q) ? decodeURIComponent(query.q) : '',
    color: notEmptyString(query.color) ? decodeURIComponent(query.color) : '',
    startDate: query.startDate,
    endDate: query.endDate,
    sources: query.sources, // de-aggregate media bucket into sources and collections and custom colls
    collections: query.collections,
    searches: query.searches,
  }));
  return queriesForUrl;
}

function queryPropertyHasChanged(queries, nextQueries, propName) {
  const currentProps = queries.map(q => q[propName]).reduce((allProps, prop) => allProps + prop);
  const nextProps = nextQueries.map(q => q[propName]).reduce((allProps, prop) => allProps + prop);
  const propHasChanged = currentProps !== nextProps;
  return propHasChanged;
}

// call this from componentShouldUpdate to figure out if it should or not
export function queryChangedEnoughToUpdate(queries, nextQueries, results, nextResults) {
  // only re-render if results, any labels, or any colors have changed
  if (results.length) { // may have reset results so avoid test if results is empty
    const labelsHaveChanged = queryPropertyHasChanged(queries.slice(0, results.length), nextQueries.slice(0, results.length), 'label');
    const colorsHaveChanged = queryPropertyHasChanged(queries.slice(0, results.length), nextQueries.slice(0, results.length), 'color');
    return (
      ((labelsHaveChanged || colorsHaveChanged))
       || (results !== nextResults)
    );
  }
  return false; // if both results and queries are empty, don't update
}

// TODO: implement more useful logic from Dashboard
export const autoMagicQueryLabel = (query) => {
  const queryString = queryAsString(query.q);
  if (queryString.length === 0) {
    return '(all stories)'; // TODO: intl this by passingin formatMessage
  }
  return trimToMaxLength(queryString, QUERY_LABEL_AUTOMAGIC_DISPLAY_LIMIT);
};

// This handles downloading a single query (samples or user-generated) for you.  To handle quotes and utf and such, we do this
// via a form submission (after trying lots of other options).
export function postToDownloadUrl(url, query, otherData) {
  // figure out if it is sample or user-created query
  let data = { index: query.index };
  if (parseInt(query.searchId, 10) >= 0) {
    data.sampleId = query.searchId;
  } else {
    data.q = JSON.stringify(generateQueryParamObject(query, true)); // don't encode the params because we're not putting them on the url
  }
  if (otherData) {
    data = { ...data, ...otherData };
  }
  downloadViaFormPost(url, data);
}

// This handles downloading *multiple* queries (samples or user-generated) for you.  To handle quotes and utf and such, we do this
// via a form submission (after trying lots of other options).
export function postToCombinedDownloadUrl(url, queries, otherData) {
  // figure out if it is sample or user-created query
  let data = { queries: JSON.stringify(queries.map(q => generateQueryParamObject(q, true))) };
  if (parseInt(queries[0].searchId, 10) >= 0) {
    data.sampleId = queries[0].searchId;
  }
  if (otherData) {
    data = { ...data, ...otherData };
  }
  downloadViaFormPost(url, data);
}

export const slugifiedQueryLabel = queryLabel => slugify(trimToMaxLength(queryLabel, 30));

export function downloadExplorerSvg(queryLabel, type, domIdOrElement) {
  const filename = `${slugifiedQueryLabel(queryLabel)}-${type}`;
  downloadSvg(filename, domIdOrElement);
}

export function uniqueQueryId() {
  return uuidv4();
}

export const formatQueryForServer = q => ({
  start_date: q.startDate,
  end_date: q.endDate,
  q: q.q,
  uid: q.uid,
  sortPosition: q.sortPosition,
  sources: q.sources.map(s => s.id),
  collections: q.collections.map(c => c.id),
  searches: serializeSearchTags(q.searches),
});

export const formatDemoQueryForServer = (q, index) => ({
  index, // should be same as q.index btw
  search_id: q.searchId, // may or may not have these
  query_id: q.id,
  q: q.q, // only if no query id, means demo user added a keyword
  uid: q.uid,
  sortPosition: q.sortPosition,
});
