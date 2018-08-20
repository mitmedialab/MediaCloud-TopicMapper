import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { LEVEL_ERROR } from '../common/Notice';
import { sendRecoverPasswordRequest } from '../../actions/userActions';
import { addNotice } from '../../actions/appActions';
import AppButton from '../common/AppButton';
import messages from '../../resources/messages';
import { invalidEmail } from '../../lib/formValidators';
import withIntlForm from '../common/hocs/IntlForm';

const localMessages = {
  title: { id: 'user.forgotPassword.title', defaultMessage: 'Forgot Your Password?' },
  intro: { id: 'user.forgotPassword.intro', defaultMessage: 'Enter your email address and we will send you a link to reset your password.' },
  missingEmail: { id: 'user.missingEmail', defaultMessage: 'You need to enter a valid email address.' },
  mailMeALink: { id: 'user.forgotPassword.mailMeALink', defaultMessage: 'Send Password Reset Email' },
  failed: { id: 'user.recoverPassword.failed', defaultMessage: 'Sorry, something went wrong.' },
};

const RequestPasswordReset = (props) => {
  const { handleSubmit, onSubmitRecovery, pristine, renderTextField } = props;
  const { formatMessage } = props.intl;
  return (
    <Grid>
      <form onSubmit={handleSubmit(onSubmitRecovery.bind(this))} className="app-form request-password-reset-form">
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={12}>
            <Field
              fullWidth
              name="email"
              component={renderTextField}
              label={messages.userEmail}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <AppButton
              type="submit"
              label={formatMessage(localMessages.mailMeALink)}
              primary
              disabled={pristine}
            />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

RequestPasswordReset.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from state
  errorMessage: PropTypes.string,
  pristine: PropTypes.bool.isRequired,
  // from dispatch
  onSubmitRecovery: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.fetchStatus,
  errorMessage: state.user.errorMessage,
});

const mapDispatchToProps = dispatch => ({
  onSubmitRecovery: (values) => {
    dispatch(sendRecoverPasswordRequest(values))
    .then((response) => {
      if (response.success) {
        if (response.success === 1) {
          dispatch(push('/user/request-password-reset-success'));
        } else {
          dispatch(addNotice({ message: localMessages.failed, level: LEVEL_ERROR }));
        }
      }
    });
  },
});

// in-browser validation callback
function validate(values) {
  const errors = {};
  if (invalidEmail(values.email)) {
    errors.email = localMessages.missingEmail;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'requestPasswordReset',
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        connect(mapStateToProps, mapDispatchToProps)(
          RequestPasswordReset
        )
      )
    )
  );
