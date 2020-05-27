import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedMessage } from 'react-intl';
import { filteredLinkTo } from '../../util/location';
import TopicSeedDetailsForm from './TopicSeedDetailsForm';
import { updateFeedback } from '../../../actions/appActions';
import { updateTopicSettings } from '../../../actions/topicActions';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import TopicPageTitle from '../TopicPageTitle';
import AppButton from '../../common/AppButton';
import messages from '../../../resources/messages';
import VersionComparisonContainer from '../versions/VersionComparisonContainer';


const localMessages = {
  title: { id: 'topic.edit', defaultMessage: 'Edit Topic Dates / Spidering' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We saved your changes' },
  failed: { id: 'topic.edit.save.failed', defaultMessage: 'Sorry, that didn\'t work!' },
};

const EditTopicDataOptionsContainer = (props) => {
  const { topic, handleSubmit, pristine, submitting, onSubmit, datesOrSpideringHaveChanged } = props;
  const initialValues = { ...topic };
  return (
    <div className="topic-edit-form">
      <TopicPageTitle value={localMessages.title} />
      <form name="topicForm" onSubmit={handleSubmit(onSubmit.bind(this))}>
        <Grid>
          {datesOrSpideringHaveChanged && <VersionComparisonContainer />}
          <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
            <Row>
              <Col lg={12}>
                <h1><FormattedMessage {...localMessages.title} /></h1>
              </Col>
            </Row>
            <TopicSeedDetailsForm
              initialValues={initialValues}
              form="topicForm"
            />
            <Row>
              <Col lg={12}>
                <AppButton
                  style={{ marginTop: 30 }}
                  type="submit"
                  disabled={pristine || submitting === true}
                  label={messages.save}
                  primary
                />
              </Col>
            </Row>
          </Permissioned>
        </Grid>
      </form>
    </div>
  );
};

EditTopicDataOptionsContainer.propTypes = {
  // from context
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  params: PropTypes.object,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  // from state
  topic: PropTypes.object,
  // from dispatch/merge
  onSubmit: PropTypes.func.isRequired,
  datesOrSpideringHaveChanged: PropTypes.bool,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
  datesOrSpideringHaveChanged: state.topics.selected.info.datesOrSpideringHaveChanged,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: (values, filters) => {
    const infoToSave = { ...values };
    return dispatch(updateTopicSettings(ownProps.params.topicId, infoToSave))
      .then((results) => {
        if (results.topics_id) {
          // let them know it worked
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          const topicSummaryUrl = filteredLinkTo(`/topics/${results.topics_id}/new-version`, filters);
          dispatch(push(topicSummaryUrl));
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
        }
      });
  },
});


const reduxFormConfig = {
  form: 'topicForm',
};

export default
injectIntl(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps, mapDispatchToProps)(
      EditTopicDataOptionsContainer
    )
  )
);
