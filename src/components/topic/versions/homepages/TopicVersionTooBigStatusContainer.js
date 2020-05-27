import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import AppButton from '../../../common/AppButton';
import Permissioned from '../../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../../lib/auth';
import TopicVersionStatus from './TopicVersionStatus';

const localMessages = {
  title: { id: 'version.error.tooBig.title', defaultMessage: '<span class="error-background">Too Big</span>' },
  explanationTitle: { id: 'version.error.tooBig.explanation.title', defaultMessage: 'What\'s the Problem?' },
  explanationText: { id: 'version.error.tooBig.explanation.text', defaultMessage: 'Due to limitations in our infrastructure, you are limited to created topics that have a total of {maxTopicStories} stories (after spidering).  Your topic started with {seedStoryCount} stories in its seed query (see the box to the right).  Spidering added so many that it has now surpassed the {maxTopicStories} story maximum, reaching {totalCount} stories so far.  Unfortunatley we don’t have enough computational resources to support users creating topics that big, so we\'ve stopped your topic from generating completely.' },
  whatNowTitle: { id: 'version.error.tooBig.explanation2.title', defaultMessage: 'What Should I Do Now?' },
  whatNowText: { id: 'version.error.tooBig.explanation2.text', defaultMessage: 'You need to create a new version with fewer seed stories. You can do this in a few ways:<ul><li>make your query more specific</li><li>focus on a shorter timespan</li><li>start with fewer media sources and collections</li></ul>.' },
  makeASmallerVersion: { id: 'version.error.tooBig.makeSmaller', defaultMessage: 'Make a Smaller Version' },
};

// BRITTLE: parses out the number of stories from the error msg saying the topic had too many stories
export const storyCountFromJobMessage = (jobMessage) => {
  const check1 = /topic has ([^ ]*) stories/.exec(jobMessage);
  const check2 = /solr_seed_query returned more than ([^ ]*) stories/.exec(jobMessage);
  if (check1) return check1[1];
  if (check2) return check2[1];
  return null;
};

const TopicVersionTooBigStatusContainer = ({ topic, goToCreateNewVersion, snapshot, intl, focalSets }) => (
  <TopicVersionStatus
    subtitle={localMessages.title}
    topic={topic}
    focalSets={focalSets}
    snapshot={snapshot}
  >
    <h2><FormattedMessage {...localMessages.explanationTitle} /></h2>
    <p>
      <FormattedMessage
        {...localMessages.explanationText}
        values={{
          maxTopicStories: intl.formatNumber(topic.max_stories),
          seedStoryCount: intl.formatNumber(topic.seed_query_story_count),
          totalCount: intl.formatNumber(storyCountFromJobMessage(snapshot.job_states[0].message)),
        }}
      />
    </p>

    <img alt={intl.formatMessage(localMessages.title)} src="/static/img/kittens/kittens-too-big.gif" />

    <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
      <h2><FormattedMessage {...localMessages.whatNowTitle} /></h2>
      <p><FormattedHTMLMessage {...localMessages.whatNowText} /></p>
      <div className="topic-stuck-created-or-error">
        <AppButton
          label={intl.formatMessage(localMessages.makeASmallerVersion)}
          onClick={() => goToCreateNewVersion(topic.topics_id)}
          type="submit"
          primary
        />
      </div>
    </Permissioned>
  </TopicVersionStatus>
);

TopicVersionTooBigStatusContainer.propTypes = {
  // from state
  topic: PropTypes.object,
  filters: PropTypes.object,
  snapshot: PropTypes.object,
  focalSets: PropTypes.array,
  goToCreateNewVersion: PropTypes.func,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionTooBigStatusContainer
);
