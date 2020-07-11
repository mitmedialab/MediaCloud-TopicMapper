import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { urlToExplorer, urlToTopicMapper, urlToSourceManager } from '../../lib/urlUtil';
import ToolDescription from './ToolDescription';
import Faq from './faq/ToolsFaq';
import SystemStatsContainer from '../common/statbar/SystemStatsContainer';
import LoginForm from '../user/LoginForm';
import DataCard from '../common/DataCard';
import { assetUrl } from '../../lib/assetUtil';
import PageTitle from '../common/PageTitle';

const localMessages = {
  title: { id: 'tools.home.title', defaultMessage: 'Welcome to Media Cloud' },
  intro: { id: 'tools.home.intro', defaultMessage: 'Understanding attention and influence within media ecosystems.' },
  loginTitle: { id: 'tools.home.login.title', defaultMessage: 'Login or Signup Now' },
};

const ToolsHomeContainer = (props) => {
  const { isLoggedIn } = props;
  const notLoggedInContent = (
    <Row>
      <Col lg={8}>
        <Faq />
      </Col>
      <Col lg={4}>
        <DataCard>
          <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
          <LoginForm redirect="/" />
        </DataCard>
      </Col>
    </Row>
  );
  const loggedInContent = (
    <Row>
      <Col lg={12}>
        <Faq />
      </Col>
    </Row>
  );
  const content = (isLoggedIn) ? loggedInContent : notLoggedInContent;
  return (
    <div className="tools-home about-page">
      <PageTitle />
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p className="intro"><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <ToolDescription
              name={messages.explorerToolName}
              className="tool-explorer"
              description={messages.explorerToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-explorer.png')}
              url={urlToExplorer('home')}
            />
          </Col>
          <Col lg={4}>
            <ToolDescription
              name={messages.topicsToolName}
              className="tool-topics"
              description={messages.topicsToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-topics.png')}
              url={urlToTopicMapper('home')}
            />
          </Col>
          <Col lg={4}>
            <ToolDescription
              name={messages.sourcesToolName}
              className="tool-sources"
              description={messages.sourcesToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-sources.png')}
              url={urlToSourceManager('home')}
            />
          </Col>
        </Row>
        <SystemStatsContainer />
        { content }
      </Grid>
    </div>
  );
};

ToolsHomeContainer.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
});

export default
injectIntl(
  connect(mapStateToProps)(
    ToolsHomeContainer
  )
);
