import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
// import TopicQuickSearchContainer from '../search/TopicQuickSearchContainer';
import TopicListContainer from '../list/TopicListContainer';
import LoginForm from '../../user/LoginForm';
import TopicIcon from '../../common/icons/TopicIcon';
import DataCard from '../../common/DataCard';
import { AddButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import Masthead from '../../common/header/Masthead';
import { WarningNotice } from '../../common/Notice';
import TopicsMarketingFeatureList from './TopicsMarketingFeatureList';
import TopicQuickSearchContainer from '../search/TopicQuickSearchContainer';

const localMessages = {
  homeTitle: { id: 'home.title', defaultMessage: 'Home' },
  title: { id: 'home.intro', defaultMessage: 'Create a Topic to Dive In Deep' },
  about: { id: 'home.intro', defaultMessage: '<p>Use Topic Mapper to dive in deeper on an issue you are investigating.  Once you\'ve used <a href="https://explorer.mediacloud.org">the Explorer</a> to narrow in on a query, media sources, and time period you want to investigate, then you can create a Topic to collect more stories, analyze influence, and slice and dice the content.  This lets you research the media conversation about your topic with more rigor.</p>' },
  loginTitle: { id: 'sources.intro.login.title', defaultMessage: 'Have an Account? Login Now' },
  security: { id: 'login.securitynotice', defaultMessage: 'We recently noticed a security problem and reset all passwords. We emailed everyone a link to reset your password. <br />If you can\'t find that email, <a href={link}> reset your password here.</a>' },
};

const TopicsHomepage = (props) => {
  const { user } = props;
  let content = null;
  if (user.isLoggedIn) {
    content = (
      <div>
        <div className="controlbar">
          <div className="main">
            <Grid>
              <Row>
                <Col lg={8} className="left">
                  <Link to="topics/create">
                    <AddButton />
                    <FormattedMessage {...messages.createNewTopic} />
                  </Link>
                </Col>
                <Col lg={4}>
                  <TopicQuickSearchContainer />
                </Col>
              </Row>
            </Grid>
          </div>
        </div>

        <Grid>
          <TopicListContainer />
        </Grid>

        <TopicsMarketingFeatureList />

      </div>
    );
  } else {
    content = (
      <div>
        <Grid>
          <Row>
            <Col lg={1} xs={0} />
            <Col lg={5} xs={12}>
              <h1><TopicIcon height={32} /><FormattedMessage {...localMessages.title} /></h1>
              <p><FormattedHTMLMessage {...localMessages.about} /></p>
            </Col>
            <Col lg={1} xs={0} />
            <Col lg={5} xs={12}>
              <br />
              <WarningNotice>
                <br />
                <FormattedHTMLMessage {...localMessages.security} values={{ link: '#/user/request-password-reset' }} /><br />
              </WarningNotice>
              <DataCard>
                <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
                <LoginForm redirect="/home" />
              </DataCard>
            </Col>
          </Row>
        </Grid>
        <TopicsMarketingFeatureList />
      </div>
    );
  }
  return (
    <div className="homepage">
      <Masthead
        nameMsg={messages.topicsToolName}
        descriptionMsg={messages.topicsToolDescription}
        link="https://mediacloud.org/tools/"
      />
      {content}
    </div>
  );
};

TopicsHomepage.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from state
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  userTopicPermission: state.topics.selected.info.user_permission,
  user: state.user,
});

export default
injectIntl(
  connect(mapStateToProps)(
    TopicsHomepage
  )
);
