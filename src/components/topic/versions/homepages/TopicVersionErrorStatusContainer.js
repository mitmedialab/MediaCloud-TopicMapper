import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import AppButton from '../../../common/AppButton';
import Permissioned from '../../../common/Permissioned';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import messages from '../../../../resources/messages';
import TopicVersionStatus from './TopicVersionStatus';

const localMessages = {
  title: { id: 'version.error.title', defaultMessage: '<span class="error-background">Error</span>' },
  explanationTitle: { id: 'version.error.explanation.title', defaultMessage: 'What\'s the Problem?' },
  explanationText: { id: 'version.error.explanation.text', defaultMessage: 'Something went wrong while your topic was running.' },
  whatNowTitle: { id: 'version.error.explanation2.title', defaultMessage: 'What Should I Do Now?' },
  whatNowText: { id: 'version.error.explanation2.text', defaultMessage: 'Nothing! We\'ve been notified, and will take a look at it.  If you don\'t hear from us soon, do drop us a line at support@mediacloud.org.' },
};

const TopicVersionErrorStatusContainer = ({ topic, goToCreateNewVersion, snapshot, intl, focalSets }) => (
  <>
    <TopicVersionStatus
      subtitle={localMessages.title}
      topic={topic}
      focalSets={focalSets}
      snapshot={snapshot}
    >
      <h2><FormattedMessage {...localMessages.explanationTitle} /></h2>
      <p><FormattedMessage {...localMessages.explanationText} /></p>

      <img alt={intl.formatMessage(messages.error)} src="/static/img/kittens/kittens-error.gif" />

      <h2><FormattedMessage {...localMessages.whatNowTitle} /></h2>
      <p><FormattedMessage {...localMessages.whatNowText} /></p>

      <Permissioned onlyTopic={PERMISSION_ADMIN}>
        <div className="topic-stuck-created-or-error">
          <AppButton
            label={intl.formatMessage(messages.createNewVersion)}
            onClick={() => goToCreateNewVersion(topic.topics_id)}
          />
        </div>
      </Permissioned>
    </TopicVersionStatus>
  </>
);

TopicVersionErrorStatusContainer.propTypes = {
  // from parent
  topic: PropTypes.object,
  filters: PropTypes.object,
  snapshot: PropTypes.object,
  goToCreateNewVersion: PropTypes.func,
  focalSets: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionErrorStatusContainer
);
