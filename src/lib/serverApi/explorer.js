import { createApiPromise, acceptParams, generateParamStr, createPostingApiPromise } from '../apiUtil';

export function fetchSavedSearches() {
  return createApiPromise('/api/explorer/saved-searches');
}

export function fetchQueryTopWords(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches', 'sampleSize']);
  return createPostingApiPromise('/api/explorer/words/count', acceptedParams);
}

export function fetchWordSampleSentences(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources', 'collections', 'searches', 'rows', 'word']);
  return createPostingApiPromise('/api/explorer/sentences/list', acceptedParams);
}

export function fetchQueryPerDateTopWords(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/words/count', acceptedParams);
}

export function fetchQueryTopWordsComparison(queryA, queryB) {
  const acceptedParams = [];
  const acceptedParamsA = acceptParams(queryA, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  const acceptedParamsB = acceptParams(queryB, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  acceptedParams['compared_queries[]'] = [generateParamStr(acceptedParamsA)];
  if (queryB) {
    acceptedParams['compared_queries[]'] = acceptedParams['compared_queries[]'].concat(generateParamStr(acceptedParamsB));
  }
  return createPostingApiPromise('/api/explorer/words/compare/count', acceptedParams);
}

export function fetchQueryTopEntitiesPeople(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/entities/people', acceptedParams);
}

export function fetchQueryTopEntitiesOrgs(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/entities/organizations', acceptedParams);
}

export function fetchQuerySplitStoryCount(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/stories/split-count', acceptedParams);
}

export function fetchQuerySampleStories(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/stories/sample', acceptedParams);
}

export function fetchQueryPerDateSampleStories(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/sentences/list', acceptedParams);
}

export function fetchQueryStoryCount(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createApiPromise('/api/explorer/story/count', acceptedParams);
}

export function fetchQueryGeo(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('api/explorer/geo-tags/counts', acceptedParams);
}

export function fetchQuerySourcesByIds(params) {
  const acceptedParams = acceptParams(params, ['uid', 'sources']);
  acceptedParams['sources[]'] = params.sources;
  delete acceptedParams.sources;
  return createApiPromise('api/explorer/sources/list', acceptedParams);
}

export function fetchQueryCollectionsByIds(params) {
  const acceptedParams = acceptParams(params, ['uid', 'collections']);
  acceptedParams['collections[]'] = params.collections;
  delete acceptedParams.collections;
  return createApiPromise('api/explorer/collections/list', acceptedParams);
}

export function fetchQuerySearchesByIds(params) {
  const acceptedParams = acceptParams(params, ['uid', 'searches']);
  acceptedParams['searches[]'] = params.searches;
  delete acceptedParams.searches;
  return createApiPromise('api/explorer/custom-searches/list', acceptedParams);
}

export function loadUserSearches() {
  return createApiPromise('api/explorer/load-user-searches');
}

export function saveUserSearch(params) {
  const acceptedParams = acceptParams(params, ['queryName', 'timestamp', 'queryParams', 'queries']);
  return createPostingApiPromise('api/explorer/save-searches', acceptedParams);
}

export function deleteUserSearch(params) {
  const acceptedParams = acceptParams(params, ['queryName', 'timestamp', 'queryParams']);
  return createPostingApiPromise('api/explorer/delete-search', acceptedParams);
}

export function fetchQueryTopThemes(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/themes', acceptedParams);
}

export function countSourceCollectionUsage(params) {
  const acceptedParams = acceptParams(params, ['sources', 'collections']);
  return createApiPromise('/api/explorer/count-stats', acceptedParams);
}
