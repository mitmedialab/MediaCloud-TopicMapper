import { parseId } from '../../lib/numberUtil';

export function pagedAndSortedLocation(location, linkId, sort, newFilters) {
  return { ...location,
    query: {
      ...location.query,
      linkId,
      sort,
      ...newFilters,
    } };
}

export function pagedLocation(location, linkId) {
  return { ...location,
    query: {
      ...location.query,
      linkId,
    } };
}

export function filteredLocation(location, filters) {
  return { ...location,
    query: {
      ...location.query,
      ...filters,
    } };
}

export function filteredLinkTo(to, filters, baseQuery) {
  let query = baseQuery || {};
  // don't add filters if there are none
  if (filters.snapshotId || parseId(filters.timespanId) || parseId(filters.focusId) || filters.q) {
    query = {
      snapshotId: parseId(filters.snapshotId),
      timespanId: parseId(filters.timespanId),
      focusId: parseId(filters.focusId),
      q: filters.q,
      ...query,
    };
  }
  return { pathname: to, query };
}

export function combineQueryParams(filterQ, query) {
  const parts = [];
  if (filterQ) {
    parts.push(filterQ);
  }
  if (query) {
    parts.push(query);
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(' AND ');
}

export function formatAsUrlParams(params) {
  // https://stackoverflow.com/questions/7045065/how-do-i-turn-a-javascript-dictionary-into-an-encoded-url-string
  return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${(v === null || v === undefined) ? '' : encodeURIComponent(v)}`).join('&');
}


export function filtersAsUrlParams(filters) {
  const cleanedFilters = {
    snapshotId: filters.snapshotId,
    timespanId: filters.timespanId || '',
    focusId: filters.focusId || '',
    q: filters.q || '',
  };
  return formatAsUrlParams(cleanedFilters);
}

export function urlWithFilters(to, filters) {
  return `#${to}?${filtersAsUrlParams(filters)}`;
}
