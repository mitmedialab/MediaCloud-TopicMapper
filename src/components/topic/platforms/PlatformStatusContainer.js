import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import IncompletePlatformWarning from './IncompletePlatformWarning';
import { fetchPlatformsInTopicList } from '../../../actions/topicActions';

/*   title: { id: 'platform.builder.title', defaultMessage: 'Platform Builder' },
};
*/
const PlatformStatusContainer = props => (
  <div className="platform-builder">
    <IncompletePlatformWarning />
    {props.children}
  </div>
);

PlatformStatusContainer.propTypes = {
  topicId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  children: PropTypes.node,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.platforms.all.fetchStatus,
  incomplete: state.topics.selected.platforms.all.incomplete,
});

const fetchAsyncData = (dispatch, { topicId }) => {
  dispatch(fetchPlatformsInTopicList(topicId));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      PlatformStatusContainer
    )
  )
);
