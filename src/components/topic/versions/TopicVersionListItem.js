import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage, FormattedDate } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../common/AppButton';
import { TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING, TOPIC_SNAPSHOT_STATE_COMPLETED, TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED } from '../../../reducers/topics/selected/snapshots';
import LinkWithFilters from '../LinkWithFilters';
import { trimToMaxLength } from '../../../lib/stringUtil';
import TabbedChip from '../../common/TabbedChip';
import TopicVersionReadySummary from './TopicVersionReadySummary';

const localMessages = {
  versionNumber: { id: 'topic.versionNumber', defaultMessage: 'Version {number}' },
  versionStatus: { id: 'topic.versionStatus', defaultMessage: 'Job status: {status}' },
  defaultAction: { id: 'topic.viewBy', defaultMessage: 'Find Out More' },
  queued: { id: 'topic.state.queued', defaultMessage: '<i>Waiting In Line</i>' },
  queuedDetails: { id: 'topic.state.queuedDetails', defaultMessage: 'Waiting for a turn to generate ({age}).' },
  running: { id: 'topic.state.running', defaultMessage: '<i>Generating</i>' },
  runningDetails: { id: 'topic.state.runningDetails', defaultMessage: 'We are still collecting stories for this version.' },
  runningAction: { id: 'topic.state.runningAction', defaultMessage: 'See Details' },
  runningDetailsAmostDone: { id: 'topic.state.runningDetailsAmostDone', defaultMessage: 'We are almost done generating this version.' },
  completed: { id: 'topic.state.running', defaultMessage: 'Ready to use' },
  completedAction: { id: 'topic.state.useVersion', defaultMessage: 'Use Version {number}' },
  adminDetails: { id: 'topic.state.adminDetails', defaultMessage: '<br />Admin info: {jobCount} associated jobs' },
  error: { id: 'topic.state.running', defaultMessage: 'Failed' },
  createdNotQueued: { id: 'topic.state.createdNotQueued', defaultMessage: 'Created' },
  createdNotQueuedDetails: { id: 'topic.state.createdNotQueuedDetails', defaultMessage: 'This version hasn\'t been generated yet.' },
  createdNotQueuedAction: { id: 'topic.state.finishGenerating', defaultMessage: 'Review Changes' },
  selected: { id: 'topic.version.selected', defaultMessage: 'Selected' },
};

const snapshotOrJobState = (snapshot) => {
  if (snapshot.job_states && (snapshot.job_states.length > 0)) {
    return snapshot.job_states[0].state;
  }
  return snapshot.state;
};

const versionSelectText = (state, number, formatMessage) => {
  switch (state) {
    case TOPIC_SNAPSHOT_STATE_COMPLETED:
      return formatMessage(localMessages.completedAction, { number });
    case TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED:
      return formatMessage(localMessages.createdNotQueuedAction);
    case TOPIC_SNAPSHOT_STATE_RUNNING:
      return formatMessage(localMessages.runningAction);
    default:
      return formatMessage(localMessages.defaultAction);
  }
};

const messageForVersionState = (snapshot) => {
  switch (snapshotOrJobState(snapshot)) {
    case TOPIC_SNAPSHOT_STATE_QUEUED:
      return localMessages.queued;
    case TOPIC_SNAPSHOT_STATE_RUNNING:
      return localMessages.running;
    case TOPIC_SNAPSHOT_STATE_COMPLETED:
      if (!snapshot.isUsable) {
        return localMessages.running; // ie. still being imported
      }
      return localMessages.completed;
    case TOPIC_SNAPSHOT_STATE_ERROR:
      return localMessages.error;
    case TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED:
      return localMessages.createdNotQueued;
    default:
      return snapshotOrJobState(snapshot);
  }
};

const detailsForVersionState = (snapshot, storyCounts) => {
  switch (snapshotOrJobState(snapshot)) {
    case TOPIC_SNAPSHOT_STATE_QUEUED:
      // this is a moment object so we can call this relative date helper
      return (
        <FormattedMessage
          {...localMessages.runningDetailsAmostDone}
          values={{ age: snapshot.snapshotDate.fromNow() }}
        />
      );
    case TOPIC_SNAPSHOT_STATE_COMPLETED:
      if (!snapshot.isUsable) {
        return <FormattedMessage {...localMessages.runningDetailsAmostDone} />;
      }
      return <TopicVersionReadySummary storyCounts={storyCounts} snapshot={snapshot} />;
    case TOPIC_SNAPSHOT_STATE_RUNNING:
      return <FormattedMessage {...localMessages.runningDetails} />;
    case TOPIC_SNAPSHOT_STATE_ERROR:
      // TODO: show generic error for regular users, and detailed message for admin users
      return trimToMaxLength(snapshot.message, 400);
    case TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED:
      return <FormattedMessage {...localMessages.createdNotQueuedDetails} />;
    default:
      return snapshotOrJobState(snapshot);
  }
};

const TopicVersionListItem = ({ version, intl, number, topicId, storyCounts, selected, isAdmin }) => (
  <div className="topic-version-list-item">
    <Row>
      <Col lg={2}>
        <div className="topic-version-list-title">
          <LinkWithFilters to={`/topics/${topicId}/summary`} filters={{ snapshotId: version.snapshots_id }}>
            <h2>
              <FormattedHTMLMessage {...localMessages.versionNumber} values={{ number, status: snapshotOrJobState(version) }} />
            </h2>
          </LinkWithFilters>
          {version.snapshotDate && (
            <small>
              <FormattedDate value={version.snapshotDate} month="short" year="numeric" day="numeric" />
            </small>
          )}
        </div>
      </Col>
      <Col lg={6}>
        <div className="topic-version-list-info">
          <h2>
            <FormattedHTMLMessage {...messageForVersionState(version)} />
            {selected && <TabbedChip message={localMessages.selected} />}
          </h2>
          {detailsForVersionState(version, storyCounts)}
          {isAdmin && (
            <FormattedHTMLMessage
              {...localMessages.adminDetails}
              values={{ jobCount: version.job_states ? version.job_states.length : 0 }}
            />
          )}
          <br />
          { // don't show a button if this is the version that is currently selected
            !selected && (
            <LinkWithFilters to={`/topics/${topicId}/summary`} filters={{ snapshotId: version.snapshots_id, timespanId: null, focusId: null }}>
              <AppButton
                type="submit"
                label={versionSelectText(snapshotOrJobState(version), number, intl.formatMessage)}
              />
            </LinkWithFilters>
            )
          }
        </div>
      </Col>
    </Row>
  </div>
);

TopicVersionListItem.propTypes = {
  // from parent
  number: PropTypes.number.isRequired,
  version: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  storyCounts: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  selected: PropTypes.bool,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionListItem
);
