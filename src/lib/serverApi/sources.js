import { createApiPromise, createPostingApiPromise, acceptParams, generateParamStr } from '../apiUtil';

// possible return statuses from a call to createSource
export const CREATE_SOURCE_STATUS_NEW = 'new';
export const CREATE_SOURCE_STATUS_EXISTING = 'existing';
export const CREATE_SOURCE_STATUS_ERROR = 'error';

// possible statuses to send to a call to updateSourceSuggestion
// export const UPDATE_SOURCE_SUGGESTION_STATUS_PENDING = 'pending';
export const UPDATE_SOURCE_SUGGESTION_STATUS_APPROVED = 'approved';
export const UPDATE_SOURCE_SUGGESTION_STATUS_REJECTED = 'rejected';

export function sourcesByIds(params) {
  const acceptedParams = acceptParams(params, ['src']);
  acceptedParams['src[]'] = params;
  return createApiPromise('api/sources/list', acceptedParams);
}

export function sourceSearch(searchStr) {
  return createApiPromise(`/api/sources/search/${searchStr}`);
}

export function fetchSourceWithNameExists(searchStr, id) {
  return createApiPromise('/api/sources/search/name-exists', { searchStr, id });
}
export function fetchCollectionWithNameExists(searchStr, id) {
  return createApiPromise('/api/collections/search/name-exists', { searchStr, id });
}

export function sourceAdvancedSearch(params) {
  const acceptedParams = acceptParams(params, ['searchString', 'tags']);
  const paramStr = generateParamStr({ 'tags[]': acceptedParams.tags });
  const searchStr = acceptedParams.searchString || '*';
  return createApiPromise(`/api/sources/search/${searchStr}?${paramStr}`);
}

export function collectionList(id) {
  return createApiPromise(`api/collections/set/${id}`);
}

export function featuredCollectionList() {
  return createApiPromise('api/collections/featured');
}

export function popularCollectionList() {
  return createApiPromise('api/collections/popular');
}

export function collectionsByIds(params) {
  const acceptedParams = acceptParams(params, ['coll']);
  acceptedParams['coll[]'] = params;
  return createApiPromise('api/collections/list', acceptedParams);
}

export function collectionSearch(searchStr) {
  return createApiPromise(`/api/collections/search/${searchStr}`);
}

export function sourceDetails(id) {
  return createApiPromise(`/api/sources/${id}/details`);
}

export function collectionDetails(id, params) {
  const acceptedParams = acceptParams(params, ['getSources']);
  return createApiPromise(`/api/collections/${id}/details`, acceptedParams);
}

export function collectionSplitStoryCount(id, params) {
  const acceptedParams = acceptParams(params, ['separate_spidered']);
  return createApiPromise(`api/collections/${id}/story-split/count`, acceptedParams);
}

export function collectionSourceSplitStoryHistoricalCounts(id, params) {
  const acceptedParams = acceptParams(params, ['start', 'end']);
  return createApiPromise(`/api/collections/${id}/sources/story-split/historical-counts`, acceptedParams);
}

export function collectionSourceList(id, params) {
  const acceptedParams = acceptParams(params, ['details']);
  return createApiPromise(`api/collections/${id}/sources`, acceptedParams);
}

export function sourceGeography(id) {
  return createApiPromise(`api/sources/${id}/geography`);
}

export function collectionGeography(id) {
  return createApiPromise(`api/collections/${id}/geography`);
}

export function sourceWordCount(id, params) {
  const acceptedParams = acceptParams(params, ['q']);
  return createApiPromise(`api/sources/${id}/words`, acceptedParams);
}

export function collectionWordCount(id, params) {
  const acceptedParams = acceptParams(params, ['q']);
  return createApiPromise(`api/collections/${id}/words`, acceptedParams);
}

export function similarCollections(id) {
  return createApiPromise(`api/collections/${id}/similar-collections`);
}

export function collectionSourceRepresentation(id) {
  return createApiPromise(`api/collections/${id}/sources/representation`);
}

