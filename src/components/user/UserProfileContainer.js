import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { Helmet } from 'react-helmet';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import AppButton from '../common/AppButton';
import { resetApiKey } from '../../actions/userActions';
import { addNotice, updateFeedback } from '../../actions/appActions';
import { LEVEL_ERROR } from '../common/Notice';

const API_REQUESTS_UNLIMITED = 0;

const localMessages = {
  admin: { id: 'user.profile.admin', defaultMessage: '<p><b>You are an admin-level user. Don\'t break anything!</b></p>' },
  email: { id: 'user.profile.email', defaultMessage: '<b>Email:</b> {email}' },
  name: { id: 'user.profile.name', defaultMessage: '<b>Name:</b> {name}' },
  apiRequests: { id: 'user.profile.apiRequests', defaultMessage: '<b>API Weekly Requests:</b> {requested} / {allowed}' },
  apiRequestedItems: { id: 'user.profile.apiRequestedItems', defaultMessage: '<b>API Weekly Requested Items:</b> {requested} / {allowed}' },
  apiKey: { id: 'user.profile.apiKey', defaultMessage: '<b>API Key:</b> {key}' },
  resetKey: { id: 'user.profile.apiKey.reset', defaultMessage: 'Reset API Key' },
  resetWorked: { id: 'user.profile.apiKey.resetWorked', defaultMessage: 'We reset your API key successfully' },
};

const UserProfileContainer = (props) => {
  const { profile, handleResetApiKey } = props;
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(messages.userProfile)} | ${parentTitle}`;
  const adminContent = (profile.auth_roles.includes('admin')) ? <FormattedHTMLMessage {...localMessages.admin} /> : null;
  return (
    <Grid>
      <Helmet><title>{titleHandler()}</title></Helmet>
      <Row>
        <Col lg={12}>
          <h1><FormattedMessage {...messages.userProfile} /></h1>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          {adminContent}
          <ul>
            <li><FormattedHTMLMessage {...localMessages.email} values={{ email: profile.email }} /></li>
            <li><FormattedHTMLMessage {...localMessages.name} values={{ name: profile.full_name }} /></li>
            <li><FormattedHTMLMessage
              {...localMessages.apiRequests}
              values={{
                requested: profile.weekly_requests_sum,
                allowed: (profile.weekly_requests_limit === API_REQUESTS_UNLIMITED) ? formatMessage(messages.unlimited) : profile.weekly_requests_limit,
              }}
            /></li>
            <li><FormattedHTMLMessage
              {...localMessages.apiRequestedItems}
              values={{
                requested: profile.weekly_requested_items_sum,
                allowed: (profile.weekly_requested_items_limit === API_REQUESTS_UNLIMITED) ? formatMessage(messages.unlimited) : profile.weekly_requests_limit,
              }}
            /></li>
            <li><FormattedHTMLMessage {...localMessages.apiKey} values={{ key: profile.api_key }} /></li>
          </ul>
          <br /><br />
          <AppButton
            label={formatMessage(localMessages.resetKey)}
            onClick={handleResetApiKey}
          />
        </Col>
      </Row>
    </Grid>
  );
};

UserProfileContainer.propTypes = {
  // from state
  profile: PropTypes.object.isRequired,
  // from dispatch
  handleResetApiKey: PropTypes.func.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  profile: state.user.profile,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleResetApiKey: () => {
    dispatch(resetApiKey())
    .then((results) => {
      if (results.error) {
        dispatch(addNotice({ message: results.error, level: LEVEL_ERROR }));
      } else {
        dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.resetWorked) }));
      }
    });
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      UserProfileContainer
    )
  );
