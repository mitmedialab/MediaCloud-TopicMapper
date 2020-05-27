import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import AppButton from '../../../common/AppButton';
import LinkWithFilters from '../../LinkWithFilters';
import TopicVersionStatus from './TopicVersionStatus';

const localMessages = {
  title: { id: 'version.running.title', defaultMessage: 'Still Generating' },
  cancelTopic: { id: 'version.cancel', defaultMessage: 'Cancel This Version' },
  explanationTitle: { id: 'version.running.explanation.title', defaultMessage: 'What\'s Happening?' },
  explanationText: { id: 'version.running.explanation.text', defaultMessage: 'Your topic started off with {seedStoryCount} stories from our existing database that matching its seed query. We are following the links in those stories to discover more.  Each of these new stories will be checked to see if it matches your search terms.  If it does, we will include it in your topic.  If it doesn\'t then we will ignore it. We generally find that just 10% to 15% of the links we follow from your seed stories get included in the final topic.' },
  cancelDetails: { id: 'version.running.cancel.details', defaultMessage: 'If you seed query doesn\'t look right then you should cancel generating this version and make a new one.' },
  seeOtherVersions: { id: 'version.seeOtherVersions', defaultMessage: 'See Other Versions' },
  seeOtherVersionsDetails: { id: 'version.running.seeOtherVersions.details', defaultMessage: 'While you wait for this version to finish generating, you can browse any previous versions of your topic.' },
};

const TopicVersionRunningStatusContainer = ({ subtitle, topic, snapshot, intl, focalSets }) => (
  <>
    <TopicVersionStatus
      subtitle={subtitle || localMessages.title}
      topic={topic}
      snapshot={snapshot}
      focalSets={focalSets}
    >
      <h2>
        <FormattedMessage {...localMessages.explanationTitle} />
      </h2>
      <p><FormattedMessage {...localMessages.explanationText} values={{ seedStoryCount: intl.formatNumber(topic.seed_query_story_count) }} /></p>

      <img alt={intl.formatMessage(localMessages.title)} src="/static/img/kittens/kittens-running.gif" />

      <LinkWithFilters to={`/topics/${topic.topics_id}/versions`}>
        <AppButton label={intl.formatMessage(localMessages.seeOtherVersions)} primary />
      </LinkWithFilters>

      <p><FormattedMessage {...localMessages.seeOtherVersionsDetails} /></p>
      { /*
      <AppButton label={intl.formatMessage(localMessages.cancelTopic)} />
      <p><FormattedMessage {...localMessages.cancelDetails} /></p>
      */ }
    </TopicVersionStatus>
  </>
);

TopicVersionRunningStatusContainer.propTypes = {
  // from parent
  topic: PropTypes.object.isRequired,
  snapshot: PropTypes.object,
  subtitle: PropTypes.object,
  focalSets: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionRunningStatusContainer
);
