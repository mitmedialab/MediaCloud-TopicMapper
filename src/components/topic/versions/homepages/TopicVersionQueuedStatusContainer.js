import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import TopicVersionStatus from './TopicVersionStatus';

const localMessages = {
  title: { id: 'version.queued.title', defaultMessage: 'Queued' },
  explanationTitle: { id: 'version.queued.explanation.title', defaultMessage: 'What\'s Happening?' },
  explanationText: { id: 'version.queued.explanation.text', defaultMessage: 'We have a small number of servers that run all our software.  To make sure that no single project monopolizes all of them, we have a queue for running topics people create. Your request to make a new version of this topic is now in that queue. We can\'t really estimate how long until your topic finished running, but it usually doesn\'t take more than a few days.' },
  whatNowTitle: { id: 'version.queued.explanation2.title', defaultMessage: 'Made a Mistake?' },
  whatNowText: { id: 'version.queued.explanation2.text', defaultMessage: 'Does that query on the right look wrong? Did you not need this version of the topic anymore?  You can cancel it.' },
};

const TopicVersionQueuedStatusContainer = ({ topic, snapshot, intl }) => (
  <React.Fragment>
    <TopicVersionStatus
      subtitle={localMessages.title}
      topic={topic}
      snapshot={snapshot}
    >
      <h2><FormattedMessage {...localMessages.explanationTitle} /></h2>
      <p><FormattedMessage {...localMessages.explanationText} /></p>

      <img alt={intl.formatMessage(localMessages.title)} src="/static/img/kittens/kittens-queued.gif" />

      {/*
      <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
        <h2><FormattedMessage {...localMessages.whatNowTitle} /></h2>
        <p><FormattedMessage {...localMessages.whatNowText} /></p>
          <AppButton
            label={intl.formatMessage(messages.cancel)}
            onClick={showDialog}
          />
      </Permissioned>
      */}
    </TopicVersionStatus>
  </React.Fragment>
);

TopicVersionQueuedStatusContainer.propTypes = {
  // from state
  topic: PropTypes.object,
  filters: PropTypes.object,
  snapshot: PropTypes.object,
  goToCreateNewVersion: PropTypes.func,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionQueuedStatusContainer
);
