import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';
import FocusBuilderWizard from './builder/FocusBuilderWizard';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import { fetchFocalSetDefinitions, submitFocusUpdateOrCreate, setTopicNeedsNewSnapshot } from '../../../../actions/topicActions';
import { updateFeedback } from '../../../../actions/appActions';

const DEFAULT_SELECTED_NUMBER = 5;

const localMessages = {
  focusSaved: { id: 'focus.create.saved', defaultMessage: 'We saved your new Subtopic.' },
  focusNotSaved: { id: 'focus.create.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
};

class EditFocusContainer extends React.Component {
  getInitialValues = () => {
    const { topicId, focusDefinition } = this.props;
    return {
      topicId,
      focusName: focusDefinition.name,
      focusDescription: focusDefinition.description,
      focusDefinitionId: focusDefinition.focus_definitions_id,
      focalTechnique: focusDefinition.focalTechnique,
      keywords: focusDefinition.query,
      numberSelected: DEFAULT_SELECTED_NUMBER,
      mediaType: 0,
    };
  }

  render() {
    const { topicId, location, handleDone } = this.props;
    const intialValues = this.getInitialValues();
    return (
      <FocusBuilderWizard
        topicId={topicId}
        startStep={1}
        initialValues={intialValues}
        location={location}
        onDone={handleDone}
      />
    );
  }
}

EditFocusContainer.propTypes = {
  // from context:
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  // from state
  focusDefinition: PropTypes.object.isRequired,
  // from dispatch
  fetchStatus: PropTypes.string.isRequired,
  handleDone: PropTypes.func.isRequired,
};

const findFocalSetDefById = (state, focusDefId) => {
  const focalSetDefinitions = state.topics.selected.focalSets.definitions.list;
  if (focalSetDefinitions.length === 0) {
    return null;
  }
  const matchingFocalSetDef = focalSetDefinitions.find(
    focalSetDef => focalSetDef.focus_definitions.map(
      focusDef => focusDef.focus_definitions_id
    ).includes(focusDefId)
  );
  const matchingFocusDef = matchingFocalSetDef.focus_definitions.find(
    focusDef => focusDef.focus_definitions_id === focusDefId
  );
  return { ...matchingFocusDef, focalTechnique: matchingFocalSetDef.focal_technique };
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  fetchStatus: state.topics.selected.focalSets.definitions.fetchStatus,
  focusDefId: parseInt(ownProps.params.focusDefId, 10),
  focusDefinition: findFocalSetDefById(state, parseInt(ownProps.params.focusDefId, 10)), // find the one we want to edit
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDone: (topicId, formValues) => {
    const propsToSubmit = {
      foci_id: parseInt(ownProps.params.focusDefId, 10),
      ...formValues,
    };
    return dispatch(submitFocusUpdateOrCreate(topicId, propsToSubmit))
      .then((results) => {
        if (results.length === 1) {
          const focusSavedMessage = ownProps.intl.formatMessage(localMessages.focusSaved);
          dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
          dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
          dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
        } else {
          const focusNoteSavedMessage = ownProps.intl.formatMessage(localMessages.focusNotSaved);
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: focusNoteSavedMessage })); // user feedback
        }
      });
  },
});

const fetchAsyncData = (dispatch, { topicId }) => dispatch(fetchFocalSetDefinitions(topicId));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      EditFocusContainer
    )
  )
);
