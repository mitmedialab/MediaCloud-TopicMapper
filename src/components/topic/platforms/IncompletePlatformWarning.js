import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import { WarningNotice } from '../../common/Notice';
// import AppButton from '../../common/AppButton';
// import LinkWithFilters from '../LinkWithFilters';

const localMessages = {
  platformIncomplete: { id: 'topic.incomplete', defaultMessage: 'This is a new Topic. You need to add the Open Web Media Cloud platform, and any others you\'d like. Then you can run it.' },
  platformIncompleteAction: { id: 'topic.incomplete.action', defaultMessage: 'Manage Platforms' },
};

export function platformIncomplete(initializedPlatform) {
  return !initializedPlatform;
}

/**
 * For new topics we can use this to show the user that they need to add some platforms.
 */
const IncompletePlatformWarning = ({ initializedPlatform }) => (
  <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
    {platformIncomplete(initializedPlatform) && (
      <div className="notice warning-background">
        <Grid>
          <Row>
            <Col lg={12}>
              <WarningNotice>
                <FormattedMessage {...localMessages.platformIncomplete} />
              </WarningNotice>
            </Col>
          </Row>
        </Grid>
      </div>
    )}
  </Permissioned>
);

IncompletePlatformWarning.propTypes = {
  // from state
  initializedPlatform: PropTypes.bool.isRequired,
  topicId: PropTypes.number.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  initializedPlatform: state.topics.selected.platforms.all.initialized,
});

export default
injectIntl(
  connect(mapStateToProps)(
    IncompletePlatformWarning
  )
);
