import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import TopicPageTitle from '../TopicPageTitle';
import { fetchPlatformsInTopicList } from '../../../actions/topicActions';

const localMessages = {
  title: { id: 'platform.builder.title', defaultMessage: 'Platform Builder' },
};

const PlatformBuilder = props => (
  <div className="platform-builder">
    <TopicPageTitle value={localMessages.title} />
    {props.children}
  </div>
);

PlatformBuilder.propTypes = {
  topicId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  children: PropTypes.node,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.platforms.all.fetchStatus,
});

const fetchAsyncData = (dispatch, { topicId }) => {
  dispatch(fetchPlatformsInTopicList(topicId));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      PlatformBuilder
    )
  )
);
