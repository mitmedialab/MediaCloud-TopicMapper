import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedMessage } from 'react-intl';
import { filteredLinkTo } from '../../util/location';
import messages from '../../../resources/messages';
import { updateTopicSettings } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import BackLinkingControlBar from '../BackLinkingControlBar';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import TopicSettingsForm from './TopicSettingsForm';
import TopicPageTitle from '../TopicPageTitle';

const localMessages = {
  title: { id: 'topic.edit', defaultMessage: 'Edit Topic Settings' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We saved your changes' },
  failed: { id: 'topic.edit.save.failed', defaultMessage: 'Sorry, that didn\'t work!' },
};

const EditTopicSettingsContainer = (props) => {
  const { topic, filters, reallyHandleSave } = props;
  const { formatMessage } = props.intl;
  const initialValues = { ...topic, buttonLabel: formatMessage(messages.save) };
  return (
    <div className="topic-edit-form">
      <TopicPageTitle value={localMessages.title} />
      <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topic.topics_id}/summary`} />
      <Grid>
        <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.title} /></h1>
            </Col>
          </Row>
          <TopicSettingsForm
            topicId={topic.topics_id}
            initialValues={initialValues}
            onSubmit={values => reallyHandleSave(values, filters)}
            enableReinitialize
            destroyOnUnmount
          />
        </Permissioned>
      </Grid>
    </div>
  );
};

EditTopicSettingsContainer.propTypes = {
  // from context
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  params: PropTypes.object,
  // from state
  timespan: PropTypes.object,
  filters: PropTypes.object.isRequired,
  topic: PropTypes.object,
  // from dispatch/merge
  reallyHandleSave: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  fetchStatus: state.topics.selected.info.fetchStatus,
  fetchStatusInfo: state.topics.selected.info.fetchStatus,
  topic: state.topics.selected.info,
  timespan: state.topics.selected.timespans.selected,
  snapshots: state.topics.selected.snapshots.list,
  user: state.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  reallyHandleSave: (values, filters) => {
    const infoToSave = { ...values }; // TODO: what of settings vs. query updates?
    infoToSave.is_logogram = infoToSave.is_logogram ? 1 : 0;
    infoToSave.ch_monitor_id = values.ch_monitor_id ? values.ch_monitor_id : '';
    return dispatch(updateTopicSettings(ownProps.params.topicId, infoToSave))
      .then((results) => {
        if (results.topics_id) {
          // let them know it worked
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          // redirect back to topic summary
          const topicSummaryUrl = filteredLinkTo(`/topics/${results.topics_id}/summary`, filters);
          dispatch(push(topicSummaryUrl));
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
        }
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    EditTopicSettingsContainer
  )
);
