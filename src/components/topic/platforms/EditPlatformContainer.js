import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
// import { reset } from 'redux-form';
import PlatformWizard from './builder/PlatformWizard';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { topicUpdatePlatform, setTopicNeedsNewSnapshot, selectPlatform } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER } from '../../../lib/platformTypes';
import { formatTopicOpenWebPreviewQuery, formatTopicRedditPreviewForQuery, formatTopicTwitterPreviewForQuery } from '../../util/topicUtil';

const localMessages = {
  platformSaved: { id: 'focus.edit.saved', defaultMessage: 'We saved your platform.' },
  platformNotSaved: { id: 'focus.edit.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
};

class EditPlatformContainer extends React.Component {
  getInitialValues = () => {
    const { topicId, selectedPlatform } = this.props;
    return {
      topicId,
      currentPlatformId: selectedPlatform.topic_seed_queries_id,
      currentPlatformType: selectedPlatform.platform,
      platformDetails: selectedPlatform,
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleUpdatePlatform: (originalValues, formValues) => {
    let infoForQuery = {};
    switch (originalValues.currentPlatformType) {
      case PLATFORM_OPEN_WEB:
        // need media
        infoForQuery = {
          ...formatTopicOpenWebPreviewQuery({ ...originalValues, query: formValues.query, channel: formValues.media }),
        };
        break;
      case PLATFORM_TWITTER:
        // source = internet archive or push_shift
        infoForQuery = {
          ...formatTopicTwitterPreviewForQuery({ ...originalValues, query: formValues.query, channel: formValues.media }),
        };
        break;
      case PLATFORM_REDDIT:
        infoForQuery = {
          ...formatTopicRedditPreviewForQuery({ ...originalValues, query: formValues.currentQuery, channel: formValues.media }),
        };
        break;
      default:
        return null;
    }
    // NOTE, this may be a remove/add vs an update on the back end
    return dispatch(topicUpdatePlatform(originalValues.topicId, ownProps.params.platformId, infoForQuery))
      .then((results) => {
        if (results.status.indexOf('200 OK') > -1) { // TODO will have to check results
          // TODO get topicId from return const newOrSameId = results.id
          const platformSavedMessage = ownProps.intl.formatMessage(localMessages.platformSaved);
          dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: platformSavedMessage })); // user feedback
          dispatch(push(`/topics/${originalValues.topics_id}/platforms/manage`)); // go back to focus management page
          // dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
        } else {
          const platformNotSavedMessage = ownProps.intl.formatMessage(localMessages.platformNotSaved);
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
