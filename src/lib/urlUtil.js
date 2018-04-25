import slugify from 'slugify';
import { getBrandDarkerColor } from '../styles/colors';

// internal tag used to get the hostname from a url
const tempATag = document.createElement('a');

// return the URL to the favicon for a website domain
export function googleFavIconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}`;
}

// return our best guess for the domain name of a story
export function storyDomainName(story) {
  // use guid unless it isn't a url
  if ({}.hasOwnProperty.call(story, 'guid')) {
    tempATag.href = (story.guid.startsWith('http')) ? story.guid : story.url;
  } else {
    tempATag.href = story.url;
  }
  // get the domain without any subdomain
  const domain = tempATag.hostname.split('.').slice(-2).join('.');
  return domain;
}

export function urlToSourceManager(param) {
  return `https://sources.mediacloud.org/#/${param}`;
}

export function slugifyLocalSourcePath(param) {
  let name = param.name;
  name = slugify(name);
  return `sources/${param.id || param.media_id}/${name}`;
}

export function slugifyLocalCollectionPath(param) {
  let collLabel = param.label || param.tag;
  collLabel = slugify(collLabel);
  return `collections/${param.id || param.tags_id}/${collLabel}`;
}

export function urlToCollection(param) {
  let collLabel = param.label || param.tag;
  collLabel = slugify(collLabel);
  return urlToSourceManager(`collections/${param.id || param.tags_id}/${collLabel}`);
}

export function urlToSource(param) {
  return urlToSourceManager(`sources/${param.id || param.media_id}/`);
}

export function urlToTopicMapper(param) {
  return `https://topics.mediacloud.org/#/${param}`;
}

export function urlToExplorer(param) {
  return `https://explorer.mediacloud.org/#/${param}`;
}

export function urlToDashboardQuery(name, keywords, sourceIds, collectionIds, startDate, endDate) {
  const mediaInfo = {};
  if (sourceIds && sourceIds.length > 0) {
    mediaInfo.sources = sourceIds;
  }
  if (collectionIds && collectionIds.length > 0) {
    mediaInfo.sets = collectionIds;
  }
  const startDateStr = startDate;
  const endDateStr = endDate;
  return `https://dashboard.mediacloud.org/#query/["${keywords}"]/[${JSON.stringify(mediaInfo)}]/["${startDateStr}"]/["${endDateStr}"]/[{"uid":1,"name":"${name}","color":"${getBrandDarkerColor().substr(1)}"}]`;
}

export function urlToExplorerQuery(name, keywords, sourceIds, collectionIds, startDate, endDate) {
  const color = encodeURIComponent(`#${getBrandDarkerColor().substr(1)}`);
  let sources = sourceIds;
  if (!sources || sources.length === 0) {
    sources = '[]';
  }
  let collections = collectionIds;
  if (!collections || collections.length === 0) {
    collections = '[]';
  }
  return `https://explorer.mediacloud.org/#/queries/search?q=[{"label":"${encodeURIComponent(name)}","q":"${encodeURIComponent(keywords)}","color":"${color}","startDate":"${startDate}","endDate":"${endDate}","sources":${sources},"collections":${collections}}]`;
}
