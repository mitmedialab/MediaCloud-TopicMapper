import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
// import { hot } from 'react-hot-loader/root';
import Snackbar from '@material-ui/core/Snackbar';
import intl from 'intl';  // eslint-disable-line
import intlEn from 'intl/locale-data/jsonp/en.js';  // eslint-disable-line
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import NavToolbar from './common/header/NavToolbar';
import ErrorBoundary from './common/ErrorBoundary';
import messages from '../resources/messages';
import { getVersion } from '../config';
import { ErrorNotice, WarningNotice } from './common/Notice';
import { assetUrl } from '../lib/assetUtil';
import AppNoticesContainer from './common/header/AppNoticesContainer';
import { Twitter, Facebook, Instagram, LinkedIn, GitHub } from '@material-ui/icons';

const localMessages = {
  privacyPolicy: { id: 'app.privacyPolicy', defaultMessage: 'Read our privacy policy.' },
  maintenance: { id: 'app.maintenance', defaultMessage: 'Sorry, we have taken our system down right now for maintenance' },
  license: { id: 'app.footer.license', defaultMessage: 'This site is an openAFRICA project of Code for Africa. All content is released under a Creative Commons 4 Attribution Licence. Reuse it to help empower your own community. The code is available on GitHub and data is available on openAFRICA.' },
};

class AppContainer extends React.Component {
  state = {
    open: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { feedback } = this.props;
    if (nextProps.feedback.message !== feedback.message) {
      this.setState({ open: true });
    }
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { children, feedback, name } = this.props;
    let content = children;
    if (document.appConfig.maintenanceMode === 1) {
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
      <div className={`app-container app-${name}`}>
        <AppNoticesContainer />
        <header>
          <NavToolbar />
        </header>
        <ErrorBoundary>
          <div id="content">
            {document.appConfig.systemWarning
              && (
                <div style={{ textAlign: 'center' }}>
                  <WarningNotice>
                    {document.appConfig.systemWarning}
                  </WarningNotice>
                </div>
              )}
            {content}
          </div>
        </ErrorBoundary>
        <footer>
          <Grid className="primary-footer">
            <Row>
              <Col lg={8}>
                <a href="#">
                  <img
                    className="app-logo"
                    alt=""
                    src={assetUrl('/static/img/cfa.svg')}
                    height={80}
                  />
                </a>
              </Col>
            </Row>
            <Row>
              <Col lg={8}>
                <p>
                  {'Created by the '}
                  <a href="https://civic.mit.edu/">
                    <FormattedMessage {...messages.c4cmName} />
                  </a>
                  {' and the '}
                  <a href="https://cyber.law.harvard.edu">
                    <FormattedMessage {...messages.berkmanName} />
                  </a>.
              <br />
                  <FormattedHTMLMessage {...messages.supportOptions} />
                  <br />
                  <br />
                  <FormattedHTMLMessage {...localMessages.license} />
                  <br />
                </p>
              </Col>
            </Row>
          </Grid>
          <div className="secondary-footer">
            <Grid>
              <Row className="secondary-footer-row" >
                <Col className="secondary-footer-col" lg={6}>
                  <a href="#">
                    <img
                      className="app-logo"
                      alt="logo"
                      src={assetUrl('/static/img/mediacloud-logo-white-2x.png')}
                      width={40}
                      height={40}
                    />
                  </a>
                </Col>
                <Col className="secondary-footer-col footer-social-col" lg={6}>
                  <a href="#">
                    <Twitter
                      className="footer-social"
                    ></Twitter>
                  </a>
                  <a href="#">
                    <Instagram
                      className="footer-social"
                    ></Instagram>
                  </a>
                  <a href="#">
                    <Facebook
                      className="footer-social"
                    ></Facebook> </a>
                  <a href="#">
                    <LinkedIn
                      className="footer-social"
                    ></LinkedIn> </a>
                  <a href="#">
                    <GitHub
                      className="footer-social"
                    ></GitHub>
                  </a>
                </Col>
              </Row>
            </Grid>
          </div>
        </footer>
        <Snackbar
          className={feedback.classes ? feedback.classes : 'info_notice'}
          open={this.state.open}
          onClose={this.handleClose}
          message={feedback.message}
          action={feedback.action}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={5000}
        />
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.node,
  handleTouchTapLeftIconButton: PropTypes.func,
  intl: PropTypes.object.isRequired,
  // from state
  feedback: PropTypes.object.isRequired,
  // from parent
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showLoginButton: PropTypes.bool,
};

AppContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  feedback: state.app.feedback,
});

export default
  // hot(
  injectIntl(
    connect(mapStateToProps)(
      AppContainer
    )
  );
