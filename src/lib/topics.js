import { createApiPromise, createPostingApiPromise, acceptParams } from './apiUtil';

export function topicsList(linkId) {
  return createApiPromise('/api/topics/list', { linkId });
}

export function topicSummary(topicId) {
  return createApiPromise(`/api/topics/${topicId}/summary`);
}

export function topicTopStories(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'sort', 'limit', 'q', 'linkId']);
  return createApiPromise(`/api/topics/${topicId}/stories`, acceptedParams);
}

export function topicTopMedia(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'sort', 'limit', 'linkId']);
  return createApiPromise(`/api/topics/${topicId}/media`, acceptedParams);
}

export function topicTopWords(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/words`, acceptedParams);
}

export function topicSnapshotsList(topicId) {
  return createApiPromise(`/api/topics/${topicId}/snapshots/list`);
}

export function topicTimespansList(topicId, snapshotId) {
  return createApiPromise(`/api/topics/${topicId}/snapshots/${snapshotId}/timespans/list`);
}

export function topicSentenceCounts(topicId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/sentences/count`, acceptedParams);
}

export function story(topicId, storiesId) {
  return createApiPromise(`/api/topics/${topicId}/stories/${storiesId}`);
}

export function storyWords(topicId, storiesId) {
  return createApiPromise(`/api/topics/${topicId}/stories/${storiesId}/words`);
}

export function storyInlinks(topicId, storiesId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/stories/${storiesId}/inlinks`, acceptedParams);
}

export function storyOutlinks(topicId, storiesId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/stories/${storiesId}/outlinks`, acceptedParams);
}

export function media(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}`, acceptedParams);
}

export function mediaSentenceCounts(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}/sentences/count`, acceptedParams);
}

export function mediaStories(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'sort', 'limit']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}/stories`, acceptedParams);
}

export function mediaInlinks(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'sort', 'limit']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}/inlinks`, acceptedParams);
}

export function mediaOutlinks(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId', 'sort', 'limit']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}/outlinks`, acceptedParams);
}

export function mediaWords(topicId, mediaId, params) {
  const acceptedParams = acceptParams(params, ['snapshotId', 'timespanId', 'focusId']);
  return createApiPromise(`/api/topics/${topicId}/media/${mediaId}/words`, acceptedParams);
}

export function topicFocalSetsList(topicId, snapshotId) {
  return createApiPromise(`/api/topics/${topicId}/focal-sets/list`, { snapshotId });
}

export function createFocalSetDefinition(topicId, params) {
  const acceptedParams = acceptParams(params, ['name', 'description', 'focalTechnique']);
  return createPostingApiPromise(`api/topics/${topicId}/focal-set-definitions/create`, acceptedParams);
}

export function listFocalSetDefinitions(topicId) {
  return createApiPromise(`api/topics/${topicId}/focal-set-definitions/list`);
}

export function createFocusDefinition(topicId, params) {
  const acceptedParams = acceptParams(params, ['name', 'description', 'focal_set_definitions_id', 'query']);
  return createApiPromise(`/api/topics/${topicId}/focus-definitions/create`, acceptedParams);
}
