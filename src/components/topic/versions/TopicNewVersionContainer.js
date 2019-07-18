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
import { FETCH_SUCCEEDED } from '../../../lib/fetchConstants';
import { WarningNotice } from '../../common/Notice';
import LinkWithFilters from '../LinkWithFilters';

const localMessages = {
  title: { id: 'topics.adminList.title', defaultMessage: 'Make a New Version' },
  createNewVersion: { id: 'topics.createNewVersion', defaultMessage: 'Change Seed Query' },
  createNewVersionDesc: { id: 'topics.createNewVersion.desc', defaultMessage: 'Change the search terms, dates, or media sources and collections. Once you save your changes, we start building a new version with stories that match your new seed query and follow new links to discover more stories.' },
  addNewSubtopics: { id: 'topics.addNewSubtopics', defaultMessage: 'Add or Modify Subtopics' },
  addNewSubtopicsDesc: { id: 'topics.addNewSubtopics.desc', defaultMessage: 'Slice and dice your topic into subtopics to support comparative analysis. You can create subtopics with a growing list of techniques; allowing you to group stories by simple boolean queries, the country of focus, the themes included, and more.' },
  cannotUpdateTopic: { id: 'topic.modify.cannotUpdate', defaultMessage: 'Another topic of your\'s is Generating. You can only run one at a time, so you can\'t change this topic until that one finished.' },
};

const TopicNewVersionContainer = props => (
  <div className="topic-container topic-new-version-container">
    <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${props.topicId}/summary`} />
    <Grid>
      <PageTitle value={localMessages.title} />
      <h1><FormattedMessage {...localMessages.title} /></h1>
      {!props.allowedToRun && (
        <WarningNotice><FormattedHTMLMessage {...localMessages.cannotUpdateTopic} /></WarningNotice>
      )}
      <Row>
        <Col lg={5}>
          <h2><FormattedMessage {...localMessages.createNewVersion} /></h2>
          <p><FormattedMessage {...localMessages.createNewVersionDesc} /></p>
          <LinkWithFilters to={`/topics/${props.topicId}/update`}>
            <AppButton
              label={props.intl.formatMessage(localMessages.createNewVersion)}
              primary
              disabled={!props.allowedToRun}
            />
          </LinkWithFilters>
        </Col>
        <Col lg={1} />
        <Col lg={5}>
          <h2><FormattedMessage {...localMessages.addNewSubtopics} /></h2>
          <p><FormattedMessage {...localMessages.addNewSubtopicsDesc} /></p>
          <LinkWithFilters to={`/topics/${props.topicId}/snapshot/foci`}>
            <AppButton
              label={props.intl.formatMessage(localMessages.addNewSubtopics)}
              primary
              disabled={!props.allowedToRun}
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
  topicId: PropTypes.number,
  formatMessage: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
  allowedToRun: PropTypes.bool.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  goToUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topicInfo: state.topics.selected.info,
  topicId: state.topics.selected.id,
  // if they are an admin the async doesn't need to run
  fetchStatus: state.user.isAdmin ? FETCH_SUCCEEDED : state.topics.modify.userRunningTopicStatus.fetchStatus,
  allowedToRun: state.topics.modify.userRunningTopicStatus.allowed, // non-admin users can only run one at a time
  isAdmin: state.user.isAdmin,
});

const mapDispatchToProps = dispatch => ({
  goToUrl: url => dispatch(push(url)),
});

const fetchAsyncData = (dispatch, { isAdmin }) => {
  // non-admin users can only run one topic at a time
  if (!isAdmin) {
    dispatch(fetchUserQueuedAndRunningTopics());
  }
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      TopicNewVersionContainer
    )
  )
);
