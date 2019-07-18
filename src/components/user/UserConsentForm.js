import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import AppButton from '../common/AppButton';
import messages from '../../resources/messages';
import withIntlForm from '../common/hocs/IntlForm';

const localMessages = {
  request: { id: 'user.requestConsent', defaultMessage: 'I consent to these policies' },
  info: { id: 'user.requestConsent.info', defaultMessage: 'Media Cloud has a new Terms of Use and Privacy Policy detailing the data we collect about you and the reasons why, your rights to and about this data, and the proper uses of Media Cloud. In order to continue using the platform, please review these documents and click the box below to agree to them. If you do not agree, feel free to share your concerns at support@mediacloud.org.' },
  terms: { id: 'user.requestConsent.title', defaultMessage: 'Consent to Terms and Policy required.' },
  noConsent: { id: 'user.requestConsent.error', defaultMessage: 'We need you to consent to our policies.' },
};

const UserConsentForm = (props) => {
  const { handleSubmit, onSubmit, pristine, submitting, renderCheckbox } = props;
  const { formatMessage } = props.intl;
  return (
    <Grid>
      <form onSubmit={handleSubmit(onSubmit.bind(this))} className="app-form request-consent-form">
        <Row>
          <Col lg={12}>
            <h2><FormattedMessage {...localMessages.terms} /></h2>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <h3><FormattedMessage {...localMessages.info} /></h3>
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={12}>
            <Field
              fullWidth
              name="has_consented"
              component={renderCheckbox}
              label={messages.userConsent}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <AppButton
              type="submit"
              label={formatMessage(localMessages.request)}
              primary
              disabled={pristine || submitting}
            />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

UserConsentForm.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  // from state
  // from dispatch
  onSubmit: PropTypes.func.isRequired,
};

// in-browser validation callback
function validate(values) {
  const errors = {};
  if (!values.has_consented) {
    errors.has_consented = localMessages.noConsent;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'resend-activation-form',
  validate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect()(
        UserConsentForm
      )
    )
  )
);
