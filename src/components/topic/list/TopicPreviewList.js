import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedDate } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import DataCard from '../../common/DataCard';
import FavoriteToggler from '../../common/FavoriteToggler';
import { TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING,
  TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED, TOPIC_SNAPSHOT_STATE_COMPLETED }
  from '../../../reducers/topics/selected/snapshots';
import { ErrorNotice, DetailNotice, InfoNotice } from '../../common/Notice';
import { trimToMaxLength } from '../../../lib/stringUtil';
import TopicOwnerList from '../TopicOwnerList';
import { topicMessageSaysTooBig } from '../../../reducers/topics/adminList';
import { storyCountFromJobMessage } from '../versions/homepages/TopicVersionTooBigStatusContainer';

const MAX_TOPIC_STATUS_DETAILS_LEN = 120;

const localMessages = {
  range: { id: 'topitopic.list.range', defaultMessage: '{start} - {end}' },
  topicStatusNote: { id: 'topitopic.list.state', defaultMessage: 'This topic is {state}' },
  topicErrorNote: { id: 'topitopic.list.error', defaultMessage: 'This topic has an error' },
  topicTooBigNote: { id: 'topitopic.list.error.tooBig', defaultMessage: 'This topic is too big' },
  tooBigDetails: { id: 'topitopic.list.error.tooBigDetails', defaultMessage: 'Your topic has {storyCount} stories, which is more than you are allowed to have.' },
  topicReadyNote: { id: 'topitopic.list.completed', defaultMessage: 'This topic is ready to use' },
};

const TopicPreviewList = (props) => {
  const { topics, linkGenerator, onSetFavorited, emptyMsg, hideState } = props;
  let content = null;
  if (topics && topics.length > 0) {
    content = (
      topics.map((topic, idx) => {
        let topicStateNotice;
        if (topic.latestState.state === TOPIC_SNAPSHOT_STATE_ERROR) {
          if (topicMessageSaysTooBig(topic.latestState.message)) {
            topicStateNotice = (
              <ErrorNotice
                details={props.intl.formatMessage(
                  localMessages.tooBigDetails,
                  { storyCount: props.intl.formatNumber(storyCountFromJobMessage(topic.latestState.message)) }
                )}
              >
                <FormattedMessage {...localMessages.topicTooBigNote} />
              </ErrorNotice>
            );
          } else {
            topicStateNotice = (
              <ErrorNotice details={trimToMaxLength(topic.latestState.message, MAX_TOPIC_STATUS_DETAILS_LEN)}>
                <FormattedMessage {...localMessages.topicErrorNote} />
              </ErrorNotice>
            );
          }
        } else if (topic.latestState.state === TOPIC_SNAPSHOT_STATE_QUEUED
          || topic.latestState.state === TOPIC_SNAPSHOT_STATE_RUNNING
          || topic.latestState.state === TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED) {
          topicStateNotice = (
            <DetailNotice details={trimToMaxLength(topic.latestState.message, MAX_TOPIC_STATUS_DETAILS_LEN)}>
              <FormattedMessage {...localMessages.topicStatusNote} values={{ state: topic.latestState.state }} />
            </DetailNotice>
          );
        } else if (topic.latestState.state === TOPIC_SNAPSHOT_STATE_COMPLETED) {
          topicStateNotice = (
            <InfoNotice>
              <FormattedMessage {...localMessages.topicReadyNote} />
            </InfoNotice>
          );
        }
        return (
          <Col lg={4} key={`topic-item-${idx}`}>
            <div className="topic-preview-list-item">
              <DataCard>
                <div className="content" id={`topic-preview-${topic.topics_id}`}>
                  <>
                    { onSetFavorited && (
                      <FavoriteToggler
                        isFavorited={topic.isFavorite}
                        onSetFavorited={isFav => onSetFavorited(topic.topics_id, isFav)}
                      />
                    )}
                    <h2><Link to={linkGenerator(topic)}>{topic.name}</Link></h2>
                    <FormattedMessage
                      {...localMessages.range}
                      values={{
                        start: <FormattedDate value={topic.start_date} month="short" year="numeric" day="numeric" />,
                        end: <FormattedDate value={topic.end_date} month="short" year="numeric" day="numeric" />,
                      }}
                    />
                    <p>{topic.description}</p>
                    <TopicOwnerList owners={topic.owners} />
                  </>
                  {!hideState && topicStateNotice}
                </div>
              </DataCard>
            </div>
          </Col>
        );
      })
    );
  } else if (emptyMsg) {
    content = (
      <p><FormattedMessage {...emptyMsg} /></p>
    );
  }
  return (
    <Grid className="topic-preview-list">
      <Row>
        {content}
      </Row>
    </Grid>
  );
};

TopicPreviewList.propTypes = {
  // from parent
  linkGenerator: PropTypes.func,
  topics: PropTypes.array.isRequired,
  onSetFavorited: PropTypes.func,
  emptyMsg: PropTypes.object,
  hideState: PropTypes.bool,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  connect(null)(
    TopicPreviewList
  )
);
