import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import LinkWithFilters from '../LinkWithFilters';
import AppButton from '../../common/AppButton';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import messages from '../../../resources/messages';
import BackLinkingControlBar from '../BackLinkingControlBar';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE, PERMISSION_ADMIN } from '../../../lib/auth';
import { fetchSnapshotStoryCounts, topicSnapshotGenerate } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import JobList from './homepages/JobList';
import TopicVersionListItem from './TopicVersionListItem';

const localMessages = {
  title: { id: 'topic.versionList.title', defaultMessage: 'Topic Versions' },
  subtitle: { id: 'topic.versionList.subtitle', defaultMessage: 'Refine your seed query and manage subtopics.' },
  description: { id: 'topic.versionList.description', defaultMessage: 'Media Cloud topics contain one or more versions. If you want to change your seed query parameters or add/remove subtopics, you have to make a new version. Each version is a non-changing corpus of stories; older versions cannot be changed (this is intended to support our academic research mission).' },
  versionNumber: { id: 'topic.versionNumber', defaultMessage: 'Version {number}' },
  versionState: { id: 'topic.versionState', defaultMessage: '{state}' },
  versionDate: { id: 'topic.versionDate', defaultMessage: '{date}' },
  versionStatus: { id: 'topic.versionStatus', defaultMessage: 'Job status: {status}' },
  createdBy: { id: 'topic.createdBy', defaultMessage: 'Created by: ' },
  createButton: { id: 'topic.create', defaultMessage: 'Create A New Version' },
  createButtonWhy: { id: 'topic.create.why', defaultMessage: 'Change your seed query or manage subtopics by creating a new version.' },
  quickCreateButton: { id: 'topic.create.quick', defaultMessage: 'Quick Create & Spider' },
  quickCreateButtonWhy: { id: 'topic.create.quick.why', defaultMessage: 'Admins Only: Create a new version and spider it (with no changes)' },
  viewButton: { id: 'topic.viewBy', defaultMessage: 'Find Out More ' },
  hasAnError: { id: 'topic.hasError', defaultMessage: 'Sorry, this topic has an error!' },
  otherError: { id: 'topic.otherError', defaultMessage: 'Sorry, this topic has an error!' },
  spiderQueued: { id: 'topic.spiderQueued', defaultMessage: 'This topic is in the queue for spidering stories.  Please reload after a bit to see if it has started spidering.' },
  snapshotQueued: { id: 'snapshotGenerating.warning.queued', defaultMessage: 'We will start creating the new snapshot soon. Please reload this page in a few hours to check if your data is ready.' },
  snapshotRunning: { id: 'snapshotGenerating.warning.running', defaultMessage: 'We are creating a new snapshot right now. Please reload this page in a few hours to check if your data is ready.' },
  snapshotImporting: { id: 'snapshotGenerating.warning.importing', defaultMessage: 'We are importing the new snapshot now. Please reload this page in a few hours to check if your data is ready.' },
  snapshotFailed: { id: 'snapshotFailed.warning', defaultMessage: 'We tried to generate a new snapshot, but it failed.' },
  topicRunning: { id: 'topic.topicRunning', defaultMessage: 'We are scraping the web for all the stories in include in your topic.' },
  queueAge: { id: 'topic.spiderQueuedAge', defaultMessage: 'In the {queueName} queue since {lastUpdated}' },
  notUsingLatestSnapshot: { id: 'topic.notUsingLatestSnapshot', defaultMessage: 'You are not using the latest snapshot!  If you are not doing this on purpose, <a href="{url}">switch to the latest snapshot</a> to get the best data.' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We started generating a new version!' },
  failed: { id: 'topic.edit.save.failed', defaultMessage: 'Sorry, that didn\'t work!' },

};

const TopicVersionListContainer = ({ topicId, topic, storyCounts, versions, selectedSnapshot, intl, isAdmin, handleQuickCreate }) => {
  const { formatMessage } = intl;
  let versionListContent;
  if (versions.length > 0) {
    versionListContent = versions.sort((v1, v2) => {
      if (v1.snapshot_date < v2.snapshot_date) {
        return 1;
      }
      return -1;
    }).map((snapshot, idx) => (
      <TopicVersionListItem
        selected={selectedSnapshot.snapshots_id === snapshot.snapshots_id}
        key={idx}
        topicId={topicId}
        topic={topic}
        number={versions.length - idx}
        version={snapshot}
        storyCounts={storyCounts[snapshot.snapshots_id]}
        isAdmin={isAdmin}
      />
    ));
  } else {
    // handle older topics that error'd out without any snapshots being created
    versionListContent = (
      <TopicVersionListItem
        seleceted
        number={1}
        topicId={topicId}
        topic={topic}
        version={{
          state: topic.state,
          snapshots_id: -1,
          snapshot_date: '?',
          status: '?',
        }}
        storyCounts={{}}
        isAdmin={isAdmin}
      />
    );
  }
  const cannotCreate = false; // TODO: if any snapshot is building
  return (
    <>
      <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topicId}/summary`} />
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <h2><FormattedMessage {...localMessages.subtitle} /></h2>
            <p><FormattedMessage {...localMessages.description} /></p>
          </Col>
        </Row>
        <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
          <Row>
            <Col lg={12}>
              <LinkWithFilters to={`/topics/${topicId}/new-version`}>
                <AppButton
                  style={{ marginRight: 15, marginBottom: 15 }}
                  disabled={cannotCreate}
                  label={formatMessage(localMessages.createButton)}
                  primary
                />
              </LinkWithFilters>
              <FormattedMessage {...localMessages.createButtonWhy} />
            </Col>
          </Row>
        </Permissioned>
        <Permissioned onlyRole={PERMISSION_ADMIN}>
          <Row>
            <Col lg={12}>
              <AppButton
                style={{ marginRight: 15 }}
                disabled={cannotCreate}
                label={formatMessage(localMessages.quickCreateButton)}
                onClick={() => handleQuickCreate(topicId)}
              />
              <FormattedMessage {...localMessages.quickCreateButtonWhy} />
            </Col>
          </Row>
        </Permissioned>
        <div className="topic-version-list">
          {versionListContent}
        </div>
        <Permissioned onlyRole={PERMISSION_ADMIN}>
          <Row>
            <Col lg={10}>
              <JobList jobs={[...topic.job_states]} highlightSnapshotId={selectedSnapshot ? selectedSnapshot.snapshots_id : -1} />
            </Col>
          </Row>
        </Permissioned>
      </Grid>
    </>
  );
};

TopicVersionListContainer.propTypes = {
  // from state
  versions: PropTypes.array.isRequired,
  topicId: PropTypes.number.isRequired,
  topic: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  storyCounts: PropTypes.object,
  selectedSnapshot: PropTypes.object,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleQuickCreate: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  topic: state.topics.selected.info,
  versions: state.topics.selected.snapshots.list,
  storyCounts: state.topics.selected.snapshotStoryCounts,
  fetchStatus: state.topics.selected.snapshotStoryCounts.fetchStatus,
  selectedSnapshot: state.topics.selected.snapshots.selected,
  isAdmin: state.user.isAdmin,
});

export const createNewSpideredVersion = (topicId, dispatch, formatMessage) => {
  dispatch(topicSnapshotGenerate(topicId, { snapshotId: null, spider: 1 }))
    .then((spiderResults) => {
      if (spiderResults && spiderResults.topics_id) { // let them know it worked
        dispatch(updateFeedback({ classes: 'info-notice', open: true, message: formatMessage(localMessages.feedback) }));
        return dispatch(push(`/topics/${spiderResults.topics_id}/versions`));
      }
      return dispatch(updateFeedback({ open: true, message: formatMessage(localMessages.failed) }));
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleQuickCreate: (topicId) => {
    createNewSpideredVersion(topicId, dispatch, ownProps.intl.formatMessage);
  },
});

const fetchAsyncData = (dispatch, { topicId }) => {
  dispatch(fetchSnapshotStoryCounts(topicId));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      TopicVersionListContainer
    )
  )
);
