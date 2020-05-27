import { createApiPromise, createPostingApiPromise, acceptParams } from '../apiUtil';
import { platformQueryParams } from './platforms';

export function topicsPersonalList(linkId) {
  return createApiPromise('/api/topics/personal', linkId ? { linkId } : undefined);
}

export function topicsFavoriteList() {
  return createApiPromise('/api/topics/favorites');
}

export function topicsAdminList() {
  return createApiPromise('/api/topics/admin/list');
}

export function topicSummary(topicId) {
  return createApiPromise(`/api/topics/${topicId}/summary`);
}

export function topicTimespansList(topicId, snapshotId, params) {
  const acceptedParams = acceptParams(params, ['focusId']);
  return createApiPromise(`/api/topics/${topicId}/snapshots/${snapshotId}/timespans/list`, acceptedParams);
}

export function topicStoryCounts(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q', 'start_date', 'end_date', 'sources[]', 'collections[]']);
  return createApiPromise(`/api/topics/${topicId}/stories/counts`, acceptedParams);
}

export function topicStoryInfo(topicId, storiesId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/stories/${storiesId}`, acceptedParams);
}

export function media(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}`, acceptedParams);
}

export function topicFocalSetsList(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q', 'includeStoryCounts']);
  return createApiPromise(`/api/topics/${topicId}/focal-sets/list`, acceptedParams);
}

export function listFocalSetDefinitions(topicId) {
  return createApiPromise(`api/topics/${topicId}/focal-set-definitions/list`);
}

export function updateOrCreateFocusDefinition(topicId, params) {
  const acceptedParams = acceptParams(params, [
    'foci_id',
    'focalSetName', 'focalSetDescription', 'focalTechnique',
    'focusName', 'focusDescription', 'focalSetDefinitionId', 'keywords', 'sources[]', 'collections[]']);
  return createPostingApiPromise(`/api/topics/${topicId}/focus-definitions/update-or-create`, acceptedParams);
}

export function deleteFocalSetDefinition(topicId, focalSetDefinitionId) {
  return createApiPromise(`/api/topics/${topicId}/focal-set-definitions/${focalSetDefinitionId}/delete`, null, 'delete');
}

export function deleteFocusDefinition(topicId, focusDefinitionId) {
  return createApiPromise(`/api/topics/${topicId}/focus-definitions/${focusDefinitionId}/delete`, null, 'delete');
}
export function topicUpdatePermissions(topicId, permissions) {
  return createPostingApiPromise(`/api/topics/${topicId}/permissions/update`, { permissions: JSON.stringify(permissions) }, 'put');
}

export function topicListPermissions(topicId) {
  return createApiPromise(`/api/topics/${topicId}/permissions/list`);
}

export function topicSetFavorite(topicId, favorite) {
  return createPostingApiPromise(`/api/topics/${topicId}/favorite`, { favorite: (favorite) ? 1 : 0 }, 'put');
}

export function favoriteTopics() {
  return createApiPromise('/api/topics/favorite');
}

export function topicFocalSetSplitStoryCounts(topicId, focalSetId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'focusId', 'timespanId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/focal-set/${focalSetId}/split-story-count`, acceptedParams);
}

export function word(topicId, wordstem) {
  return createApiPromise(`/api/topics/${topicId}/words/${wordstem}`);
}

export function wordWords(topicId, wordstem, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/words/${wordstem}*/words`, acceptedParams);
}

export function wordSampleSentences(topicId, wordstem, params) {
  const acceptedParams = acceptParams(params, ['timespanId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/words/${wordstem}*/sample-usage`, acceptedParams);
}

export function fetchStoryCountByQuery(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources[]', 'collections[]', 'searches[]']);
  return createPostingApiPromise('/api/topics/create/preview/story/count', acceptedParams);
}

export function fetchAttentionByQuery(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources[]', 'collections[]', 'searches[]']);
  return createPostingApiPromise('/api/topics/create/preview/split-story/count', acceptedParams);
}

export function fetchStorySampleByQuery(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources[]', 'collections[]', 'rows', 'searches[]']);
  return createPostingApiPromise('/api/topics/create/preview/stories/sample', acceptedParams);
}

export function fetchWordsByQuery(params) {
  const acceptedParams = acceptParams(params, ['q', 'start_date', 'end_date', 'sources[]', 'collections[]', 'searches[]']);
  return createPostingApiPromise('/api/topics/create/preview/words/count', acceptedParams);
}

export function updateTopicSettings(topicId, params) {
  const acceptedParams = acceptParams(params, ['name', 'description', 'is_logogram', 'start_date', 'end_date', 'max_iterations', 'max_topic_stories']);
  return createPostingApiPromise(`/api/topics/${topicId}/update-settings`, acceptedParams, 'put');
}

export function topicMapFiles(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/map-files/list`, acceptedParams);
}

export function topicTimespanFiles(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/timespan-files/list`, acceptedParams);
}

export function fetchTopicSearchResults(searchStr, params) {
  const acceptedParams = acceptParams(params, ['mode']);
  return createApiPromise('/api/topics/search', { searchStr, ...acceptedParams });
}

export function fetchTopicWithNameExists(searchStr, topicId) {
  return createApiPromise('/api/topics/name-exists', { searchStr, topicId });
}

export function userQueuedAndRunningTopics() {
  return createApiPromise('/api/topics/queued-and-running');
}

export function topicPreviewRetweetPartisanshipStoryCounts(topicId) {
  return createApiPromise(`/api/topics/${topicId}/focal-sets/retweet-partisanship/preview/story-counts`);
}

