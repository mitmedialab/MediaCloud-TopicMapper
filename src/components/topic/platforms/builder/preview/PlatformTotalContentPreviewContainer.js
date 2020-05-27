import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import withAsyncData from '../../../../common/hocs/AsyncDataContainer';
import withDescription from '../../../../common/hocs/DescribedDataCard';
import { fetchPlatformCount } from '../../../../../actions/platformActions';
import StatBar from '../../../../common/statbar/StatBar';
import { topicQueryAsString } from '../../../../util/topicUtil';

const formSelector = formValueSelector('platform');

const localMessages = {
  title: { id: 'topic.platforms.preview.storyCount.title', defaultMessage: 'Matching Content' },
  helpText: { id: 'topic.platforms.preview.storyCount.help.text',
    defaultMessage: '<p>This is a visualization showing how many pieces of content match your query on the platform.</p>',
  },
  filteredLabel: { id: 'topic.platforms.preview.storyCount.matching', defaultMessage: 'Matching Content' },
  totalLabel: { id: 'topic.platforms.preview.storyCount.total', defaultMessage: 'All Content' },
  descriptionIntro: { id: 'platform.preview.about', defaultMessage: 'Here is a preview of total amount of content we have found that match your query.' },
};

const PlatformTotalContentPreviewContainer = ({ total, intl }) => (
  <StatBar
    columnWidth={4}
    stats={[
      { message: localMessages.title, data: intl.formatNumber(total) },
    ]}
  />
);

PlatformTotalContentPreviewContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topic: PropTypes.object.isRequired,
  lastUpdated: PropTypes.number,
  formatPlatformChannelData: PropTypes.func, // will be pass the formValues, and should return a string suitable for upload to server
  // from state
  total: PropTypes.number,
  supported: PropTypes.bool,
  fetchStatus: PropTypes.string.isRequired,
  selectedPlatform: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
  fetchStatus: state.platforms.count.fetchStatus,
  total: state.platforms.count.count,
  supported: state.platforms.count.supported,
  formValues: formSelector(state, 'media', 'query', 'channel'),
  selectedPlatform: state.topics.selected.platforms.selected,
});

const fetchAsyncData = (dispatch, { topic, formValues, selectedPlatform, formatPlatformChannelData }) => {
  // call the fetcher the parent passed in to fetch the data we want to show
  dispatch(fetchPlatformCount({
    platform_type: selectedPlatform.platform,
    platform_query: topicQueryAsString(formValues.query),
    platform_source: selectedPlatform.source,
    platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
    start_date: topic.start_date,
    end_date: topic.end_date,
  }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['lastUpdated', 'supported'])(
      withDescription(localMessages.descriptionIntro, null, 'supported')(
        PlatformTotalContentPreviewContainer
      )
    )
  )
);
