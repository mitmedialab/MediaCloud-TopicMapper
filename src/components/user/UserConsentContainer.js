import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import UserConsentForm from './UserConsentForm';
import withIntlForm from '../common/hocs/IntlForm';
import { updateFeedback } from '../../actions/appActions';

import { updateProfile } from '../../actions/userActions';

const localMessages = {
  consented: { id: 'user.consented', defaultMessage: 'Consent Form completed' },
};

const UserConsentContainer = props => <UserConsentForm onSubmit={args => props.handleUserConsent(args, props.user)} />;

UserConsentContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  // from state
  user: PropTypes.object,
  // from dispatch
  handleUserConsent: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.user.profile,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleUserConsent: (values, user) => {
    dispatch(updateProfile({ ...user, ...values }))
      .then((response) => { // go to home page
        if (response.profile) {
          // redirect to destination if there is one
          // const loc = ownProps.location; -- empty here - what is best way to send home?
          if (ownProps.redirect) {
            const { redirect } = ownProps.redirect;
            dispatch(push(redirect));
          } else {
            window.location = '/';
          }
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.consented) }));
        }
      });
  },
});

export default
injectIntl(
  withIntlForm(
    connect(mapStateToProps, mapDispatchToProps)(
      UserConsentContainer
    )
  )
);