export function topicPreviewRetweetPartisanshipCoverage(topicId) {
  return createApiPromise(`/api/topics/${topicId}/focal-sets/retweet-partisanship/preview/coverage`);
}

export function createRetweetFocalSet(topicId, params) {
  const acceptedParams = acceptParams(params, ['focalSetName', 'focalSetDescription']);
  return createPostingApiPromise(`/api/topics/${topicId}/focal-sets/retweet-partisanship/create`, acceptedParams);
}

export function topicPreviewTopCountriesStoryCounts(topicId, numCountries) {
  const acceptedParams = acceptParams(numCountries, ['numCountries']);
  return createApiPromise(`/api/topics/${topicId}/focal-sets/top-countries/preview/story-counts`, acceptedParams);
}

export function topicPreviewTopCountriesCoverage(topicId, numCountries) {
  const acceptedParams = acceptParams(numCountries, ['numCountries']);
  return createApiPromise(`/api/topics/${topicId}/focal-sets/top-countries/preview/coverage`, acceptedParams);
}

export function topicPreviewNytThemeStoryCounts(topicId, numThemes) {
  const acceptedParams = acceptParams(numThemes, ['numThemes']);
  return createApiPromise(`/api/topics/${topicId}/focal-sets/nyt-theme/preview/story-counts`, acceptedParams);
}

export function topicPreviewNytThemeCoverage(topicId, numThemes) {
  const acceptedParams = acceptParams(numThemes, ['numThemes']);
  return createApiPromise(`/api/topics/${topicId}/focal-sets/nyt-theme/preview/coverage`, acceptedParams);
}

export function topicPreviewMediaTypeStoryCounts(topicId) {
  return createApiPromise(`/api/topics/${topicId}/focal-sets/media-type/preview/story-counts`);
}

export function topicPreviewMediaTypeCoverage(topicId) {
  return createApiPromise(`/api/topics/${topicId}/focal-sets/media-type/preview/coverage`);
}

export function createTopCountriesFocalSet(topicId, params) {
  const acceptedParams = acceptParams(params, ['focalSetName', 'focalSetDescription', 'data']);
  acceptedParams['data[]'] = JSON.stringify(acceptedParams.data);
  return createPostingApiPromise(`/api/topics/${topicId}/focal-sets/top-countries/create`, acceptedParams);
}

export function createNytThemeFocalSet(topicId, params) {
  const acceptedParams = acceptParams(params, ['focalSetName', 'focalSetDescription', 'data']);
  acceptedParams['data[]'] = JSON.stringify(acceptedParams.data);
  return createPostingApiPromise(`/api/topics/${topicId}/focal-sets/nyt-theme/create`, acceptedParams);
}

export function createMediaTypeFocalSet(topicId, params) {
  const acceptedParams = acceptParams(params, ['focalSetName', 'focalSetDescription']);
  return createPostingApiPromise(`/api/topics/${topicId}/focal-sets/media-type/create`, acceptedParams);
}

export function topicWord2Vec(topicId) {
  return createApiPromise(`/api/topics/${topicId}/word2vec`);
}

export function topicWord2VecTimespans(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'focusId', 'q']);
  return createApiPromise(`/api/topics/${topicId}/word2vec-timespans`, acceptedParams);
}

export function topicSimilarWords(topicId, theWord, params) {
  const acceptedParams = acceptParams(params, ['snapshotId']);
  return createApiPromise(`/api/topics/${topicId}/words/${theWord}/similar`, acceptedParams);
}

export function getMediaTypes() {
  return createApiPromise('/api/media-types/list');
}

export function topicSnapshotStoryCounts(topicId) {
  return createApiPromise(`/api/topics/${topicId}/stories/counts-by-snapshot`);
}

const topicCreateOrUpdateParams = ['name', 'description', 'solr_seed_query',
  'max_stories', 'max_iterations', 'ch_monitor_id', 'start_date', 'end_date', 'spidered',
  'sources[]', 'collections[]', 'searches[]', 'is_logogram', 'startSpidering'];

export function createTopic(params) {
  const acceptedParams = acceptParams(params, topicCreateOrUpdateParams);
  return createPostingApiPromise('/api/topics/create', acceptedParams, 'put');
}

export function topicSnapshotGenerate(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'spider']);
  return createPostingApiPromise(`/api/topics/${topicId}/snapshots/generate`, acceptedParams);
}

export function topicUpdateSeedQuery(topicId, params) {
  const acceptedParams = acceptParams(params, topicCreateOrUpdateParams);
  return createPostingApiPromise(`/api/topics/${topicId}/snapshots/update-seed-query`, acceptedParams, 'put');
}

export function topicSnapshotCreate(topicId) {
  return createPostingApiPromise(`/api/topics/${topicId}/snapshots/create`);
}

export function topicCreatePlatform(topicId, params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise(`/api/topics/${topicId}/platforms/add`, acceptedParams);
}

export function topicUpdatePlatform(topicId, platformId, params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise(`/api/topics/${topicId}/platforms/${platformId}/update`, acceptedParams);
}

export function topicDeletePlatform(topicId, platformId, params) {
  const acceptedParams = acceptParams(params, []);
  return createPostingApiPromise(`/api/topics/${topicId}/platforms/${platformId}/remove`, acceptedParams);
}

export function platformsInTopic(topicId) {
  return createApiPromise(`/api/topics/${topicId}/platforms/list`);
}

export function uploadPlatformGenericCsvFile(topicId, params) {
  const acceptedParams = acceptParams(params, ['file']);
  return createPostingApiPromise(`/api/topics/${topicId}/platforms/generic-csv/upload`, acceptedParams);
}
