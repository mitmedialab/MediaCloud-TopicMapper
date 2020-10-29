import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';

const localMessages = {
  projectId: { id: 'twitter.bw.projectId', defaultMessage: 'Project ID' },
  queryId: { id: 'twitter.bw.queryId', defaultMessage: 'Query ID' },
};

const EditProjectQueryForm = ({ renderTextField, onEnterKey, intl }) => (
  <>
    <Row>
      <Col lg={4} md={6} xs={12}>
        <label><FormattedHTMLMessage {...localMessages.projectId} /></label>
        <Field
          name="project"
          component={renderTextField}
          fullWidth
          onKeyDown={onEnterKey}
          placeholder={intl.formatMessage(localMessages.projectId)}
        />
      </Col>
      <Col lg={4} md={6} xs={12}>
        <label><FormattedHTMLMessage {...localMessages.queryId} /></label>
        <Field
          name="query"
          component={renderTextField}
          fullWidth
          onKeyDown={onEnterKey}
          placeholder={intl.formatMessage(localMessages.queryId)}
        />
      </Col>
    </Row>
  </>
);

EditProjectQueryForm.propTypes = {
  // from parent
  onEnterKey: PropTypes.func,
  initialValues: PropTypes.object,
  // from dispatch
  onFormChange: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      EditProjectQueryForm
    )
  )
);
