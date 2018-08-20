import slugify from 'slugify';
import { trimToMaxLength } from './stringUtil';
import { notEmptyString } from './formValidators';
import { downloadViaFormPost } from './apiUtil';
import { downloadSvg } from '../components/util/svg';

export const DEFAULT_SOURCES = '';

export const DEFAULT_COLLECTION = 58722749;

export const DEFAULT_COLLECTION_OBJECT_ARRAY = [{ id: DEFAULT_COLLECTION, tags_id: DEFAULT_COLLECTION, label: 'U.S. Top Online News 2017' }];

export const PICK_FEATURED = 0;
export const PICK_COUNTRY = 1;
export const PICK_COLLECTION = 2;
export const PICK_SOURCE = 3;

// export const PICK_ADVANCED = 3;
export const ACTION_MENU_ITEM_CLASS = 'action-icon-menu-item';

export const COVERAGE_REQUIRED = 0.8;

export const QUERY_LABEL_CHARACTER_LIMIT = 30;
export const QUERY_LABEL_AUTOMAGIC_DISPLAY_LIMIT = 27;

export const KEYWORD = 'q';
export const MEDIA = 'media';
export const DATES = ['startDate', 'endDate'];

export const LEFT = 0;
export const RIGHT = 1;

export function generateQueryParamObject(query, skipEncoding) {
  return {
    label: skipEncoding ? query.label : encodeURIComponent(query.label),
    q: skipEncoding ? query.q : encodeURIComponent(query.q),
    color: skipEncoding ? query.color : encodeURIComponent(query.color),
    startDate: query.startDate,
    endDate: query.endDate,
    sources: query.sources && query.sources.length > 0 ? query.sources.map(s => (s.id ? s.id : s)) : [], // id field or the id itself
    collections: query.collections && query.collections.length > 0 ? query.collections.map(s => (s.id ? s.id : s)) : [],
  };
}

export function generateQueryParamString(queries) {
  const queriesForUrl = queries.map(q => generateQueryParamObject(q, false));
  return JSON.stringify(queriesForUrl);
}

export function decodeQueryParamString(queryString) {
  const queriesForUrl = JSON.parse(queryString).map(query => ({
    label: notEmptyString(query.label) ? decodeURIComponent(query.label) : '',
    q: notEmptyString(query.q) ? decodeURIComponent(query.q) : '*',
    color: notEmptyString(query.color) ? decodeURIComponent(query.color) : '',
    startDate: query.startDate,
    endDate: query.endDate,
    sources: query.sources, // de-aggregate media bucket into sources and collections
    collections: query.collections,
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

// TODO: implement this logic from Dashboard
export const autoMagicQueryLabel = query => decodeURIComponent(trimToMaxLength(query.q, QUERY_LABEL_AUTOMAGIC_DISPLAY_LIMIT));


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
