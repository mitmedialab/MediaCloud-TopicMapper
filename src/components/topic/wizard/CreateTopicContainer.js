import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import { Grid } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchUserQueuedAndRunningTopics, createTopic } from '../../../actions/topicActions';
import { WarningNotice } from '../../common/Notice';
import { updateFeedback } from '../../../actions/appActions';
import { FETCH_SUCCEEDED } from '../../../lib/fetchConstants';
import PageTitle from '../../common/PageTitle';
import TopicForm from './TopicForm';
// import { formatTopicPreviewQuery } from '../../util/topicUtil';
import messages from '../../../resources/messages';
import { getCurrentDate, getMomentDateSubtraction } from '../../../lib/dateUtil';

const localMessages = {
  pageTitle: { id: 'topic.modify.pageTitle', defaultMessage: 'Step 1: Setup Your Topic' },
  pageDesc: { id: 'topic.modify.pageTitle', defaultMessage: 'You can try out your query in our <a href="https://explorer.mediacloud.org/">Explorer tool</a> before coming here to create a topic.' },
  cannotCreateTopic: { id: 'topic.modify.cannotCreateTopic', defaultMessage: 'You cannot create a new topic right now because you are currently running another topic.' },
  createTopic: { id: 'topic.create', defaultMessage: 'Create Topic' },
  creatingTitle: { id: 'topic.creating.title', defaultMessage: 'Please wait - we\'re creating your Topic now' },
  creatingDesc: { id: 'topic.creating.detail', defaultMessage: 'We are creating your topic now.  This can take a minute or so, just to make sure everyting is in order.  Once it is created, you\'ll be shown a page telling you we are gathering the stories.' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We created your topic!' },
  failed: { id: 'topic.edit.save.failed', defaultMessage: 'Sorry, that didn\'t work!' },

};

const CreateTopicContainer = (props) => {
  const endDate = getCurrentDate();
  const startDate = getMomentDateSubtraction(endDate, 3, 'months');
  const initialValues = {
    mode: 'web',
    start_date: startDate,
    end_date: endDate,
    buttonLabel: props.intl.formatMessage(messages.create),
    max_iterations: 15,
  };
  return (
    <Grid>
      <PageTitle value={localMessages.pageTitle} />
      {!props.allowedToRun && (
        <WarningNotice><FormattedHTMLMessage {...localMessages.cannotCreateTopic} /></WarningNotice>
      )}
      <TopicForm
        destroyOnUnmount={false}
        form="topicForm"
        forceUnregisterOnUnmount
        initialValues={initialValues}
        onSubmit={props.handleCreateEmptyTopic}
        title={props.intl.formatMessage(localMessages.pageTitle)}
      />
    </Grid>
  );
};

CreateTopicContainer.propTypes = {
  // from compositional chain
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  // from store
  allowedToRun: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  handleCreateEmptyTopic: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.isAdmin ? FETCH_SUCCEEDED : state.topics.modify.userRunningTopicStatus.fetchStatus,
  allowedToRun: state.topics.modify.userRunningTopicStatus.allowed, // non-admin users can only run one at a time
  isAdmin: state.user.isAdmin,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleCreateEmptyTopic: (values) => {
    const queryInfo = {
      name: values.name,
      description: values.description,
      start_date: values.start_date,
      end_date: values.end_date,
      solr_seed_query: null, // we don't create it here anymore values.solr_seed_query,
      max_iterations: values.max_iterations,
      ch_monitor_id: values.ch_monitor_id === undefined ? '' : values.ch_monitor_id,
      is_logogram: values.is_logogram ? 1 : 0,
      max_stories: values.max_topic_stories,
    };
    dispatch(createTopic(queryInfo))
      .then((results) => {
        if (results && results.topics_id) {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          return dispatch(push(`/topics/${results.topics_id}/summary`));
        }
        return dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
      });
  },
});
const fetchAsyncData = (dispatch, { isAdmin }) => {
  reset(); // reset form
  // non-admin users can only run one topic at a time
  if (!isAdmin) {
    dispatch(fetchUserQueuedAndRunningTopics());
  }
};

const reduxFormConfig = {
  form: 'topicForm',
  // destroyOnUnmount: false, // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
};

export default
injectIntl(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncData(fetchAsyncData)(
        CreateTopicContainer
      )
    )
  )
);
