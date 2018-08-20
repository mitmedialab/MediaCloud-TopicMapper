import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedDate } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import Icon from '@material-ui/core/Icon';
import DataCard from '../../common/DataCard';
import FavoriteToggler from '../../common/FavoriteToggler';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import messages from '../../../resources/messages';
import { TOPIC_SNAPSHOT_STATE_COMPLETED } from '../../../reducers/topics/selected/snapshots';

const localMessages = {
  range: { id: 'topitopic.list.range', defaultMessage: '{start} - {end}' },
  createdBy: { id: 'topitopic.list.createdBy', defaultMessage: 'Created by: ' },
  errorInTopic: { id: 'topitopic.list.error', defaultMessage: 'Error In Topic...' },
};

const TopicPreviewList = (props) => {
  const { topics, linkGenerator, onSetFavorited, emptyMsg } = props;
  let content = null;
  if (topics && topics.length > 0) {
    content = (
      topics.map((topic, idx) => {
        let ownerListContent;
        if (topic.owners.length > 0) {
          ownerListContent = topic.owners.map(u => u.full_name).join(', ');
        } else {
          ownerListContent = <FormattedMessage {...messages.unknown} />;
        }

        let errorNotice = null;
        if (topic.state !== TOPIC_SNAPSHOT_STATE_COMPLETED) {
          errorNotice = (
            <div>
              <Icon className="material-icons" color="error">error</Icon>
              <Link to={linkGenerator(topic)}><FormattedMessage {...localMessages.errorInTopic} /></Link>;
            </div>
          );
        }
        return (
          <Col lg={4} key={`topic-item-${idx}`}>
            <DataCard className="topic-preview-list-item">
              <div className="content" id={`topic-preview-${topic.topics_id}`}>
                <div>
                  <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
                    <FavoriteToggler
                      isFavorited={topic.isFavorite}
                      onSetFavorited={isFav => onSetFavorited(topic.topics_id, isFav)}
                    />
                  </Permissioned>
                  <h2><Link to={linkGenerator(topic)}>{topic.name}</Link></h2>
                  {errorNotice}
                  <FormattedMessage
                    {...localMessages.range}
                    values={{
                      start: <FormattedDate value={topic.start_date} month="short" year="numeric" day="numeric" />,
                      end: <FormattedDate value={topic.end_date} month="short" year="numeric" day="numeric" />,
                    }}
                  />
                  <p>{topic.description}</p>
                  <p><FormattedMessage {...localMessages.createdBy} /><i>{ownerListContent}</i></p>
                </div>
              </div>
            </DataCard>
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
  // from compositional chain
  intl: PropTypes.object.isRequired,
};


export default
  injectIntl(
    connect(null)(
      TopicPreviewList
    )
  );
