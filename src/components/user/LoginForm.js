import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { loginWithPassword } from '../../actions/userActions';
// import { addNotice } from '../../actions/appActions';
import AppButton from '../common/AppButton';
import * as fetchConstants from '../../lib/fetchConstants';
import messages from '../../resources/messages';
import { emptyString, invalidEmail } from '../../lib/formValidators';
import withIntlForm from '../common/hocs/IntlForm';
import { addNotice } from '../../actions/appActions';
import { LEVEL_ERROR } from '../common/Notice';

const localMessages = {
  missingEmail: { id: 'user.missingEmail', defaultMessage: 'You need to enter your email address.' },
  missingPassword: { id: 'user.missingPassword', defaultMessage: 'You need to enter your password.' },
  loginFailed: { id: 'user.loginFailed', defaultMessage: 'Your email or password was wrong.' },
  signUpNow: { id: 'user.signUpNow', defaultMessage: 'No account? Register now!' },
  forgotPassword: { id: 'user.forgotPassword', defaultMessage: 'Forgot Your Password?' },
  needsToActivate: { id: 'user.needsToActivate', defaultMessage: 'You still need to activate your account. Check out email and click the link we sent you, or <a href="/#/user/resend-activation">send the link again</a> if you didn\'t get it.' },
};

const LoginForm = (props) => {
  const { handleSubmit, onSubmitLoginForm, fetchStatus, renderTextField } = props;
  const { formatMessage } = props.intl;
  return (
    <form onSubmit={handleSubmit(onSubmitLoginForm.bind(this))} className="app-form login-form">
      <Row>
        <Col lg={12}>
          <Field
            name="email"
            component={renderTextField}
            label={messages.userEmail}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="password"
            type="password"
            component={renderTextField}
            label={messages.userPassword}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <AppButton
            type="submit"
            label={formatMessage(messages.userLogin)}
            primary
            disabled={fetchStatus === fetchConstants.FETCH_ONGOING}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Link to="/user/signup">
            <AppButton
              variant="outlined"
              label={formatMessage(localMessages.signUpNow)}
            />
          </Link>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Link to="/user/request-password-reset">
            <AppButton
              variant="outlined"
              label={formatMessage(localMessages.forgotPassword)}
            />
          </Link>
        </Col>
      </Row>
    </form>
  );
};

LoginForm.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  redirect: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  // from dispatch
  onSubmitLoginForm: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.user.fetchStatus,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmitLoginForm: (values) => {
    dispatch(loginWithPassword(values.email, values.password))
    .then((response) => {
      if (response.key) {
        // redirect to destination if there is one
        const loc = ownProps.location;
        let redirect;
        if (ownProps.redirect) {
          redirect = ownProps.redirect;
        } else {
          redirect = (loc && loc.state && loc.state.nextPathname) ? loc.state.nextPathname : '';
        }
        if (redirect) {
          dispatch(push(redirect));
        }
      } else if ((response.message) && (response.message.includes('is not active'))) {
        // user has signed up, but not activated their account
        dispatch(addNotice({ htmlMessage: ownProps.intl.formatMessage(localMessages.needsToActivate), level: LEVEL_ERROR }));
      } else if (response.status) {
        dispatch(addNotice({ message: localMessages.loginFailed, level: LEVEL_ERROR }));
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
  if (emptyString(values.password)) {
    errors.password = localMessages.missingPassword;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'login',
  validate,
};

export default
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        LoginForm
      )
    )
  );
