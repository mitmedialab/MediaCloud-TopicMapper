import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, propTypes } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';
import TopicAdvancedForm from './TopicAdvancedForm';
import messages from '../../../resources/messages';

const localMessages = {
  basics: { id: 'topic.form.section.basics', defaultMessage: 'Seed Query Details' },
  name: { id: 'topic.form.detail.name', defaultMessage: 'Topic Name (what is this about?)' },
  nameError: { id: 'topic.form.detail.name.error', defaultMessage: 'Your topic needs a short dsecriptive name.' },
  advancedSettings: { id: 'topic.form.detail.advancedSettings', defaultMessage: 'Advanced Settings' },
  description: { id: 'topic.form.detail.description', defaultMessage: 'Description (why are you making this?)' },
  descriptionError: { id: 'topic.form.detail.desciption.error', defaultMessage: 'Your topic need a description.' },
  seedQuery: { id: 'topic.form.detail.seedQuery', defaultMessage: 'Seed Query' },
  seedQueryError: { id: 'topic.form.detail.seedQuery.error', defaultMessage: 'You must give us a seed query to start this topic from.' },
  seedQueryDescription: { id: 'topic.form.detail.seedQuery.about', defaultMessage: 'Enter a boolean query to select stories that will seed the Topic.  Links in stories already in our database that match this query will be followed to find more stories that might not be in our database already.' },
  queryEditWarning: { id: 'topic.form.detal.query.edit.warning', defaultMessage: '<b>Be careful!</b> If you plan to edit the query and make a new snapshot make sure you only increase the scope of the query.  If you reduce the scope there will be stories from previous snapshots included that don\'t match your new reduced query.' },
  startDate: { id: 'topic.form.detail.startDate', defaultMessage: 'Start Date (inclusive)' },
  endDate: { id: 'topic.form.detail.endDate', defaultMessage: 'End Date (inclusive)' },
  public: { id: 'topic.form.detail.public', defaultMessage: 'Public?' },
  logogram: { id: 'topic.form.detail.logogram', defaultMessage: 'Content in a Logographic Language? (ie. Chinese or Japanese Kanji?)' },
  createTopic: { id: 'topic.form.detail.create', defaultMessage: 'Create' },
  dateError: { id: 'topic.form.detail.date.error', defaultMessage: 'Please provide a date in YYYY-MM-DD format.' },
};

const TopicSeedDetailsForm = (props) => {
  const { renderTextField, initialValues } = props;
  const { formatMessage } = props.intl;
  return (
    <div>
      <Row>
        <Col lg={12}>
          <h2><FormattedMessage {...localMessages.basics} /></h2>
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="start_date"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(localMessages.startDate)}
          />
        </Col>
        <Col lg={6}>
          <Field
            name="end_date"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(localMessages.endDate)}
            helpertext={formatMessage(localMessages.endDate)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="solr_seed_query"
            component={renderTextField}
            multiline
            rows={2}
            rowsMax={4}
            fullWidth
            label={formatMessage(localMessages.seedQuery)}
            helpertext={formatMessage(localMessages.seedQueryError)}
          />
          <small>
            <b><QueryHelpDialog trigger={formatMessage(messages.queryHelpLink)} /></b>
            <FormattedMessage {...localMessages.seedQueryDescription} />
          </small>
        </Col>
      </Row>
      <TopicAdvancedForm
        initialValues={initialValues}
        destroyOnUnmount={false}
        form="topicForm"
        forceUnregisterOnUnmount
      />
    </div>
  );
};

TopicSeedDetailsForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  // from parent
  initialValues: PropTypes.object,
};

export default
withIntlForm(
  reduxForm({ propTypes })(
    TopicSeedDetailsForm
  )
);
