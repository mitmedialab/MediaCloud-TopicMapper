import slugify from 'slugify';
import { serializeSearchTags } from '../../lib/explorerUtil';
import { queryAsString } from '../../lib/stringUtil';

export const topicDownloadFilename = (topicName, filters) => (
  `${slugify(topicName)}-${filters.snapshotId}-${filters.timespanId}-${filters.focusId}`
);

export const formatTopicOpenWebSourcesForQuery = (topicSourcesAndCollections) => {
  if (topicSourcesAndCollections) {
    return {
      'collections[]': topicSourcesAndCollections.map(s => s.tags_id),
      'sources[]': topicSourcesAndCollections.map(s => s.media_id),
      'searches[]': serializeSearchTags(topicSourcesAndCollections.filter(s => s.customColl === true)),
    };
  }
  return {
    'collections[]': [],
    'sources[]': [],
    'searches[]': [],
  };
};

// handle string or codemirror object
export const topicQueryAsString = queryAsString;

// while creating a topic, this can format the under-construction topic params propertly for a preview request
export const formatTopicPreviewQuery = (topicQuery) => ({
  q: topicQueryAsString(topicQuery.solr_seed_query),
  start_date: topicQuery.start_date,
  end_date: topicQuery.end_date,
  ...formatTopicOpenWebSourcesForQuery(topicQuery.sourcesAndCollections),
});

export const timespanForDate = (date, timespans, period) => timespans.filter(t => t.period === period).find(t => date >= t.startDateObj && date <= t.endDateObj);

export const TEMP = 'temp';
