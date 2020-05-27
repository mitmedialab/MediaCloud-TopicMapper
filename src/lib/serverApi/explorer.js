import { createApiPromise, acceptParams, generateParamStr, createPostingApiPromise } from '../apiUtil';

export function fetchSavedSearches() {
  return createApiPromise('/api/explorer/saved-searches');
}

export function fetchQueryTopWords(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches', 'sampleSize']);
  return createPostingApiPromise('/api/explorer/words/count', acceptedParams);
}

export function fetchDemoQueryTopWords(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q', 'sampleSize']);
  return createApiPromise('/api/explorer/demo/words/count', acceptedParams);
}

export function fetchWordSampleSentences(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources', 'collections', 'searches', 'rows', 'word']);
  return createPostingApiPromise('/api/explorer/sentences/list', acceptedParams);
}

export function fetchQueryPerDateTopWords(params) {
  const acceptedParams = acceptParams(params, ['uid', 'q', 'start_date', 'end_date', 'sources', 'collections', 'searches']);
  return createPostingApiPromise('/api/explorer/words/count', acceptedParams);
}

export function fetchDemoQueryPerDateTopWords(params) {
  const acceptedParams = acceptParams(params, ['index', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/words/count', acceptedParams);
}

// top words is not like the other widgets. Will either have a search id, or will have comparedQueries
export function fetchDemoQueryTopWordsComparison(queryA, queryB) {
  let acceptedParamsA = null;
  let acceptedParamsB = null;
  const acceptedParams = [];

  const testParams = acceptParams(queryA, ['search_id']);
  if (testParams.search_id !== undefined) { // by demo search id
    acceptedParamsA = acceptParams(queryA, ['index', 'search_id', 'query_id', 'q']);
    acceptedParamsB = acceptParams(queryB, ['index', 'search_id', 'query_id', 'q']);
  } else { // by demo keyword
    acceptedParamsA = acceptParams(queryA, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
    acceptedParamsB = acceptParams(queryB, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  }
  acceptedParams['compared_queries[]'] = [generateParamStr(acceptedParamsA)];
  if (queryB) {
    acceptedParams['compared_queries[]'] = acceptedParams['compared_queries[]'].concat(generateParamStr(acceptedParamsB));
  }
  return createApiPromise('/api/explorer/demo/words/compare/count', acceptedParams);
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

export function fetchDemoQueryTopEntitiesPeople(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/entities/people', acceptedParams);
}

export function fetchDemoQueryTopEntitiesOrgs(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/entities/organizations', acceptedParams);
}

export function fetchDemoQuerySampleStories(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/stories/sample', acceptedParams);
}

export function fetchDemoQueryPerDateSampleStories(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/stories/sample', acceptedParams);
}

export function fetchDemoQueryGeo(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('api/explorer/demo/geo-tags/counts', acceptedParams);
}

export function demoQuerySourcesByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'sources']);
  acceptedParams['sources[]'] = params.sources;
  return createApiPromise('api/explorer/demo/sources/list', acceptedParams);
}

export function demoQueryCollectionsByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'collections']);
  acceptedParams['collections[]'] = params.collections;
  return createApiPromise('api/explorer/demo/collections/list', acceptedParams);
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

export function fetchDemoQuerySplitStoryCount(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/stories/split-count', acceptedParams);
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

export function fetchDemoQueryTopThemes(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/themes', acceptedParams);
}

export function countSourceCollectionUsage(params) {
  const acceptedParams = acceptParams(params, ['sources', 'collections']);
  return createApiPromise('/api/explorer/count-stats', acceptedParams);
}
