import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import TopicVersionReadySummary from './TopicVersionReadySummary';

const localMessages = {
  title: { id: 'topic.info.title', defaultMessage: 'Version {versionNumber}: Summary' },
  newTitle: { id: 'topic.info.newTitle', defaultMessage: 'New Version: Summary' },
};

const SeedQuerySummary = ({ topic, snapshot, focalSets }) => (
  <div className="topic-info-sidebar">
    <h2>
      {snapshot && <FormattedHTMLMessage {...localMessages.title} values={{ versionNumber: snapshot.note }} />}
      {((snapshot === null) || (snapshot === undefined)) && <FormattedHTMLMessage {...localMessages.newTitle} />}
    </h2>
    <TopicVersionReadySummary
      snapshot={snapshot}
      topic={topic}
      focalSets={focalSets}
      startWithDetailsShowing
    />
  </div>
);

SeedQuerySummary.propTypes = {
  // from parent
  snapshot: PropTypes.object.isRequired,
  topic: PropTypes.object.isRequired,
  focalSets: PropTypes.array,
  // from component chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SeedQuerySummary);
