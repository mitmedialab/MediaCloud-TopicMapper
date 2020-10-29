import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { reset } from 'redux-form';
import { push } from 'react-router-redux';
import PlatformWizard from './builder/PlatformWizard';
import { topicCreatePlatform, setTopicNeedsNewSnapshot, fetchPlatformsInTopicList, fetchTopicSummary } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import { platformChannelDataFormatter, formatQueryData, hidePreview } from '../../util/topicUtil';
import { BRANDWATCH_SOURCE } from '../../../lib/platformTypes';

const DEFAULT_SELECTED_NUMBER = 5;

const localMessages = {
  platformNotSaved: { id: 'platform.create.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
  platformSaved: { id: 'platform.create.saved', defaultMessage: 'That worked!' }
};


const CreatePlatformContainer = (props) => {
  const { topicInfo, location, handleDone, selectedPlatform } = props;
  const initialValues = { numberSelected: DEFAULT_SELECTED_NUMBER, selectedPlatform };
  // default to any solr seed query they might be using already
  const initAndTopicInfoValues = { ...initialValues, ...topicInfo, query: topicInfo.solr_seed_query };
  return (
    <PlatformWizard
      topicId={topicInfo.topics_id}
      startStep={0}
      currentStep={0}
      initialValues={initAndTopicInfoValues}
      location={location}
      onDone={(id, values) => handleDone(initAndTopicInfoValues, values)}
      hidePreview={hidePreview(selectedPlatform.source)}
    />
  );
};

CreatePlatformContainer.propTypes = {
  // from dispatch
  submitDone: PropTypes.func.isRequired,
  handleDone: PropTypes.func.isRequired,
  // from state
  values: PropTypes.object,
  selectedPlatform: PropTypes.object.isRequired,
  // from context:
  topicInfo: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  topicInfo: state.topics.selected.info,
  selectedPlatform: state.topics.selected.platforms.selected,
});

const mapDispatchToProps = (dispatch, { intl }) => ({
  submitDone: (topicInfo, formValues) => {
    const formatPlatformChannelData = platformChannelDataFormatter(formValues.selectedPlatform.platform);
    const infoForQuery = {
      platform_type: formValues.selectedPlatform.platform,
      platform_query: formatQueryData(formValues.selectedPlatform, formValues),
      platform_source: formValues.selectedPlatform.source,
      platform_channel: JSON.stringify(formatPlatformChannelData(formValues)),
      start_date: topicInfo.start_date,
      end_date: topicInfo.end_date,
    };
    return dispatch(topicCreatePlatform(topicInfo.topics_id, infoForQuery))
      .then((results) => {
        if (results.success) {
          const platformSavedMessage = intl.formatMessage(localMessages.platformSaved);
          dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: platformSavedMessage })); // user feedback
          dispatch(fetchPlatformsInTopicList(topicInfo.topics_id)); // force refetch of newly configured platforms
          dispatch(push(`/topics/${topicInfo.topics_id}/summary`));
          dispatch(reset('platform')); // it is a wizard so we have to do this by hand
          dispatch(fetchTopicSummary(topicInfo.topics_id)); // force refetch of newly configured platforms
        } else {
          const platformNotSavedMessage = intl.formatMessage(localMessages.platformNotSaved);
          dispatch(updateFeedback({ open: true, message: platformNotSavedMessage })); // user feedback
        }
      });
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps, ...dispatchProps, ...ownProps, handleDone: (topicId, formValues) => dispatchProps.submitDone(stateProps.topicInfo, formValues, stateProps) };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    CreatePlatformContainer
  )
);
