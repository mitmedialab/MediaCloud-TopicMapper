import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import LinkWithFilters from '../LinkWithFilters';
import { HomeButton, EditButton, ExploreButton } from '../../common/IconButton';
import TabbedChip from '../../common/TabbedChip';
import Permissioned from '../../common/Permissioned';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';
import { TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING,
  TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED } from '../../../reducers/topics/selected/snapshots';
import { ALL_MEDIA } from '../../../lib/mediaUtil';

const localMessages = {
  permissions: { id: 'topic.changePermissions', defaultMessage: 'Permissions' },
  changePermissionsDetails: { id: 'topic.changePermissions.details', defaultMessage: 'Control who else can see and/or change this topic' },
  settings: { id: 'topic.changeSettings', defaultMessage: 'Settings' },
  changeSettingsDetails: { id: 'topic.changeSettings.details', defaultMessage: 'Rename or make your topic public' },
  versionList: { id: 'topic.changeSettings', defaultMessage: 'Versions' },
  viewVersionLists: { id: 'topic.changeSettings', defaultMessage: 'Manage subtopics or change your seed query' },
  filterTopic: { id: 'topic.filter', defaultMessage: 'Filter this Topic' },
  startedSpider: { id: 'topic.startedSpider', defaultMessage: 'Started a new spidering job for this topic' },
  summaryMessage: { id: 'snapshot.required', defaultMessage: 'You have made some changes that you can only see if you generate a new Snapshot. <a href="{url}">Generate one now</a>.' },
  topicHomepage: { id: 'topic.homepage', defaultMessage: 'Summary' },
  jumpToExplorer: { id: 'topic.controlBar.jumpToExplorer', defaultMessage: 'Query on Explorer' },

  latestNeedsAttention: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'needs attention' },
  latestRunning: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'running' },
  newerData: { id: 'topic.version.latestNeedsAttention', defaultMessage: 'newer data' },
};

const explorerUrl = (topic, filters, selectedTimespan) => {
  const queryName = topic.name;
  let queryKeywords = `timespans_id:${filters.timespanId} `;
  if (filters.q && filters.q.length > 0) {
    queryKeywords += ` AND ${filters.q}`;
  }
  return urlToExplorerQuery(
    queryName,
    queryKeywords,
    [],
    [ALL_MEDIA],
    selectedTimespan.start_date.substr(0, 10),
    selectedTimespan.end_date.substr(0, 10),
  );
};

const TopicControlBar = ({ sideBarContent, topic, intl, selectedSnapshot, latestState, latestUsableSnapshot, latestSnapshot, filters, selectedTimespan }) => (
  <div className="controlbar controlbar-topic">
    <div className="main">
      <Grid>
        <Row>
          <Col lg={8} className="control-bar-settings left">
            <div className="controlbar-item">
              <LinkWithFilters to={`/topics/${topic.topics_id}/summary`}>
                <HomeButton />
                <b><FormattedMessage {...localMessages.topicHomepage} /></b>
              </LinkWithFilters>
            </div>
            <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
              <div className="controlbar-item">
                <LinkWithFilters
                  to={`/topics/${topic.topics_id}/settings`}
                  title={intl.formatMessage(localMessages.changeSettingsDetails)}
                >
                  <EditButton
                    label={intl.formatMessage(localMessages.settings)}
                    id="modify-topic-settings"
                  />
                  <b><FormattedMessage {...localMessages.settings} /></b>
                </LinkWithFilters>
              </div>
            </Permissioned>
            <Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>
              <div className="controlbar-item">
                <LinkWithFilters
                  to={`/topics/${topic.topics_id}/permissions`}
                  className="permissions"
                  title={intl.formatMessage(localMessages.changePermissionsDetails)}
                >
                  <EditButton
                    label={intl.formatMessage(localMessages.permissions)}
                    id="modify-topic-permissions"
                  />
                  <b><FormattedMessage {...localMessages.permissions} /></b>
                </LinkWithFilters>
              </div>
            </Permissioned>
            <div className="controlbar-item">
              <LinkWithFilters
                to={`/topics/${topic.topics_id}/versions`}
                title={intl.formatMessage(localMessages.viewVersionLists)}
              >
                <EditButton
                  label={intl.formatMessage(localMessages.versionList)}
                  id="modify-topic-permissions"
                />
                <b><FormattedMessage {...localMessages.versionList} /></b>
                {[TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED].includes(latestState.state) && (
                  <TabbedChip error message={localMessages.latestNeedsAttention} />
                )}
                {[TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING].includes(latestState.state) && (
                  <TabbedChip message={localMessages.latestRunning} />
                )}
                {(selectedSnapshot) && (selectedSnapshot.snapshots_id !== latestSnapshot.snapshots_id) && (selectedSnapshot.snapshots_id !== latestUsableSnapshot.snapshots_id)
                  && (<TabbedChip warning message={localMessages.newerData} />)
                }
              </LinkWithFilters>
            </div>
            { filters.timespanId && selectedTimespan && (
              <div className="controlbar-item">
                <a target="top" href={explorerUrl(topic, filters, selectedTimespan)}>
                  <ExploreButton />
                  <b><FormattedMessage {...localMessages.jumpToExplorer} /></b>
                </a>
              </div>
            )}
          </Col>
          <Col lg={4}>
            {sideBarContent}
          </Col>
        </Row>
      </Grid>
    </div>
  </div>
);

TopicControlBar.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
  // from parent
  sideBarContent: PropTypes.node,
  // from state
  topic: PropTypes.object,
  filters: PropTypes.object.isRequired,
  selectedSnapshot: PropTypes.object,
  latestSnapshot: PropTypes.object,
  latestState: PropTypes.object,
  latestUsableSnapshot: PropTypes.object,
  selectedTimespan: PropTypes.object,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topic: state.topics.selected.info,
  latestState: state.topics.selected.info.latestState,
  latestSnapshot: state.topics.selected.snapshots.latest,
  selectedSnapshot: state.topics.selected.snapshots.selected,
  latestUsableSnapshot: state.topics.selected.snapshots.latestUsableSnapshot,
  selectedTimespan: state.topics.selected.timespans.selected,
});

export default
injectIntl(
  connect(mapStateToProps)(
    TopicControlBar
  )
);
