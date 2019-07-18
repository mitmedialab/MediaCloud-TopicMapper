import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { push } from 'react-router-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import LoadingSpinner from '../../common/LoadingSpinner';
import messages from '../../../resources/messages';
import { createTopic, updateTopicSeedQuery, topicSnapshotSpider, topicSnapshotCreate } from '../../../actions/topicActions';
import { updateFeedback, addNotice } from '../../../actions/appActions';
import AppButton from '../../common/AppButton';
import { LEVEL_ERROR, LEVEL_WARNING, WarningNotice } from '../../common/Notice';
import { MAX_RECOMMENDED_STORIES, MIN_RECOMMENDED_STORIES, WARNING_LIMIT_RECOMMENDED_STORIES } from '../../../lib/formValidators';
import { TOPIC_FORM_MODE_CREATE, TOPIC_FORM_MODE_EDIT } from './TopicForm';
import SeedQuerySummary from '../versions/SeedQuerySummary';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_ADMIN } from '../../../lib/auth';

const localMessages = {
  name: { id: 'topic.create.confirm.name', defaultMessage: 'Name' },
  description: { id: 'topic.create.confirm.description', defaultMessage: 'Description' },
  state: { id: 'topic.create.state', defaultMessage: 'Not yet saved.' },
  storyCount: { id: 'topic.create.story.count', defaultMessage: 'Seed Stories' },
  topicSaved: { id: 'topic.create.saved', defaultMessage: 'We saved your new Topic.' },
  topicNotSaved: { id: 'topic.create.notSaved', defaultMessage: 'That didn\'t work!' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We were able to {mode} your topic.' },
  failed: { id: 'topic.create.feedback', defaultMessage: 'Sorry, something went wrong.' },
  notEnoughStories: { id: 'topic.create.notenough', defaultMessage: "Sorry, we can't save this topic because you need a minimum of 500 seed stories." },
  tooManyStories: { id: 'topic.create.toomany', defaultMessage: "Sorry, we can't save this topic because you need to select less than 100,000 seed stories." },
  warningLimitStories: { id: 'topic.create.warningLimit', defaultMessage: 'Approaching story limit. Proceed with caution.' },
  createWithoutGenerating: { id: 'topic.create.withoutGenerating', defaultMessage: 'Create Without Generating' },
};

class TopicConfirmContainer extends React.Component {
  state = {
    submitted: false, // use this to make sure we don't flash the submit again before forwarding
  }

  finishStep = (formMode, startSpidering, values) => {
    const { storyCount, user, handleUpdateTopic, handleCreateTopic } = this.props;
    this.setState({ submitted: true });
    const updatedValues = { ...values, startSpidering };
    if (formMode === TOPIC_FORM_MODE_EDIT) {
      return handleUpdateTopic(storyCount, user, updatedValues);
    }
    return handleCreateTopic(storyCount, user, updatedValues);
  };

  render() {
    const { formValues, onStepChange, handleSubmit, pristine, selectedSnapshot, storyCount, submitting, currentStepText, mode, topicInfo } = this.props;
    const { formatMessage } = this.props.intl;
    let sourcesAndCollections = [];
    sourcesAndCollections = formValues.sourcesAndCollections.filter(s => s.media_id).map(s => s.media_id);
    sourcesAndCollections.concat(formValues.sourcesAndCollections.filter(s => s.tags_id).map(s => s.tags_id));
    let previousVersion = null;
    if (mode === TOPIC_FORM_MODE_EDIT) {
      previousVersion = (
        <React.Fragment>
          <Col lg={5}>
            <SeedQuerySummary topic={topicInfo} snapshot={selectedSnapshot} faded />
          </Col>
          <Col lg={2}>
            <span style={{ display: 'block', fontSize: '56px', marginTop: '120px', textAlign: 'center' }}>➡</span>
          </Col>
        </React.Fragment>
      );
    }
    const topicNewVersionContent = (
      <SeedQuerySummary topic={formValues} seedQueryCount={storyCount} />
    );
    if (submitting || this.state.submitted) {
      return (
        <Grid className="topic-container">
          <Row>
            {previousVersion}
            <Col lg={6}>
              <h2 dangerouslySetInnerHTML={{ __html: currentStepText.savingTitle }} />
              <p dangerouslySetInnerHTML={{ __html: currentStepText.savingDesc }} />
              <LoadingSpinner />
              {topicNewVersionContent}
            </Col>
          </Row>
        </Grid>
      );
    }
    // haven't submitted yet
    return (
      <form className="create-topic" name="topicForm">
        <Grid className="topic-container">
          <Row>
            <Col lg={12}>
              <h2 dangerouslySetInnerHTML={{ __html: currentStepText.title }} />
              <WarningNotice><FormattedMessage {...localMessages.state} /></WarningNotice>
            </Col>
          </Row>
          <Row>
            {previousVersion}
            <Col lg={5}>
              {topicNewVersionContent}
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <AppButton label={formatMessage(messages.previous)} onClick={() => onStepChange(mode, 2)} />
              &nbsp; &nbsp;
              { // if creating and a admin, they can create an empty one to let them work on subtopics before generating
                (mode === TOPIC_FORM_MODE_CREATE) && (
                <Permissioned onlyRole={PERMISSION_ADMIN}>
                  <AppButton
                    type="submit"
                    disabled={pristine || submitting}
                    label={localMessages.createWithoutGenerating}
                    onClick={handleSubmit(values => this.finishStep(mode, false, values))}
                  />
                  &nbsp; &nbsp;
                </Permissioned>
                )}
              <AppButton
                disabled={pristine || submitting}
                label={currentStepText.saveTopic}
                onClick={handleSubmit(values => this.finishStep(mode, true, values))}
                primary
              />
            </Col>
          </Row>
        </Grid>
      </form>
    );
  }
}

TopicConfirmContainer.propTypes = {
  // from parent
  initialValues: PropTypes.object,
  currentStepText: PropTypes.object,
  mode: PropTypes.string.isRequired,
  topicInfo: PropTypes.object,
  onStepChange: PropTypes.func.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
  handleCreateTopic: PropTypes.func.isRequired,
  handleUpdateTopic: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  // from state
  user: PropTypes.object.isRequired,
  formValues: PropTypes.object.isRequired,
  selectedSnapshot: PropTypes.object,
  // from dispatch
  storyCount: PropTypes.number,
};

const mapStateToProps = state => ({
  formValues: state.form.topicForm.values,
  storyCount: state.topics.modify.preview.matchingStoryCounts.count,
  user: state.user,
  selectedSnapshot: state.topics.selected ? state.topics.selected.snapshots.selected : null,
});

export const createNewSpideredVersion = (topicId, dispatch, formatMessage) => {
  dispatch(topicSnapshotSpider(topicId))
    .then((spiderResults) => {
      if (spiderResults && spiderResults.topics_id) { // let them know it worked
        dispatch(updateFeedback({ classes: 'info-notice', open: true, message: formatMessage(localMessages.feedback, { mode: TOPIC_FORM_MODE_EDIT }) }));
        return dispatch(push(`/topics/${spiderResults.topics_id}/versions`));
      }
      return dispatch(updateFeedback({ open: true, message: formatMessage(localMessages.failed) }));
    });
};

const finishTopic = (results, dispatch, intl, startSpidering) => {
  // We start a new spider for new version
  if (results.topics_id && startSpidering) {
    createNewSpideredVersion(results.topics_id, dispatch, intl.formatMessage);
  } else if (results.topics_id) {
    // they selected the option to leave it empty so they can add more subtopics to it
    dispatch(topicSnapshotCreate(results.topics_id))
      .then((createResults) => {
        if (createResults && createResults.topics_id) {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: intl.formatMessage(localMessages.feedback, { mode: TOPIC_FORM_MODE_EDIT }) }));
          return dispatch(push(`/topics/${results.topics_id}/versions`));
        }
        return dispatch(updateFeedback({ open: true, message: intl.formatMessage(localMessages.failed) }));
      });
  } else {
    return dispatch(updateFeedback({ open: true, message: intl.formatMessage(localMessages.failed) }));
  }
  return null;
};

