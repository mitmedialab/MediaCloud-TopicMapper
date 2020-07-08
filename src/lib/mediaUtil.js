import { notEmptyString } from './formValidators';

export const VIEW_ALL_STORIES = 'VIEW_ALL_STORIES';
export const VIEW_REGULARLY_COLLECTED = 'VIEW_REGULARLY_COLLECTED';
export const ALL_MEDIA = -1;

export function decodeQueryParamString(queryString) {
  let queriesFromUrl = JSON.parse(queryString.query.qs);
  queriesFromUrl = {
    ...queriesFromUrl,
    q: notEmptyString(queriesFromUrl.q) ? decodeURIComponent(queriesFromUrl.q) : '',
  };

  return queriesFromUrl;
}
