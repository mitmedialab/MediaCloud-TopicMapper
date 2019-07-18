import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import withIntlForm from '../../common/hocs/IntlForm';
import TopicForm, { TOPIC_FORM_MODE_EDIT } from './TopicForm';
import { fetchSystemUser } from '../../../actions/systemActions';
import messages from '../../../resources/messages';
import { getCurrentDate, getMomentDateSubtraction } from '../../../lib/dateUtil';
import { MAX_RECOMMENDED_STORIES } from '../../../lib/formValidators';

const localMessages = {
  addCollectionsTitle: { id: 'topic.create.addCollectionsTitle', defaultMessage: 'Select Sources And Collections' },
  addCollectionsIntro: { id: 'topic.create.addCollectionsIntro', defaultMessage: 'The following are the Sources and Collections associated with this topic:' },
  sourceCollectionsError: { id: 'topic.create.form.detail.sourcesCollections.error', defaultMessage: 'You must select at least one Source or one Collection to seed this topic.' },
};

const formSelector = formValueSelector('topicForm');

const TopicConfigureContainer = (props) => {
  const { onStepChange, handleMediaChange, handleMediaDelete, formData, maxStories, currentStepText, mode, topicInfo } = props;
  const { formatMessage } = props.intl;
  const endDate = getCurrentDate();
  const startDate = getMomentDateSubtraction(endDate, 3, 'months');
  const sAndC = (formData && formData.sourcesAndCollections) || [];
  let initialValues = { start_date: startDate, end_date: endDate, max_iterations: 15, max_topic_stories: maxStories, buttonLabel: formatMessage(messages.preview), sourcesAndCollections: sAndC };

  if (mode === TOPIC_FORM_MODE_EDIT) {
    const sources = topicInfo.media ? topicInfo.media.map(t => ({ ...t })) : [];
    const collections = topicInfo.media_tags ? topicInfo.media_tags.map(t => ({ ...t, name: t.label })) : [];
    const sourcesAndCollections = sources.concat(collections);
    initialValues = {
      ...topicInfo,
      sourcesAndCollections,
      buttonLabel: formatMessage(messages.preview),
    };
  }

  return (
    <Grid>
      <Row>
        <Col lg={10}>
          <h1 dangerouslySetInnerHTML={{ __html: currentStepText.title }} />
          <p dangerouslySetInnerHTML={{ __html: currentStepText.description }} />
        </Col>
      </Row>
      <TopicForm
        initialValues={initialValues}
        onSubmit={() => onStepChange(mode, 1)}
        title={formatMessage(localMessages.addCollectionsTitle)}
        intro={formatMessage(localMessages.addCollectionsIntro)}
        mode={mode}
        onMediaChange={handleMediaChange}
        onMediaDelete={handleMediaDelete}
      />
    </Grid>
  );
};

TopicConfigureContainer.propTypes = {
  // from parent
  location: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  currentStep: PropTypes.number,
  currentStepText: PropTypes.object,
  mode: PropTypes.string.isRequired,
  topicInfo: PropTypes.object,
  onStepChange: PropTypes.func.isRequired,
  // form composition
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  // from state
  formData: PropTypes.object,
  user: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
  maxStories: PropTypes.number,
  // from dispatch
  handleMediaChange: PropTypes.func.isRequired,
  handleMediaDelete: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: formSelector(state, 'solr_seed_query', 'start_date', 'end_date', 'sourcesAndCollections'),
  user: state.user,
  fetchStatus: state.system.users.userDetails.fetchStatus,
  maxStories: state.system.users.userDetails.user ? state.system.users.userDetails.user.max_topic_stories : MAX_RECOMMENDED_STORIES,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleMediaChange: (sourceAndCollections) => {
    // take selections from mediaPicker and push them back into topicForm
    const updatedSources = sourceAndCollections.filter(m => m.type === 'source' || m.media_id);
    const updatedCollections = sourceAndCollections.filter(m => m.type === 'collection' || m.tags_id);
    const selectedMedia = updatedCollections.concat(updatedSources);

    ownProps.change('sourcesAndCollections', selectedMedia); // redux-form change action
  },
  handleMediaDelete: () => null, // in create mode we don't need to update the values
});

const reduxFormConfig = {
  form: 'topicForm',
  destroyOnUnmount: false, // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
};

// gotta fetch the user info here to make sure we have the `maxStories` configured on them
const fetchAsyncData = (dispatch, { user }) => dispatch(fetchSystemUser(user.profile.auth_users_id));

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        withAsyncData(fetchAsyncData)(
          TopicConfigureContainer
        )
      )
    )
  )
);
