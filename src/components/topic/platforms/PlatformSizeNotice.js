import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import { DetailNotice } from '../../common/Notice';

const localMessages = {
  maxSize: { id: 'topic.maxSize', defaultMessage: 'Your topic size limit is {limit} stories. If your platforms and spidering discover more than that, your topic will fail to build.' },
  maxSizeDetails: { id: 'topic.maxSize.details', defaultMessage: 'Try to keep your start and end dates small, or be more specific in your queries. Email support@mediacloud.org if you have questions.' },
};

export function platformIncomplete(initializedPlatform) {
  return !initializedPlatform;
}

/**
 * If the user has a topic size limitation, add a note about it here
 */
const PlatformSizeNotice = ({ initializedPlatform, isAdmin, userMaxSize, topicMaxSize }) => (
  <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
    {initializedPlatform && !isAdmin && (
      <div className="notice detail-background">
        <Grid>
          <Row>
            <Col lg={12}>
              <DetailNotice details={localMessages.maxSizeDetails}>
                <FormattedMessage {...localMessages.maxSize} values={{ limit: Math.max(userMaxSize, topicMaxSize) }} />
              </DetailNotice>
            </Col>
          </Row>
        </Grid>
      </div>
    )}
  </Permissioned>
);

PlatformSizeNotice.propTypes = {
  // from state
  initializedPlatform: PropTypes.bool.isRequired,
  userMaxSize: PropTypes.number.isRequired,
  topicMaxSize: PropTypes.number.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  userMaxSize: state.user.profile.limits.max_topic_stories,
  topicMaxSize: state.topics.selected.info.max_stories,
  isAdmin: state.user.isAdmin,
  initializedPlatform: state.topics.selected.platforms.all.initialized,
});

export default
injectIntl(
  connect(mapStateToProps)(
    PlatformSizeNotice
  )
);
