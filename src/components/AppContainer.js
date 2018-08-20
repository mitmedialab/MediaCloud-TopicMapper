import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
// polyfill for Safari :-(
import intl from 'intl';  // eslint-disable-line
import intlEn from 'intl/locale-data/jsonp/en.js';  // eslint-disable-line
import { Row } from 'react-flexbox-grid/lib';
import NavToolbar from './common/header/NavToolbar';
import ErrorBoundary from './common/ErrorBoundary';
import messages from '../resources/messages';
import { getVersion } from '../config';
import { updateFeedback } from '../actions/appActions';
import { ErrorNotice } from './common/Notice';
import { assetUrl } from '../lib/assetUtil';
import AppNoticesContainer from './common/header/AppNoticesContainer';

const localMessages = {
  supportOptions: { id: 'app.supportOptions', defaultMessage: 'Need help? Join our <a href="https://groups.io/g/mediacloud">discussion group</a><br />or email <a href="mailto:support@mediacloud.org">support@mediacloud.org</a>.' },
  maintenance: { id: 'app.maintenance', defaultMessage: 'Sorry, we have taken our system down right now for maintenance' },
};

const AppContainer = (props) => {
  const { children, feedback, handleSnackBarRequestClose, name } = props;
  const { formatMessage } = props.intl;

  let content = children;
  if (document.appConfig.online === false) {
    content = (
      <div className="maintenance">
        <Row center="lg">
          <ErrorNotice>
            <br /><br />
            <FormattedMessage {...localMessages.maintenance} />
            <br /><br />
            <img alt="under-constrction" src={assetUrl('/static/img/under-construction.gif')} />
            <br /><br />
          </ErrorNotice>
        </Row>
      </div>
    );
  }

  return (
    <div className={`app-contiainer app-${name}`}>
      <Helmet><title>{formatMessage(messages.suiteName)}</title></Helmet>
      <AppNoticesContainer />
      <header>
        <NavToolbar />
      </header>
      <ErrorBoundary>
        <div id="content">
          {content}
        </div>
      </ErrorBoundary>
      <footer>
        <p><small>
          {'Created by the '}
          <a href="https://civic.mit.edu/">
            <FormattedMessage {...messages.c4cmName} />
          </a>
          {' and the '}
          <a href="https://cyber.law.harvard.edu">
            <FormattedMessage {...messages.berkmanName} />
          </a>.
          <br />
          <FormattedHTMLMessage {...localMessages.supportOptions} />
          <br />
          v{getVersion()}
        </small>
        </p>
      </footer>
      <Snackbar
        open={feedback.open}
        message={feedback.message}
        action={feedback.action}
        // onClick={feedback.onActionClick}
        autoHideDuration={8000}
        onRequest={handleSnackBarRequestClose}
      />
    </div>
  );
};

AppContainer.propTypes = {
  children: PropTypes.node,
  handleTouchTapLeftIconButton: PropTypes.func,
  intl: PropTypes.object.isRequired,
  // from state
  feedback: PropTypes.object.isRequired,
  // from dispatch
  handleSnackBarRequestClose: PropTypes.func.isRequired,
  // from parent
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showLoginButton: PropTypes.bool,
};

AppContainer.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  feedback: state.app.feedback,
});

const mapDispatchToProps = dispatch => ({
  handleSnackBarRequestClose: () => {
    dispatch(updateFeedback({ open: false, message: '' }));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      AppContainer
    )
  );
