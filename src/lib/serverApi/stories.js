import { createApiPromise, acceptParams, createPostingApiPromise } from '../apiUtil';

export function storyDetails(storyId) {
  return createApiPromise(`/api/stories/${storyId}`);
}

export function storyEntities(storyId) {
  return createApiPromise(`/api/stories/${storyId}/entities`);
}

export function storyNytThemes(storyId) {
  return createApiPromise(`/api/stories/${storyId}/nyt-themes`);
}

export function story(storiesId, params) {
  const acceptedParams = acceptParams(params, ['text', 'q', 'snapshotId', 'timespanId', 'focusId', 'id']);
  return createApiPromise(`/api/stories/${storiesId}`, acceptedParams);
}

export function storyUpdate(storiesId, params) {
  const acceptedParams = acceptParams(params, ['id', 'title', 'url', 'guid', 'language', 'description', 'publish_date', 'custom_date', 'undateable']);
  return createPostingApiPromise(`/api/stories/${storiesId}/story-update`, acceptedParams);
}

export function storyWords(id, storiesId, params) {
  const acceptedParams = acceptParams(params, ['id', 'snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/stories/${storiesId}/words`, acceptedParams);
}

export function storyInlinks(id, storiesId, params) {
  const acceptedParams = acceptParams(params, ['id', 'snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/stories/${storiesId}/inlinks`, acceptedParams);
}

export function storyOutlinks(id, storiesId, params) {
  const acceptedParams = acceptParams(params, ['id', 'snapshotId', 'timespanId', 'focusId', 'q']);
  return createApiPromise(`/api/stories/${storiesId}/outlinks`, acceptedParams);
}

export function storyRedditAttention(storiesId) {
  return createApiPromise(`/api/stories/${storiesId}/reddit-attention`);
}

export function storyImages(storiesId) {
  return createApiPromise(`/api/stories/${storiesId}/images`);
}

export function storyQuotes(storiesId) {
  return createApiPromise(`/api/stories/${storiesId}/quotes`);
}
