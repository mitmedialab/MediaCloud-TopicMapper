import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  title: { id: 'success.email', defaultMessage: 'We Reset Your Password' },
  intro: { id: 'success.emailInfo', defaultMessage: 'We reset your password. We emailed you just to confirm that you did this on purpose - don\'t be suprised.' },
};

const ResetPasswordSuccessMessage = () => (
  <div className="change-password-success">
    <Grid>
      <Row>
        <Col lg={12}>
          <h1><FormattedMessage {...localMessages.title} /></h1>
          <p><FormattedMessage {...localMessages.intro} /></p>
        </Col>
      </Row>
    </Grid>
  </div>
);

ResetPasswordSuccessMessage.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(ResetPasswordSuccessMessage);
