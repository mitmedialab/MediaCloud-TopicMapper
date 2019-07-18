import { createApiPromise, createPostingApiPromise, acceptParams } from '../apiUtil';

export function systemStats() {
  return createApiPromise('/api/system-stats');
}

export const TEMP = 'TEMP'; // placeholder to remove stupid lint error


export function fetchMediaPickerFeaturedCollections() {
  // TODO fetch sources too, for now just temp using collections
  return createApiPromise('/api/mediapicker/collections/featured');
}
export function fetchMediaPickerCollections(params) {
  const acceptedParams = acceptParams(params, ['media_keyword', 'which_set']);
  return createApiPromise('/api/mediapicker/collections/search', acceptedParams);
}

export function fetchMediaPickerSources(params) {
  const acceptedParams = acceptParams(params, ['media_keyword', 'tags']);
  return createApiPromise('/api/mediapicker/sources/search', acceptedParams);
}

export function fetchRecentNews() {
  return createApiPromise('/api/release-notes');
}

export function fetchFavoriteSources() {
  return createApiPromise('/api/favorites/sources');
}

export function fetchFavoriteCollections() {
  return createApiPromise('/api/favorites/collections');
}

export function favoriteSource(mediaId, favorite) {
  return createPostingApiPromise(`/api/sources/${mediaId}/favorite`, { favorite: (favorite) ? 1 : 0 });
}

export function favoriteCollection(collectionId, favorite) {
  return createPostingApiPromise(`/api/collections/${collectionId}/favorite`, { favorite: (favorite) ? 1 : 0 }, 'put');
}

export function mediaMetadataValues(id) {
  return createApiPromise(`api/metadata/${id}/values`);
}

export function mediaMetadataSearch(id, params) {
  const acceptedParams = acceptParams(params, ['name']);
  return createApiPromise(`api/metadata/${id}/search`, acceptedParams);
}

export function sourceSystemSearch(searchStr) {
  return createApiPromise(`/api/sources/search/${searchStr}`);
}

export function fetchSystemUser(userId) {
  return createApiPromise(`/api/admin/users/${userId}`);
}

export function fetchSystemUsers(params) {
  const acceptedParams = acceptParams(params, ['searchStr', 'linkId']);
  return createApiPromise('/api/admin/users/list', acceptedParams);
}

export function updateSystemUser(userId, params) {
  const acceptedParams = acceptParams(params, ['full_name', 'email', 'active', 'roles[]', 'notes', 'max_topic_stories', 'weekly_requests_limit', 'has_consented']);
  return createPostingApiPromise(`/api/admin/users/${userId}/update`, acceptedParams);
}

export function deleteSystemUser(userId) {
  return createApiPromise(`/api/admin/users/${userId}/delete`);
}

export function fetchTopAnalyticsResults(params) {
  const acceptedParams = acceptParams(params, ['type', 'action']);
  return createApiPromise(`api/admin/analytics/top-${acceptedParams.type}/${acceptedParams.action}`);
}
