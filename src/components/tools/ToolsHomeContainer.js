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
import AppButton from '../.../../common/AppButton';

const localMessages = {
  title: { id: 'tools.home.title', defaultMessage: 'What is Media Cloud' },
  intro: { id: 'tools.home.intro', defaultMessage: 'Mediacloud is an open-source content analysis tool that automates the collection and classification of online news content and other data sources in African media ecosystems' },
  civicTitle: { id: 'tools.civic.title', defaultMessage: 'What is CivicSignal?' },
  civicIntro: { id: 'tools.civic.intro', defaultMessage: 'CivicSignal produces research and analyses of Africa’s media ecosystem and emerging civic technology sector, addressing issues that impact democracies and  civil society.' },
  loginTitle: { id: 'tools.home.login.title', defaultMessage: 'Login or Signup Now' },
};

const ToolsHomeContainer = (props) => {
  const { isLoggedIn } = props;
  const notLoggedInContent = (
    <Row>
      <Col lg={12}>
        <Faq />
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
        <Col lg={6}>
            <h1><FormattedMessage {...localMessages.civicTitle} /></h1>
            <p className="intro"><FormattedMessage {...localMessages.civicIntro} /></p>
            <div className="cta-container">
            <AppButton className="contained-btn" variant="contained" label="Call to Action">
              <FormattedMessage {...messages.learnMoreButton} />
            </AppButton>
            </div>
          </Col>
          <Col lg={6}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p className="intro"><FormattedMessage {...localMessages.intro} /></p>
            <div className="cta-container">
            <AppButton label="Call to Action">
              <FormattedMessage {...messages.learnMoreButton} />
            </AppButton>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <ToolDescription
              name={messages.explorerToolName}
              className="tool-explorer tools-card"
              description={messages.explorerToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-explorer.png')}
              url={urlToExplorer('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.topicsToolName}
              className="tool-topics tools-card"
              description={messages.topicsToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-topics.png')}
              url={urlToTopicMapper('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.sourcesToolName}
              className="tool-sources tools-card"
              description={messages.sourcesToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-sources.png')}
              url={urlToSourceManager('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
          <Col lg={6}>
            <ToolDescription
              name={messages.mediaDataToolName}
              className="media-data tools-card"
              description={messages.mediaDataToolDescription}
              screenshotUrl={assetUrl('/static/img/preview-sources.png')}
              url={urlToSourceManager('home')}
              buttonLabel={messages.learnMoreButton}
            />
          </Col>
        </Row>
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
