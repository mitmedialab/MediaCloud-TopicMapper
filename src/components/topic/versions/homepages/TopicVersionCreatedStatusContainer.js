import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import AppButton from '../../../common/AppButton';
import Permissioned from '../../../common/Permissioned';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import messages from '../../../../resources/messages';
import LinkWithFilters from '../../LinkWithFilters';
import TopicVersionStatus from './TopicVersionStatus';

const localMessages = {
  title: { id: 'version.error.title', defaultMessage: 'Created' },
  explanationTitle: { id: 'version.error.explanation.title', defaultMessage: 'What\'s Going On?' },
  explanationText: { id: 'version.error.explanation.text', defaultMessage: 'Your topic has been created, and will soon go into the queue for generation.  That will fill it up with stories we have in our database already, and then try to discover more related articles.' },
  whatNowTitle: { id: 'version.error.explanation2.title', defaultMessage: 'What Should I Do Now? (Admins Only)' },
  whatNowText: { id: 'version.error.explanation2.text', defaultMessage: 'This is the right time to start adding any subtopics that you already know that you\'ll need. Once you\'re ready, click the "generate" button below to start filling up your topic with matching stories.' },
  whatNowOldText: { id: 'version.error.explanation2.oldText', defaultMessage: 'This is old verison that never got generated, so you can\'t do anything to it.' },
};

const TopicVersionCreatedStatusContainer = ({ topic, onSnapshotGenerate, snapshot, intl }) => (
  <React.Fragment>
    <TopicVersionStatus
      subtitle={localMessages.title}
      topic={topic}
      snapshot={snapshot}
    >
      <h2><FormattedMessage {...localMessages.explanationTitle} /></h2>
      <p><FormattedMessage {...localMessages.explanationText} /></p>

      <img alt={intl.formatMessage(localMessages.title)} src="/static/img/kittens/kittens-created.gif" />

      { /* only admins can add subtopics while the topic is waiting to start generating, and not on old versions  */ }
      <Permissioned onlyTopic={PERMISSION_ADMIN}>
        { snapshot.isLatest && (
          <React.Fragment>
            <h2><FormattedMessage {...localMessages.whatNowTitle} /></h2>
            <p><FormattedMessage {...localMessages.whatNowText} /></p>
            <LinkWithFilters to={`/topics/${topic.topics_id}/snapshot/foci`}>
              <AppButton
                label={intl.formatMessage(messages.manageFoci)}
              />
            </LinkWithFilters>
            <br />
            <AppButton
              label={intl.formatMessage(messages.runThisVersion)}
              onClick={() => onSnapshotGenerate(topic.topics_id, snapshot.snapshots_id)}
              type="submit"
              primary
            />
          </React.Fragment>
        )}
        { !snapshot.isLatest && (
          <React.Fragment>
            <h2><FormattedMessage {...localMessages.whatNowTitle} /></h2>
            <p><FormattedMessage {...localMessages.whatNowOldText} /></p>
          </React.Fragment>
        )}
      </Permissioned>
    </TopicVersionStatus>
  </React.Fragment>
);

TopicVersionCreatedStatusContainer.propTypes = {
  // from state
  topic: PropTypes.object,
  filters: PropTypes.object,
  snapshot: PropTypes.object,
  onSnapshotGenerate: PropTypes.func,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionCreatedStatusContainer
);
