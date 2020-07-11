import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchSourceStats } from '../../../actions/sourceActions';
import StatBar from '../../common/statbar/StatBar';
import messages from '../../../resources/messages';
import { healthStartDateToMoment } from '../../../lib/dateUtil';

const localMessages = {
  nytPct: { id: 'source.summary.statbar.nyt', defaultMessage: 'With Themes' },
  geoPct: { id: 'source.summary.statbar.geo', defaultMessage: 'With Entities' },
  collections: { id: 'source.summary.statbar.collections', defaultMessage: 'Collections' },
  coveredSince: { id: 'source.summary.statbar.coveredSince', defaultMessage: 'Covered Since' },
  storyCount: { id: 'source.summary.statbar.storyCount', defaultMessage: 'Total Stories' },
  storiesPerDayHelpTitle: { id: 'source.summary.statbar.perDay.title', defaultMessage: 'About Stories per Day' },
  storiesPerDayHelpContent: { id: 'source.summary.statbar.perDay.content', defaultMessage: 'This is average of the number of stories per day we have ingested over the last 90 days.' },
};

const SourceStatInfo = (props) => {
  const { sourceId, sourceInfo } = props;
  const { formatNumber, formatDate, formatMessage } = props.intl;
  if ((sourceId === null) || (sourceId === undefined)) {
    return null;
  }
  let formattedDateStr;
  if (sourceInfo.start_date) {
    const startDate = healthStartDateToMoment(sourceInfo.start_date);
    formattedDateStr = formatDate(startDate, { month: 'numeric', year: 'numeric' });
  } else {
    formattedDateStr = formatMessage(messages.unknown);
  }
  return (
    <StatBar
      columnWidth={2}
      stats={[
        { message: localMessages.storyCount, data: formatNumber(sourceInfo.story_count) },
        { message: localMessages.coveredSince, data: formattedDateStr },
        { message: localMessages.collections, data: formatNumber(sourceInfo.collection_count) },
        { message: messages.storiesPerDay,
          data: formatNumber(Math.round(sourceInfo.num_stories_90)),
          helpTitleMsg: localMessages.storiesPerDayHelpTitle,
          helpContentMsg: localMessages.storiesPerDayHelpContent,
        },
        { message: localMessages.geoPct,
          data: formatNumber(sourceInfo.geoPct, { style: 'percent', maximumFractionDigits: 0 }),
          helpTitleMsg: messages.entityHelpTitle,
          helpContentMsg: messages.entityHelpContent,
        },
        { message: localMessages.nytPct,
          data: formatNumber(sourceInfo.nytPct, { style: 'percent', maximumFractionDigits: 0 }),
          helpTitleMsg: messages.themeHelpTitle,
          helpContentMsg: messages.themeHelpContent,
        },
      ]}
    />
  );
};

SourceStatInfo.propTypes = {
  // from parent
  sourceId: PropTypes.number.isRequired,
  sourceInfo: PropTypes.object.isRequired,
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,

};

const mapStateToProps = state => ({
  fetchStatus: state.sources.sources.selected.stats.fetchStatus,
  sourceInfo: state.sources.sources.selected.stats,
});

const fetchAsyncData = (dispatch, { sourceId }) => dispatch(fetchSourceStats(sourceId));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      SourceStatInfo
    )
  )
);
