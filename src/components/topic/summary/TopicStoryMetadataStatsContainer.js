import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import { fetchTopicProviderCount } from '../../../actions/topicActions';
import StatBar from '../../common/statbar/StatBar';
import messages from '../../../resources/messages';
import { TAG_NYT_LABELER_1_0_0, CLIFF_VERSION_TAG_LIST, TAG_STORY_UNDATEABLE } from '../../../lib/tagUtil';

const localMessages = {
  themedCount: { id: 'topic.summary.storystats.themedCount', defaultMessage: 'Stories Checked for Themes' },
  geocodedCount: { id: 'topic.summary.storystats.geocodedCount', defaultMessage: 'Stories Checked for Entities' },
  englishCount: { id: 'topic.summary.storystats.englishCount', defaultMessage: 'English Stories' },
  undateableCount: { id: 'topic.summary.storystats.undateableCount', defaultMessage: 'Undateable Stories' },
};

const TopicStoryMetadataStatsContainer = (props) => {
  const { timespan, nytThemeCoverage, undateableCount, entityCoverage, englishCounts } = props;
  const { formatNumber } = props.intl;
  if ((timespan === null) || (timespan === undefined)) {
    return null;
  }
  return (
    <StatBar
      columnWidth={3}
      stats={[
        { message: localMessages.englishCount,
          data: formatNumber(englishCounts.count / entityCoverage.total, { style: 'percent', maximumFractionDigits: 0 }) },
        { message: localMessages.undateableCount,
          data: formatNumber(undateableCount.count / undateableCount.total, { style: 'percent', maximumFractionDigits: 0 }) },
        { message: localMessages.geocodedCount,
          data: formatNumber(entityCoverage.count / entityCoverage.total, { style: 'percent', maximumFractionDigits: 0 }),
          helpTitleMsg: messages.entityHelpTitle,
          helpContentMsg: messages.entityHelpContent,
        },
        { message: localMessages.themedCount,
          data: formatNumber(nytThemeCoverage.count / nytThemeCoverage.total, { style: 'percent', maximumFractionDigits: 0 }),
          helpTitleMsg: messages.themeHelpTitle,
          helpContentMsg: messages.themeHelpContent,
        },
      ]}
    />
  );
};

TopicStoryMetadataStatsContainer.propTypes = {
  // from parent
  timespan: PropTypes.object,
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  entityCoverage: PropTypes.object,
  englishCounts: PropTypes.object,
  nytThemeCoverage: PropTypes.object,
  undateableCount: PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.provider.count.fetchStatus,
  entityCoverage: state.topics.selected.provider.count.results.entities || null,
  undateableCount: state.topics.selected.provider.count.results.undateable || null,
  nytThemeCoverage: state.topics.selected.provider.count.results.nytThemes || null,
  englishCounts: state.topics.selected.provider.count.results.englishLanguage || null,
  filters: state.topics.selected.filters,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicProviderCount(props.topicId, {
    uid: 'englishLanguage',
    ...props.filters,
    subQuery: 'language:en',
  }));
  dispatch(fetchTopicProviderCount(props.topicId, {
    uid: 'entities',
    ...props.filters,
    subQuery: `tags_id_stories:(${CLIFF_VERSION_TAG_LIST.join(' ')})`,
  }));
  dispatch(fetchTopicProviderCount(props.topicId, {
    uid: 'undateable',
    ...props.filters,
    subQuery: `tags_id_stories:(${TAG_STORY_UNDATEABLE})`,
  }));
  dispatch(fetchTopicProviderCount(props.topicId, {
    ...props.filters,
    uid: 'nytThemes',
    subQuery: `tags_id_stories:(${TAG_NYT_LABELER_1_0_0})`,
  }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      TopicStoryMetadataStatsContainer
    )
  )
);
