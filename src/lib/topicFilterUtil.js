import { combineQueryParams } from '../components/util/location';

export const VIEW_1K = 1000;

export const TOPIC_PERSONAL = 'personal';

export const TOPIC_PUBLIC = 'public';

export const TOPIC_STARRED = 'favorited';

export function mergeFilters(currentProps, specificQueryFragment) {
  let filterObj = {};
  if (currentProps.filters) {
    filterObj = {
      ...currentProps.filters,
      sampleSize: currentProps.sampleSize,
      q: combineQueryParams(currentProps.filters.q, specificQueryFragment),
    };
  } else {
    filterObj = {
      sampleSize: currentProps.sampleSize,
      q: specificQueryFragment,
    };
  }
  return filterObj;
}
