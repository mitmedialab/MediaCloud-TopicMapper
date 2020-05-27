import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, Field, propTypes } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import TopicSeedDetailsForm from './TopicSeedDetailsForm';
// import TopicModeOption from './TopicModeOption';

const localMessages = {
  name: { id: 'topic.form.detail.name', defaultMessage: 'Topic Name (what is this about?)' },
  description: { id: 'topic.form.detail.description', defaultMessage: 'Description (why are you making this?)' },
};
const TopicCreateForm = ({ renderTextField, initialValues, intl }) => (
  <div>
    <Row>
      <Col lg={4}>
        <Field
          name="name"
          component={renderTextField}
          fullWidth
          label={intl.formatMessage(localMessages.name)}
        />
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <Field
          name="description"
          component={renderTextField}
          fullWidth
          label={intl.formatMessage(localMessages.description)}
        />
      </Col>
    </Row>
    <TopicSeedDetailsForm
      initialValues={initialValues}
      destroyOnUnmount={false}
      form="topicForm"
      forceUnregisterOnUnmount
    />
  </div>
);

TopicCreateForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderRadio: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  // from parent
  initialValues: PropTypes.object,
};

export default
withIntlForm(
  reduxForm({ propTypes })(
    TopicCreateForm
  ),
);
