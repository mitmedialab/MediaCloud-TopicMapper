import slugify from 'slugify';
import { serializeSearchTags } from '../../lib/explorerUtil';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER } from '../../lib/platformTypes';
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

export const platformChannelDataFormatter = (platform) => {
  switch (platform) {
    case PLATFORM_OPEN_WEB:
      return formatPlatformOpenWebChannelData;
    case PLATFORM_REDDIT:
      return formatPlatformRedditChannelData;
    case PLATFORM_TWITTER:
    default:
      return null;
  }
};
