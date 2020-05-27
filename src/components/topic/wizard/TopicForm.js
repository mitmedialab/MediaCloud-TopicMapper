import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../common/AppButton';
import withIntlForm from '../../common/hocs/IntlForm';
import TopicCreateForm from './TopicCreateForm';
import TopicSeedDetailsForm from './TopicSeedDetailsForm';
import { emptyString, invalidDate, validDate } from '../../../lib/formValidators';
import { isStartDateAfterEndDate, isValidSolrDate } from '../../../lib/dateUtil';
import { fetchTopicWithNameExists } from '../../../actions/topicActions';
import { assetUrl } from '../../../lib/assetUtil';

export const TOPIC_FORM_MODE_CREATE = 'create';
export const TOPIC_FORM_MODE_EDIT = 'update';

const localMessages = {
  nameError: { id: 'topic.form.detail.name.error', defaultMessage: 'Your topic needs a name.' },
  nameInUseError: { id: 'topic.form.detail.name.errorInUse', defaultMessage: 'That topic name is already taken. Please use a different one.' },
  descriptionError: { id: 'topic.form.detail.desciption.error', defaultMessage: 'Your topic need a description.' },
  seedQueryError: { id: 'topic.form.detail.seedQuery.error', defaultMessage: 'You must give us a seed query to start this topic form.' },
  createTopic: { id: 'topic.form.detail.create', defaultMessage: 'Create a New Topic' },
  dateError: { id: 'topic.form.detail.date.error', defaultMessage: 'Please provide a date in YYYY-MM-DD format.' },
  startDateWarning: { id: 'explorer.queryBuilder.warning.startDate', defaultMessage: 'Start Date must be before End Date' },
  sourceCollectionsError: { id: 'topic.form.detail.sourcesCollections.error', defaultMessage: 'You must select at least one Source or one Collection to seed this topic.' },
  downloadUserGuide: { id: 'topic.create.downloadUserGuide', defaultMessage: 'Downlod the Topic Creation Guide' },
  selectSandC: { id: 'topic.create.selectSAndC', defaultMessage: 'Select media' },
  SandC: { id: 'topic.create.sAndC', defaultMessage: 'Media' },
};

const TopicForm = (props) => {
  const { initialValues, topicId, onSubmit, handleSubmit, pristine, submitting, asyncValidating, mode } = props;
  const { formatMessage } = props.intl;
  let formContent = (
    <TopicCreateForm
      initialValues={initialValues}
      destroyOnUnmount={false}
      form="topicForm"
      forceUnregisterOnUnmount
      mode={mode}
    />
  );
  if (mode === TOPIC_FORM_MODE_EDIT) {
    // when editing a topic, you change the name and description in a different place (because they don't require a new version)
    formContent = (
      <TopicSeedDetailsForm
        destroyOnUnmount={false}
        form="topicForm"
        forceUnregisterOnUnmount
        defaultValue={initialValues}
        mode={mode}
      />
    );
  }
  return (
    <form className="create-topic" name="topicForm" onSubmit={handleSubmit(onSubmit.bind(this))}>
      <input type="hidden" name="topicId" value={topicId} />
      <Row>
        <Col lg={12}>
          <h1><FormattedMessage {...localMessages.createTopic} /></h1>
        </Col>
      </Row>
      <Row>
        <Col lg={10}>
          {formContent}
        </Col>
        <Col lg={2}>
          <a target="_new" href="http://bit.ly/creating-topics-guide">
            <figure className="document-download">
              <img alt={formatMessage(localMessages.downloadUserGuide)} src={assetUrl('/static/img/topic-mapper-user-guide.png')} height="160" />
              <figcaption><FormattedMessage {...localMessages.downloadUserGuide} /></figcaption>
            </figure>
          </a>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <AppButton
            style={{ marginTop: 30 }}
            type="submit"
            disabled={pristine || submitting || asyncValidating === true}
            label={initialValues.buttonLabel}
            primary
          />
        </Col>
      </Row>

    </form>
  );
};

TopicForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  // from parent
  topicId: PropTypes.number,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  error: PropTypes.string,
  asyncValidating: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]).isRequired,
  submitting: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  intro: PropTypes.string,
  validate: PropTypes.func.isRequired,
  topicNameSearch: PropTypes.object,
  mode: PropTypes.string,
  meta: PropTypes.object,
};

function validate(values, props) {
  const errors = {};
  const { formatMessage } = props.intl;
  if (emptyString(values.name)) {
    errors.name = localMessages.nameError;
  }
  if (emptyString(values.description)) {
    errors.description = localMessages.descriptionError;
  }
  if (invalidDate(values.start_date) || !isValidSolrDate(values.start_date)) {
    errors.start_date = localMessages.dateError;
  }
  if (invalidDate(values.end_date) || !isValidSolrDate(values.end_date)) {
    errors.end_date = localMessages.dateError;
  }
  if (validDate(values.start_date) && validDate(values.end_date) && isStartDateAfterEndDate(values.start_date, values.end_date)) {
    errors.start_date = { _error: formatMessage(localMessages.startDateWarning) };
  }
  return errors;
}

const asyncValidate = (values, dispatch) => (
  // verify topic name is unique
  dispatch(fetchTopicWithNameExists(values.name, values.topics_id))
    .then((results) => {
      if (results.nameInUse === true) {
        const error = { name: localMessages.nameInUseError }; // object
        throw error;
      }
    })
);

const reduxFormConfig = {
  form: 'topicForm',
  validate,
  asyncValidate,
  asyncBlurFields: ['name'],
  asyncChangeFields: ['name'],
  // so the create wizard works
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
};

export default
withIntlForm(
  reduxForm(reduxFormConfig)(
    TopicForm
  )
);
