import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  click: { id: 'error.cantLoad', defaultMessage: 'Click the link we just emailed you' },
  emailCheck: { id: 'error.tryAgain', defaultMessage: 'Thanks for signing up for Media Cloud. To make sure your email is valid, we have sent you a message with a magic link for you to click.  Click the link in the email to confirm that we got your email right and activate your account.' },
  sendAgain: { id: 'error.sendAgain', defaultMessage: 'Didn\'t get the email? Sorry! Click here to send the email again' },
};

const SignupSuccessMessage = () => (
  <div className="signup-confirm">
    <Grid>
      <Row>
        <Col lg={12}>
          <h1><FormattedMessage {...localMessages.click} /></h1>
          <p><FormattedMessage {...localMessages.emailCheck} /></p>
          <p><Link to="/user/resend-activation"><FormattedMessage {...localMessages.sendAgain} /></Link></p>
        </Col>
      </Row>
    </Grid>
  </div>
);


SignupSuccessMessage.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SignupSuccessMessage);
