import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import StatBar from '../../common/statbar/StatBar';
import messages from '../../../resources/messages';

const localMessages = {
  storyCount: { id: 'topic.summary.timespanInfo.storyCount', defaultMessage: 'Total Stories' },
  storyCountHelp: { id: 'topic.summary.timespanInfo.storyCount.help', defaultMessage: 'This the total number of stories within this topic that match the timespan you\'ve selected and the filters you have in place. This includes the seed stories and any stories we found via the "spidering" process that follows links form those see stories iteratively to discover more stories about your topic.' },
  mediumCount: { id: 'topic.summary.timespanInfo.mediumCount', defaultMessage: 'Media Sources' },
  mediumCountHelp: { id: 'topic.summary.timespanInfo.mediumCount.help', defaultMessage: 'The number of unique media sources that published any stories within this timespan that match the filters you have in place. If you are filtering by a search query we can\'t easily compute this number.' },
  storyLinkCount: { id: 'topic.summary.timespanInfo.storyLinkCount', defaultMessage: 'Story Links' },
  storyLinkCountHelp: { id: 'topic.summary.timespanInfo.storyLinkCount.help', defaultMessage: 'The number of links between stories within this timespan that match the filters you have in place.  A story link is a hyperlink from one story to another. For example, if there was only one Chicago Tribune story linked to and it was linked to by 3 New York times stories and 2 Boston Globe stories, then the story links count would be 5. If you are filtering by a search query we can\'t easily compute this number.' },
  mediumLinkCount: { id: 'topic.summary.timespanInfo.mediumLinkCount', defaultMessage: 'Media Links' },
  mediumLinkCountHelp: { id: 'topic.summary.timespanInfo.mediumLinkCount.help', defaultMessage: 'The number of links between media sources with stories within this timespan that match the filters you have in place. A media link is when one media source links any number of times to another media source. For example, if there was only one Chicago Tribune story linked to and it was linked to by 3 New York times stories and 2 Boston Globe stories, then the story links count would be 2 (because only two unqiue media sources linked to the Chicago Tribune story). If you are filtering by a search query we can\'t easily compute this number.' },
};

const TopicStoryStats = (props) => {
  const { timespan, filters } = props;
  const { formatNumber, formatMessage } = props.intl;
  if ((timespan === null) || (timespan === undefined)) {
    return null;
  }
  let stats;
  if (filters.q) {
    // if there is a query filter in place, then we can't get many of these stats easily :-(
    stats = [
      { message: localMessages.storyCount, data: formatMessage(messages.unknown) },
      { message: localMessages.mediumCount, data: formatMessage(messages.unknown) },
      { message: localMessages.storyLinkCount, data: formatMessage(messages.unknown) },
      { message: localMessages.mediumLinkCount, data: formatMessage(messages.unknown) },
    ];
  } else {
    stats = [
      { message: localMessages.storyCount, data: formatNumber(timespan.story_count), helpTitleMsg: localMessages.storyCount, helpContentMsg: localMessages.storyCountHelp },
      { message: localMessages.mediumCount, data: formatNumber(timespan.medium_count), helpTitleMsg: localMessages.mediumCount, helpContentMsg: localMessages.mediumCountHelp },
      { message: localMessages.storyLinkCount, data: formatNumber(timespan.story_link_count), helpTitleMsg: localMessages.storyLinkCount, helpContentMsg: localMessages.storyLinkCountHelp },
      { message: localMessages.mediumLinkCount, data: formatNumber(timespan.medium_link_count), helpTitleMsg: localMessages.mediumLinkCount, helpContentMsg: localMessages.mediumLinkCountHelp },
    ];
  }
  return (
    <>
      <StatBar
        columnWidth={3}
        stats={stats}
      />
    </>
  );
};

TopicStoryStats.propTypes = {
  // from parent
  timespan: PropTypes.object,
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TopicStoryStats);
