import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Title from 'react-title-component';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { TOPICS_URL, DASHBOARD_URL, SOURCES_URL } from '../common/header/AppToolbar';
import ToolDescription from './ToolDescription';
import Faq from './faq/Faq';

const localMessages = {
  title: { id: 'tools.home.title', defaultMessage: 'Welcome to Media Cloud' },
  intro: { id: 'tools.home.intro', defaultMessage: 'Use our tools to track and visualize online news.' },
};

const ToolsHomeContainer = (props) => {
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(localMessages.title)} | ${parentTitle}`;
  return (
    <div className="tools-home">
      <Grid>
        <Title render={titleHandler} />
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p className="intro"><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <ToolDescription
              name={messages.dashboardToolName}
              className="tool-dashboard"
              description={messages.dashboardToolDescription}
              screenshotUrl="/static/img/preview-dashboard.png"
              url={DASHBOARD_URL}
            />
          </Col>
          <Col lg={4}>
            <ToolDescription
              name={messages.topicsToolName}
              className="tool-topics"
              description={messages.topicsToolDescription}
              screenshotUrl="/static/img/preview-topics.png"
              url={TOPICS_URL}
            />
          </Col>
          <Col lg={4}>
            <ToolDescription
              name={messages.sourcesToolName}
              className="tool-sources"
              description={messages.sourcesToolDescription}
              screenshotUrl="/static/img/preview-sources.png"
              url={SOURCES_URL}
            />
          </Col>
        </Row>
        <Faq />
      </Grid>
    </div>
  );
};

ToolsHomeContainer.propTypes = {
  isLoggedIn: React.PropTypes.bool.isRequired,
  intl: React.PropTypes.object.isRequired,
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
