import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';
import FocusBuilderWizard from './builder/FocusBuilderWizard';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP, FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE, FOCAL_TECHNIQUE_MEDIA_SEARCH } from '../../../../lib/focalTechniques';
import { submitFocusUpdateOrCreate, setTopicNeedsNewSnapshot, createRetweetFocalSet, createTopCountriesFocalSet, createNytThemeFocalSet, createMediaTypeFocalSet } from '../../../../actions/topicActions';
import { LEVEL_ERROR } from '../../../common/Notice';
import { updateFeedback, addNotice } from '../../../../actions/appActions';

const DEFAULT_SELECTED_NUMBER = 5;

const localMessages = {
  booleanFocusSaved: { id: 'focus.create.booleanSaved', defaultMessage: 'We saved your new Subtopic.' },
  retweetFocusSaved: { id: 'focus.create.retweetSaved', defaultMessage: 'We created a new set of Subtopics based on our partisan retweet measure.' },
  focusNotSaved: { id: 'focus.create.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
  invalid: { id: 'focus.create.invalid', defaultMessage: 'Sorry - the data has an unknown subtopic technique. It failed!' },
  duplicateName: { id: 'focus.create.invalid', defaultMessage: 'Duplicate name. Choose a unique focal set name.' },
  topCountriesFocusSaved: { id: 'focus.create.booleanSaved', defaultMessage: 'We created a new subtopics by top countries.' },
  nytFocusSaved: { id: 'focus.create.booleanSaved', defaultMessage: 'We created a new subtopics with NYT Themes tags.' },
  mediaTypeFocusSaved: { id: 'focus.create.mediaType.saved', defaultMessage: 'We created a new subtopics with Media Type tags.' },
};

const CreateFocusContainer = (props) => {
  const { topicId, location, handleDone } = props;
  const { focalSetDefId, focalTechnique } = props.location.query;
  const initialValues = { numberSelected: DEFAULT_SELECTED_NUMBER };
  if (focalTechnique !== undefined) {
    initialValues.focalTechnique = focalTechnique;
  } else {
    initialValues.focalTechnique = FOCAL_TECHNIQUE_BOOLEAN_QUERY;
  }
  // if there aren't any focal set defs, the user should have to create a new one
  if (focalSetDefId !== undefined) {
    initialValues.focalSetDefinitionId = parseInt(focalSetDefId, 10);
  }
  return (
    <FocusBuilderWizard
      topicId={topicId}
      startStep={focalTechnique ? 1 : 0}
      initialValues={initialValues}
      location={location}
      onDone={handleDone}
    />
  );
};

CreateFocusContainer.propTypes = {
  // from dispatch
  submitDone: PropTypes.func.isRequired,
  handleDone: PropTypes.func.isRequired,
  // from state
  formData: PropTypes.object,
  // from context:
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  topCountries: state.topics.selected.focalSets.create.topCountriesStoryCounts.story_counts,
  topThemes: state.topics.selected.focalSets.create.nytThemeStoryCounts.story_counts,
  mediaType: state.topics.selected.focalSets.create.mediaTypeStoryCounts.story_counts,
  focalSetDefinitions: state.topics.selected.focalSets.definitions.list,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitDone: (topicId, formValues, queryData) => {
    let saveData = { ...formValues };
    const nameAlreadyExists = queryData.focalSetDefinitions.filter(fc => fc.name === formValues.focalSetName);
    if (nameAlreadyExists.length > 0) {
      return dispatch(addNotice({ level: LEVEL_ERROR, message: ownProps.intl.formatMessage(localMessages.duplicateName) }));
    }
    switch (formValues.focalTechnique) {
      case FOCAL_TECHNIQUE_MEDIA_SEARCH:
      case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
        let collections = [];
        let sources = [];
        if (formValues.media) {
          // if there are media options on the form (ie. a MEDIA_SEARCH) then respect them
          collections = formValues.media.filter(obj => obj.tags_id).map(s => s.tags_id);
          sources = formValues.media.filter(obj => obj.media_id).map(s => s.media_id);
        }
        saveData['collections[]'] = collections;
        saveData['sources[]'] = sources;
        return dispatch(submitFocusUpdateOrCreate(topicId, saveData))
          .then((results) => {
            if (results.length === 1) {
              const focusSavedMessage = ownProps.intl.formatMessage(localMessages.booleanFocusSaved);
              dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
              dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
              dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
              dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
            } else {
              const focusNoteSavedMessage = ownProps.intl.formatMessage(localMessages.focusNotSaved);
              dispatch(updateFeedback({ open: true, message: focusNoteSavedMessage })); // user feedback
            }
          });
      case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP:
        return dispatch(createRetweetFocalSet(topicId, formValues))
          .then(() => {
            const focusSavedMessage = ownProps.intl.formatMessage(localMessages.retweetFocusSaved);
            dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
            dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
            dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
            dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
          });
      case FOCAL_TECHNIQUE_TOP_COUNTRIES:
        saveData = { ...formValues, data: queryData.topCountries.map(c => ({ tags_id: c.tags_id, label: c.label })) };
        return dispatch(createTopCountriesFocalSet(topicId, saveData))
          .then(() => {
            const focusSavedMessage = ownProps.intl.formatMessage(localMessages.topCountriesFocusSaved);
            dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
            dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
            dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
            dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
          });
      case FOCAL_TECHNIQUE_NYT_THEME:
        saveData = { ...formValues, data: queryData.topThemes.map(c => ({ tags_id: c.tags_id, label: c.label })) };
        return dispatch(createNytThemeFocalSet(topicId, saveData))
          .then(() => {
            const focusSavedMessage = ownProps.intl.formatMessage(localMessages.nytFocusSaved);
            dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
            dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
            dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
            dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
          });
      case FOCAL_TECHNIQUE_MEDIA_TYPE:
        saveData = { ...formValues };
        return dispatch(createMediaTypeFocalSet(topicId, saveData))
          .then(() => {
            const focusSavedMessage = ownProps.intl.formatMessage(localMessages.mediaTypeFocusSaved);
            dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
            dispatch(updateFeedback({ classes: 'info-notice', open: true, message: focusSavedMessage })); // user feedback
            dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
            dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
          });
      default:
        return dispatch(addNotice({ level: LEVEL_ERROR, message: ownProps.intl.formatMessage(localMessages.invalid) }));
    }
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps, ...dispatchProps, ...ownProps, handleDone: (topicId, formValues) => dispatchProps.submitDone(topicId, formValues, stateProps) };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    CreateFocusContainer
  )
);
