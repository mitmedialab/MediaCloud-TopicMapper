import { createApiPromise, acceptParams } from '../apiUtil';

// These params are passed to the low-level API to select the corpus to examine. They are required (or at least the timespanId is).
const TOPIC_FILTER_PARAMS = ['snapshotId', 'focusId', 'timespanId', 'q'];
// this is needed to help the reducer figure out where to put results (the value should be unique on the page being loaded)
const REDUCER_PARAMS = ['uid'];

export function topicProviderWords(topicId, params) {
  // these args control the low level query made via the API
  const optionalApiParams = ['sampleSize', 'ngramSize'];
  // this is needed to help the reducer figure out where to put results (the value should be unique on the page being loaded)
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...optionalApiParams, ...REDUCER_PARAMS]);
  return createApiPromise(`/api/topics/${topicId}/provider/words`, acceptedParams);
}

export function topicProviderStories(topicId, params) {
  // these params control the low level query made via the API
  const optionalApiParams = ['linkToMediaId', 'linkFromMediaId', 'linkToStoriesId', 'linkFromStoriesId', 'linkId', 'sort', 'limit'];
  // these params tell our front-end server what metadata to include in the download
  // (kind of only valid for CSV downloads, but included here for completeness and clarity)
  const downloadParams = ['storyLimit', 'storyTags', 'mediaMetadata', 'platformUrlShares', 'socialShares'];
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...optionalApiParams, ...REDUCER_PARAMS, ...downloadParams]);
  return createApiPromise(`/api/topics/${topicId}/provider/stories`, acceptedParams);
}

export function topicProviderCountOverTime(topicId, params) {
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...REDUCER_PARAMS]);
  return createApiPromise(`/api/topics/${topicId}/provider/count-over-time`, acceptedParams);
}

export function topicProviderCount(topicId, params) {
  const optionalApiParams = ['subQuery'];
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...REDUCER_PARAMS, ...optionalApiParams]);
  return createApiPromise(`/api/topics/${topicId}/provider/count`, acceptedParams);
}

export function topicProviderTagUse(topicId, params) {
  const optionalApiParams = ['tagsId', 'tagSetsId'];
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...REDUCER_PARAMS, ...optionalApiParams]);
  return createApiPromise(`/api/topics/${topicId}/provider/tag-use`, acceptedParams);
}

export function topicProviderMedia(topicId, params) {
  const optionalApiParams = ['sort', 'linkId'];
  const acceptedParams = acceptParams(params, [...TOPIC_FILTER_PARAMS, ...REDUCER_PARAMS, ...optionalApiParams]);
  return createApiPromise(`/api/topics/${topicId}/provider/media`, acceptedParams);
}