const fireNotices = (dispatch, storyCount, intl) => {
  // min/max don't apply to admins
  if (storyCount > WARNING_LIMIT_RECOMMENDED_STORIES && storyCount < MAX_RECOMMENDED_STORIES) {
    dispatch(updateFeedback({ classes: 'warning-notice', open: true, message: intl.formatMessage(localMessages.warningLimitStories) }));
    return dispatch(addNotice({ level: LEVEL_WARNING, message: intl.formatMessage(localMessages.warningLimitStories) }));
  }
  if (storyCount > MAX_RECOMMENDED_STORIES) {
    dispatch(updateFeedback({ classes: 'error-notice', open: true, message: intl.formatMessage(localMessages.tooManyStories) }));
    return dispatch(addNotice({ level: LEVEL_ERROR, message: intl.formatMessage(localMessages.tooManyStories) }));
  }
  if (storyCount < MIN_RECOMMENDED_STORIES) {
    dispatch(updateFeedback({ classes: 'error-notice', open: true, message: intl.formatMessage(localMessages.notEnoughStories) }));
    return dispatch(addNotice({ level: LEVEL_ERROR, message: intl.formatMessage(localMessages.notEnoughStories) }));
  }
  return null;
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleCreateTopic: (storyCount, user, values) => {
    if (((storyCount > MIN_RECOMMENDED_STORIES) && (storyCount < MAX_RECOMMENDED_STORIES))
      || user.isAdmin) { // min/max limits dont apply to admin users
      // all good, so submit!
      const queryInfo = {
        name: values.name,
        description: values.description,
        start_date: values.start_date,
        end_date: values.end_date,
        solr_seed_query: values.solr_seed_query,
        max_iterations: values.max_iterations,
        ch_monitor_id: values.ch_monitor_id === undefined ? '' : values.ch_monitor_id,
        is_public: values.is_public ? 1 : 0,
        is_logogram: values.is_logogram ? 1 : 0,
        max_stories: values.max_topic_stories,
      };
      queryInfo.is_public = queryInfo.is_public ? 1 : 0;
      if ('sourcesAndCollections' in values) {
        queryInfo['sources[]'] = values.sourcesAndCollections.filter(s => s.media_id).map(s => s.media_id);
        queryInfo['collections[]'] = values.sourcesAndCollections.filter(s => s.tags_id).map(s => s.tags_id);
      } else {
        queryInfo['sources[]'] = '';
        queryInfo['collections[]'] = '';
      }
      return dispatch(createTopic(queryInfo))
        .then(results => finishTopic(results, dispatch, ownProps.intl, values.startSpidering));
    }
    if (!user.isAdmin) {
      return fireNotices(dispatch, storyCount, ownProps.intl);
    }
    return null;
  },
  handleUpdateTopic: (storyCount, user, values) => {
    if (((storyCount > MIN_RECOMMENDED_STORIES) && (storyCount < MAX_RECOMMENDED_STORIES))
      || user.isAdmin) { // min/max limits dont apply to admin users
      // figure out the new seed query values
      const queryInfo = {
        topics_id: values.topics_id,
        name: values.name,
        description: values.description,
        start_date: values.start_date,
        end_date: values.end_date,
        solr_seed_query: values.solr_seed_query,
        max_iterations: values.max_iterations,
        ch_monitor_id: values.ch_monitor_id === undefined ? '' : values.ch_monitor_id,
        is_public: values.is_public ? 1 : 0,
        is_logogram: values.is_logogram ? 1 : 0,
        max_stories: values.max_topic_stories,
      };
      queryInfo.is_public = queryInfo.is_public ? 1 : 0;
      if ('sourcesAndCollections' in values) {
        queryInfo['sources[]'] = values.sourcesAndCollections.filter(s => s.media_id).map(s => s.media_id);
        queryInfo['collections[]'] = values.sourcesAndCollections.filter(s => s.tags_id).map(s => s.tags_id);
      } else {
        queryInfo['sources[]'] = '';
        queryInfo['collections[]'] = '';
      }
      return dispatch(updateTopicSeedQuery(queryInfo.topics_id, { ...queryInfo }))
        .then(results => finishTopic(results, dispatch, ownProps.intl, values.startSpidering));
    }
    if (!user.isAdmin) {
      return fireNotices(dispatch, storyCount, ownProps.intl);
    }
    return null;
  },
});

const reduxFormConfig = {
  form: 'topicForm',
  destroyOnUnmount: false, // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
};

export default
withIntlForm(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps, mapDispatchToProps)(
      TopicConfirmContainer
    )
  )
);
