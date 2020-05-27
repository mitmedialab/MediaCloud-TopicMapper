import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
// import { reset } from 'redux-form';
import PlatformWizard from './builder/PlatformWizard';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { topicUpdatePlatform, setTopicNeedsNewSnapshot, selectPlatform, fetchPlatformsInTopicList } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import { platformChannelDataFormatter, topicQueryAsString } from '../../util/topicUtil';

const localMessages = {
  platformSaved: { id: 'focus.edit.saved', defaultMessage: 'We saved your platform.' },
  platformNotSaved: { id: 'focus.edit.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
};

class EditPlatformContainer extends React.Component {
  getInitialValues = () => {
    const { topicId, selectedPlatform } = this.props;
    return {
      topicId,
      selectedPlatform,
    };
  }

  render() {
    const { topicId, location, handleUpdatePlatform, selectedPlatform } = this.props;
    const initialValues = this.getInitialValues();
    return (selectedPlatform.topic_seed_queries_id !== -1) && (
      <PlatformWizard
        topicId={topicId}
        startStep={0}
        initialValues={initialValues}
        location={location}
        onDone={(tId, values) => handleUpdatePlatform(initialValues, values)}
      />
    );
  }
}

EditPlatformContainer.propTypes = {
  // from context:
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  // from state
  allPlatforms: PropTypes.array.isRequired,
  selectedPlatformId: PropTypes.number.isRequired,
  selectedPlatform: PropTypes.object.isRequired,
  // from dispatch
  fetchStatus: PropTypes.string.isRequired,
  handleUpdatePlatform: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  fetchStatus: state.topics.selected.platforms.all.fetchStatus, // the builder fetches this, so we don't need to
  selectedPlatformId: parseInt(ownProps.params.platformId, 10),
  allPlatforms: state.topics.selected.platforms.all.results,
  selectedPlatform: state.topics.selected.platforms.selected,
});

const mapDispatchToProps = (dispatch, { intl }) => ({
  handleUpdatePlatform: (topicInfo, formValues) => {
    const formatPlatformChannelData = platformChannelDataFormatter(formValues.platform);
    const infoForQuery = {
      platform_type: formValues.platform,
      platform_query: topicQueryAsString(formValues.query),
      platform_source: formValues.source || '',
      platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
      start_date: formValues.start_date,
      end_date: formValues.end_date,
    };
    return dispatch(topicUpdatePlatform(topicInfo.topicId, formValues.topic_seed_queries_id, infoForQuery))
      .then((results) => { // remember, new id comes back b/c we are deleting/adding
        if (results.success) {
          const platformSavedMessage = intl.formatMessage(localMessages.platformSaved);
          dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: platformSavedMessage })); // user feedback
          dispatch(fetchPlatformsInTopicList(topicInfo.topics_id)); // force refetch of newly configured platforms
          dispatch(push(`/topics/${topicInfo.topicId}/platforms/manage`)); // go back to focus management page
        } else {
          const platformNotSavedMessage = intl.formatMessage(localMessages.platformNotSaved);
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: platformNotSavedMessage })); // user feedback
        }
      });
  },
});

const fetchAsyncData = (dispatch, { allPlatforms, selectedPlatformId }) => {
  // already loaded by PlatformBuilder parent,so just select the one the user wants
  const toSelect = allPlatforms.find(p => p.topic_seed_queries_id === selectedPlatformId);
  dispatch(selectPlatform({ ...toSelect }));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      EditPlatformContainer
    )
  )
);
