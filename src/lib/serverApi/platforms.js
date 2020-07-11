import { createPostingApiPromise, acceptParams } from '../apiUtil';
import { PLATFORM_OPEN_WEB, MEDIA_CLOUD_SOURCE } from '../platformTypes';

export const platformQueryParams = [
  'platform_type', 'platform_query', 'platform_channel', 'platform_source',
  'start_date', 'end_date',
  'sources[]', 'collections[]', 'searches[]', // TODO: elimate these and put them under `platform_channel`
];

// default to open web / MC from start of project until now
const defaultPlatformQueryParams = {
  platform_type: PLATFORM_OPEN_WEB,
  platform_source: MEDIA_CLOUD_SOURCE,
  platform_channel: '',
  start_date: '2010-01-01',
  end_date: new Date().toJSON().slice(0, 10),
};

export function platformCount(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/count', { ...defaultPlatformQueryParams, ...acceptedParams });
}

export function platformCountOverTime(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/count-over-time', { ...defaultPlatformQueryParams, ...acceptedParams });
}

export function platformWords(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/words', { ...defaultPlatformQueryParams, ...acceptedParams });
}

export function platformSample(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/sample', { ...defaultPlatformQueryParams, ...acceptedParams });
}

export function platformTags(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/tags', { ...defaultPlatformQueryParams, ...acceptedParams });
}
