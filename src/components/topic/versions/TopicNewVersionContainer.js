import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchUserQueuedAndRunningTopics } from '../../../actions/topicActions';
import PageTitle from '../../common/PageTitle';
import AppButton from '../../common/AppButton';
import BackLinkingControlBar from '../BackLinkingControlBar';
import messages from '../../../resources/messages';
import { WarningNotice } from '../../common/Notice';
import LinkWithFilters from '../LinkWithFilters';
import { needsNewVersion } from './NeedsNewVersionWarning';
import VersionComparisonContainer from './VersionComparisonContainer';

const localMessages = {
  title: { id: 'topics.adminList.title', defaultMessage: 'Make a New Version' },
  youMadeChanges: { id: 'topics.youMadeChanges', defaultMessage: 'You made changes' },
  changeDatesSpdering: { id: 'topics.changeDatesSpdering', defaultMessage: 'Change Dates / Spidering' },
  changeDatesSpderingDesc: { id: 'topics.changeDatesSpdering.desc', defaultMessage: 'Change the dates or advanced settings such as how many rounds of spidering to do. Once you save your changes, we start building a new version with stories that match your new dates and follow new links to discover more stories.' },
  addNewSubtopics: { id: 'topics.addNewSubtopics', defaultMessage: 'Add or Modify Subtopics' },
  addNewSubtopicsDesc: { id: 'topics.addNewSubtopics.desc', defaultMessage: 'Slice and dice your topic into subtopics to support comparative analysis. You can create subtopics with a growing list of techniques; allowing you to group stories by simple boolean queries, the country of focus, the themes included, and more.' },
  cannotUpdateTopic: { id: 'topic.modify.cannotUpdate', defaultMessage: 'Another topic of yours is generating. You can only run one at a time, so you can\'t change this topic until that one finished.' },
  addNewPlatform: { id: 'topics.addNewPlatform', defaultMessage: 'Add or Modify Platforms' },
  addNewPlatformDesc: { id: 'topics.addNewPlatform.desc', defaultMessage: 'Media about your topic is shared across the web and social media. Set up queries for various platforms to find news links on the open-web, those shared on twitter, on reddit, and other platforms. This lets you discover what news links are being shared on different platforms.' },
};

const TopicNewVersionContainer = ({ topic, allowedToRun, intl, newDefinitions, datesOrSpideringHaveChanged, usingLatest,
  platformsHaveChanged, latestVersionRunning }) => (
    <div className="topic-container topic-new-version-container">
      <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topic.topics_id}/summary`} />
      <Grid>
        <PageTitle value={localMessages.title} />

        <h1><FormattedMessage {...localMessages.title} /></h1>
        {!allowedToRun && (
          <WarningNotice><FormattedHTMLMessage {...localMessages.cannotUpdateTopic} /></WarningNotice>
        )}

        {needsNewVersion(usingLatest, newDefinitions, platformsHaveChanged, datesOrSpideringHaveChanged, latestVersionRunning) && (
          <VersionComparisonContainer />
        )}

        <Row>
          <Col lg={4}>
            <h2><FormattedMessage {...localMessages.changeDatesSpdering} /></h2>
            {datesOrSpideringHaveChanged && (
              <WarningNotice><FormattedHTMLMessage {...localMessages.youMadeChanges} /></WarningNotice>
            )}
            <p><FormattedMessage {...localMessages.changeDatesSpderingDesc} /></p>
            <LinkWithFilters to={`/topics/${topic.topics_id}/data-options`}>
              <AppButton
                label={intl.formatMessage(localMessages.changeDatesSpdering)}
                primary
                disabled={!allowedToRun}
              />
            </LinkWithFilters>
          </Col>
          <Col lg={4}>
            <h2><FormattedMessage {...localMessages.addNewSubtopics} /></h2>
            {newDefinitions && (
              <WarningNotice><FormattedHTMLMessage {...localMessages.youMadeChanges} /></WarningNotice>
            )}
            <p><FormattedMessage {...localMessages.addNewSubtopicsDesc} /></p>
            <LinkWithFilters to={`/topics/${topic.topics_id}/snapshot/foci`}>
              <AppButton
                label={intl.formatMessage(localMessages.addNewSubtopics)}
                primary
                disabled={!allowedToRun}
              />
            </LinkWithFilters>
          </Col>
          <Col lg={4}>
            <h2><FormattedMessage {...localMessages.addNewPlatform} /></h2>
            {platformsHaveChanged && (
              <WarningNotice><FormattedHTMLMessage {...localMessages.youMadeChanges} /></WarningNotice>
            )}
            <p><FormattedMessage {...localMessages.addNewPlatformDesc} /></p>
            <LinkWithFilters to={`/topics/${topic.topics_id}/platforms/manage`}>
              <AppButton
                label={intl.formatMessage(localMessages.addNewPlatform)}
                primary
                disabled={!allowedToRun}
              />
            </LinkWithFilters>
          </Col>
        </Row>
      </Grid>
    </div>
);

TopicNewVersionContainer.propTypes = {
  // from state
  filters: PropTypes.object,
  usingLatest: PropTypes.bool.isRequired,
  topic: PropTypes.object,
  formatMessage: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
  allowedToRun: PropTypes.bool.isRequired,
  newDefinitions: PropTypes.bool.isRequired,
  platformsHaveChanged: PropTypes.bool.isRequired,
  datesOrSpideringHaveChanged: PropTypes.bool.isRequired,
  latestVersionRunning: PropTypes.bool.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  goToUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topic: state.topics.selected.info,
  usingLatest: state.topics.selected.snapshots.usingLatest,
  fetchStatus: state.topics.modify.userRunningTopicStatus.fetchStatus,
  allowedToRun: state.topics.modify.userRunningTopicStatus.allowed, // non-admin users can only run one at a time
  newDefinitions: state.topics.selected.focalSets.all.newDefinitions,
  platformsHaveChanged: state.topics.selected.info.platformsHaveChanged,
  datesOrSpideringHaveChanged: state.topics.selected.info.datesOrSpideringHaveChanged,
  latestVersionRunning: state.topics.selected.snapshots.latestVersionRunning,
  selectedSnapshot: state.topics.selected.snapshots.selected,
});

const mapDispatchToProps = dispatch => ({
  goToUrl: url => dispatch(push(url)),
});

const fetchAsyncData = (dispatch) => {
  // will return empty set for admin users
  dispatch(fetchUserQueuedAndRunningTopics());
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      TopicNewVersionContainer
    )
  )
);