export function createCollection(params) {
  const acceptedParams = acceptParams(params, ['name', 'description', 'static', 'sources[]', 'showOnStories', 'showOnMedia']);
  return createPostingApiPromise('/api/collections/create', acceptedParams);
}

export function updateCollection(params) {
  const acceptedParams = acceptParams(params, ['id', 'name', 'description', 'static', 'sources[]', 'showOnMedia']);
  return createPostingApiPromise(`/api/collections/${acceptedParams.id}/update`, acceptedParams);
}

export function removeSourcesFromCollection(params) {
  const acceptedParams = acceptParams(params, ['id', 'sources[]']);
  return createPostingApiPromise(`/api/collections/${acceptedParams.id}/remove-sources`, acceptedParams);
}

export function addSourceToCollection(params) {
  const acceptedParams = acceptParams(params, ['sourceObj']);
  return acceptedParams;
}

export function createSource(params) {
  const acceptedParams = acceptParams(params, ['name', 'url', 'editor_notes', 'public_notes', 'monitored', 'publicationCountry', 'publicationState', 'mediaType', 'collections[]']);
  return createPostingApiPromise('/api/sources/create', acceptedParams);
}

export function updateSource(params) {
  const acceptedParams = acceptParams(params, ['id', 'name', 'url', 'editor_notes', 'public_notes', 'monitored', 'publicationCountry', 'publicationState', 'mediaType', 'collections[]']);
  return createPostingApiPromise(`/api/sources/${acceptedParams.id}/update`, acceptedParams);
}

export function sourceFeeds(id) {
  return createApiPromise(`api/sources/${id}/feeds`);
}

export function sourceFeed(mediaId, feedId) {
  return createApiPromise(`api/sources/${mediaId}/feeds/${feedId}/single`);
}

export function createFeed(mediaId, params) {
  const acceptedParams = acceptParams(params, ['name', 'url', 'type', 'active']);
  return createPostingApiPromise(`/api/sources/${mediaId}/feeds/create`, acceptedParams);
}

export function updateFeed(feedId, params) {
  const acceptedParams = acceptParams(params, ['name', 'url', 'type', 'active']);
  return createPostingApiPromise(`/api/sources/feeds/${feedId}/update`, acceptedParams);
}

export function suggestSource(params) {
  const acceptedParams = acceptParams(params, ['name', 'url', 'feedurl', 'reason', 'collections[]']);
  return createPostingApiPromise('/api/sources/suggestions/submit', acceptedParams);
}

export function listSourceSuggestions(params) {
  const acceptedParams = acceptParams(params, ['all']);
  const all = acceptedParams.all || false;
  return createApiPromise(`/api/sources/suggestions?all=${all ? 1 : 0}`);
}

export function updateSourceSuggestion(params) {
  const acceptedParams = acceptParams(params, ['suggestionId', 'status', 'reason']);
  return createPostingApiPromise(`/api/sources/suggestions/${acceptedParams.suggestionId}/update`, acceptedParams);
}

export function collectionUploadSourceListFromTemplate(params) {
  const acceptedParams = acceptParams(params, ['file']);
  return createPostingApiPromise('/api/collections/upload-sources', acceptedParams);
}

export function systemStats() {
  return createApiPromise('/api/system-stats');
}

export function scrapeSourceFeeds(mediaId) {
  return createPostingApiPromise(`/api/sources/${mediaId}/scrape`);
}

export function createSourcesByUrl(urls) {
  return createPostingApiPromise('/api/sources/create-from-urls', { urls }, 'put');
}

export function fetchSourceStats(mediaId) {
  return createApiPromise(`/api/sources/${mediaId}/stats`);
}

export function fetchSourceReviewInfo(mediaId) {
  return createApiPromise(`/api/sources/${mediaId}/review-info`);
}

export function fetchGeoCollectionsByCountry() {
  return createApiPromise('/api/collection/set/geo-by-country');
}

export function sourceFeedRecentStories(feedId) {
  return createApiPromise(`/api/sources/feeds/${feedId}/recent-stories`);
}
