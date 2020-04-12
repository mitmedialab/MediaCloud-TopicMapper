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
  seedQuery: { id: 'topic.form.detail.seedQuery', defaultMessage: 'Seed Query' },
  seedQueryDescription: { id: 'topic.form.detail.seedQuery.about', defaultMessage: 'Enter a boolean query to select stories that will seed the Topic.  Links in stories already in our database that match this query will be followed to find more stories that might not be in our database already.' },
  startDate: { id: 'topic.form.detail.startDate', defaultMessage: 'Start Date (inclusive)' },
  endDate: { id: 'topic.form.detail.endDate', defaultMessage: 'End Date (inclusive)' },
};

const TopicSeedDetailsForm = (props) => {
  const { renderTextField, renderSolrTextField, initialValues } = props;
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
          <label htmlFor="solr_seed_query"><FormattedMessage {...localMessages.seedQuery} /></label>
          <Field
            className="query-field"
            name="solr_seed_query"
            component={renderSolrTextField}
            multiline
            rows={2}
            rowsMax={4}
            fullWidth
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
  renderSolrTextField: PropTypes.func.isRequired,
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
