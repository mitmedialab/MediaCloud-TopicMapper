import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import StatBar from '../../common/statbar/StatBar';
import { platformNameMessage, platformIconUrl, sourceNameMessage } from '../platforms/AvailablePlatform';
import DataCard from '../../common/DataCard';
import messages from '../../../resources/messages';

const StoryUrlSharingCounts = ({ story, platforms, intl }) => {
  if (platforms && platforms.length > 0 && story.url_sharing_counts && (story.url_sharing_counts.length > 0)) {
    // parse out the data in a way that makes it easy to display
    const statsByPlatform = story.url_sharing_counts.map(shareInfo => {
      const platform = platforms.find(p => p.topic_seed_queries_id === shareInfo.topic_seed_queries_id);
      return {
        platform,
        ...shareInfo,
      };
    });
    // stitch together a display of the data
    return (
      <>
        {statsByPlatform.map(info => (
          <Row>
            <Col lg={12}>
              <DataCard key={info.platform.topic_seed_queries_id}>
                <Row>
                  <Col lg={12}>
                    <h2>
                      <img src={platformIconUrl(info.platform.platform, info.platform.source)} alt={info.platform.platform} />
                      <FormattedMessage {...platformNameMessage(info.platform.platform, info.platform.source)} />
                      &nbsp;
                      (<FormattedMessage {...sourceNameMessage(info.platform.source)} />)
                    </h2>
                  </Col>
                </Row>
                <StatBar
                  stats={[
                    { message: messages.postCount, data: info.post_count ? intl.formatNumber(info.post_count) : '?' },
                    { message: messages.channelCount, data: info.channel_count ? intl.formatNumber(info.channel_count) : '?' },
                    { message: messages.authorCount, data: info.author_count ? intl.formatNumber(info.author_count) : '?' },
                  ]}
                  columnWidth={3}
                />
              </DataCard>
            </Col>
          </Row>
        ))}
      </>
    );
  }
  return '';
};

StoryUrlSharingCounts.propTypes = {
  // from parent
  story: PropTypes.object.isRequired,
  platforms: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  StoryUrlSharingCounts
);
