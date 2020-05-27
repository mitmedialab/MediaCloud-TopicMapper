import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';
import messages from '../../../resources/messages';
import Permissioned from '../../common/Permissioned';
import SourceOrCollectionChip from '../../common/SourceOrCollectionChip';
import TopicOwnerList from '../TopicOwnerList';

const localMessages = {
  state: { id: 'topic.state', defaultMessage: 'State' },
  viewingVersion: { id: 'topic.latest', defaultMessage: 'You are viewing version {version}' },
  latestVersion: { id: 'topic.latest', defaultMessage: 'Latest Version: {version}' },
  timespan: { id: 'topic.summary.timespan', defaultMessage: '<b>Timespan</b>: {start} to {end} ({period})' },
};

const TopicInfo = (props) => {
  const { topic, currentVersion } = props;
  let stateMessage = '';
  if (topic.state !== 'error') {
    stateMessage = topic.message; // show details to everyone if in normal state
  } else {
    // only show error ugly stack trace to admin users
    stateMessage = (<Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>{topic.message}</Permissioned>);
  }
  let sourcesAndCollections = topic.media ? [...topic.media] : [];
  sourcesAndCollections = topic.media_tags ? [...sourcesAndCollections, ...topic.media_tags] : sourcesAndCollections;
  // TODO: change topic state to reflect status of current snapshot... waiting for info
  return (
    <>
      <div className="topic-info-sidebar">
        <p><FormattedMessage {...localMessages.viewingVersion} values={{ version: currentVersion }} /></p>
        <p><FormattedMessage {...localMessages.latestVersion} values={{ version: topic.latestVersion }} /></p>
        <p>
          <b><FormattedMessage {...localMessages.state} /></b>: {topic.state }
          <br />
          {stateMessage}
          <br />
          <b><FormattedMessage {...messages.topicStartDateProp} /></b>: {topic.start_date}
          <br />
          <b><FormattedMessage {...messages.topicEndDateProp} /></b>: {topic.end_date}
        </p>
        <p>
          <b><FormattedHTMLMessage {...messages.topicQueryProp} /></b>
          <code>{topic.solr_seed_query}</code>
        </p>
        <p>
          <b><FormattedHTMLMessage {...messages.topicSourceCollectionsProp} /></b>
        </p>
        {sourcesAndCollections.map(object => (
          <SourceOrCollectionChip key={object.tags_id || object.media_id} object={object} autoLink />
        ))}
        <p>
          <b><FormattedHTMLMessage {...messages.topicValidationProp} /></b>
          <code>{topic.pattern}</code>
        </p>
        <TopicOwnerList owners={topic.owners} />
      </div>
    </>
  );
};

TopicInfo.propTypes = {
  topic: PropTypes.object.isRequired,
  currentVersion: PropTypes.number.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TopicInfo);
