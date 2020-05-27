import { createPostingApiPromise, acceptParams } from '../apiUtil';

export const platformQueryParams = [
  'platform_type', 'platform_query', 'platform_channel', 'platform_source',
  'start_date', 'end_date',
  'sources[]', 'collections[]', 'searches[]',
];

export function platformCount(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/count', acceptedParams);
}

export function platformCountOverTime(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/count-over-time', acceptedParams);
}

export function platformWords(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/words', acceptedParams);
}

export function platformSample(params) {
  const acceptedParams = acceptParams(params, platformQueryParams);
  return createPostingApiPromise('/api/platforms/sample', acceptedParams);
}
