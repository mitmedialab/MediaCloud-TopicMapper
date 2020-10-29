import slugify from 'slugify';
import { serializeSearchTags } from '../../lib/explorerUtil';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER, BRANDWATCH_SOURCE } from '../../lib/platformTypes';
import { queryAsString, replaceCurlyQuotes } from '../../lib/stringUtil';

export const topicDownloadFilename = (topicName, filters) => (
  `${slugify(topicName)}-${filters.snapshotId}-${filters.timespanId}-${filters.focusId}`
);

export const formatPlatformOpenWebChannelData = (formValues) => {
  let data = {};
  if (formValues) {
    data = {
      'collections[]': formValues.media.filter(s => s.tags_id !== undefined).map(s => s.tags_id),
      'sources[]': formValues.media.filter(s => s.media_id !== undefined).map(s => s.media_id),
      'searches[]': serializeSearchTags(formValues.media.filter(s => s.customColl === true)),
    };
  } else {
    data = {
      'collections[]': [],
      'sources[]': [],
      'searches[]': [],
    };
  }
  return data;
};

export const formatTopicOpenWebSourcesForQuery = (topicSourcesAndCollections) => {
  if (topicSourcesAndCollections) {
    return {
      channel: {
        'collections[]': topicSourcesAndCollections.map(s => s.tags_id),
        'sources[]': topicSourcesAndCollections.map(s => s.media_id),
        'searches[]': serializeSearchTags(topicSourcesAndCollections.filter(s => s.customColl === true)),
      },
    };
  }
  return {
    channel: {
      'collections[]': [],
      'sources[]': [],
      'searches[]': [],
    },
  };
};

// handle string or codemirror object
export const topicQueryAsString = (query) => {
  const strQ = queryAsString(query);
  if (strQ) {
    return replaceCurlyQuotes(strQ);
  }
  return strQ;
};

// while creating a topic, this can format the under-construction topic params propertly for a preview request
export const formatTopicPreviewQuery = (topicQuery) => ({
  q: topicQueryAsString(topicQuery.solr_seed_query),
  start_date: topicQuery.start_date,
  end_date: topicQuery.end_date,
  ...formatTopicOpenWebSourcesForQuery(topicQuery.sourcesAndCollections),
});

export const formatPlatformRedditChannelData = (formValues) => ((formValues.channel && formValues.channel.length > 0) ? formValues.channel.split(',') : '');

export const timespanForDate = (date, timespans, period) => timespans.filter(t => t.period === period).find(t => date >= t.startDateObj && date <= t.endDateObj);

export const formatQueryData = (selectedPlatform, formValues) => {
  let { query } = formValues;
  const { project } = formValues;
  const { platform, source } = selectedPlatform;
  if (platform === PLATFORM_TWITTER && source === BRANDWATCH_SOURCE) {
    query = `${project}-${query}`;
  }
  return topicQueryAsString(query);
};

export const parseQueryProjectId = (platform, source, fullQuery) => {
  let project;
  let query = fullQuery;
  if (platform === PLATFORM_TWITTER && source === BRANDWATCH_SOURCE) {
    const tokens = fullQuery.split('-');
    if (tokens.length === 2) {
      [project, query] = tokens;
    }
  }
  return { query, project };
};

export const platformChannelDataFormatter = (platform) => {
  switch (platform) {
    case PLATFORM_OPEN_WEB:
      return formatPlatformOpenWebChannelData;
    case PLATFORM_REDDIT:
      return formatPlatformRedditChannelData;
    case PLATFORM_TWITTER:
    default:
      // return a function that returns the values without changing the format
      return function (formValues) { return formValues; };
  }
};

export const hidePreview = (source) => source === BRANDWATCH_SOURCE;
