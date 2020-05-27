import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { selectMedia, fetchMedia } from '../../../actions/topicActions';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import TopicStoriesContainer from '../provider/TopicStoriesContainer';
import TopicCountOverTimeContainer from '../provider/TopicCountOverTimeContainer';
import { updateFeedback } from '../../../actions/appActions';
import TopicWordCloudContainer from '../provider/TopicWordCloudContainer';
import messages from '../../../resources/messages';
import { RemoveButton, ReadItNowButton } from '../../common/IconButton';
import ComingSoon from '../../common/ComingSoon';
import MediaSourceIcon from '../../common/icons/MediaSourceIcon';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import StatBar from '../../common/statbar/StatBar';
import CollectionList from '../../common/CollectionList';
import SourceMetadataStatBar from '../../common/SourceMetadataStatBar';
import TopicPageTitle from '../TopicPageTitle';

const localMessages = {
  removeTitle: { id: 'media.details.remove', defaultMessage: 'Remove from Next Snapshot' },
  removeAbout: { id: 'media.details.remove.about', defaultMessage: 'If media source is clearly not related to the Topic, or is messing up your analysis, you can remove it from the next Snapshot.  Be careful, because this means it won\'t show up anywhere on the new Snapshot you generate.' },
  storyCount: { id: 'media.details.storyCount', defaultMessage: 'Stories in timespan' },
  collectionTitle: { id: 'media.details.collections.title', defaultMessage: 'Collections' },
  collectionIntro: { id: 'media.details.collections.info', defaultMessage: 'This source is in the following collections.' },
  noStories: { id: 'media.details.noStories', defaultMessage: 'This source has no stories in this timespan.' },
};

class MediaContainer extends React.Component {
  state = {
    open: false,
  };

  handleRemoveClick = () => {
    this.setState({ open: true });
  };

  handleRemoveDialogClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { media, mediaId, filters } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    const dialogActions = [
      <Button
        key="1"
        variant="outlined"
        label={formatMessage(messages.ok)}
        primary
        onClick={this.handleRemoveDialogClose}
      />,
    ];
    let summaryStats;
    if (filters.q) {
      // say "unknown" here because we can't query for this with a filter query in place :-(
      summaryStats = [
        { message: messages.mediaInlinks, data: formatMessage(messages.unknown) },
        { message: messages.inlinks, data: formatMessage(messages.unknown) },
        { message: messages.outlinks, data: formatMessage(messages.unknown) },
        { message: messages.facebookShares, data: formatMessage(messages.unknown) },
        { message: localMessages.storyCount, data: formatMessage(messages.unknown) },
      ];
    } else {
      summaryStats = [
        { message: messages.mediaInlinks, data: formatNumber(media.media_inlink_count) },
        { message: messages.inlinks, data: formatNumber(media.inlink_count) },
        { message: messages.outlinks, data: formatNumber(media.outlink_count) },
        { message: messages.facebookShares, data: formatNumber(media.facebook_share_count) },
        { message: localMessages.storyCount, data: formatNumber(media.story_count) },
      ];
    }
    return (
      <>
        <TopicPageTitle value={media.name} />
        <Grid>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <h1>
                <span className="actions">
                  <a href={media.url} target="_blank" rel="noopener noreferrer">
                    <ReadItNowButton />
                  </a>
                  <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
                    <RemoveButton tooltip={formatMessage(localMessages.removeTitle)} onClick={this.handleRemoveClick} />
                  </Permissioned>
                </span>
                <MediaSourceIcon height={32} />
                {media.name}
              </h1>
            </Col>
          </Row>
          <Dialog
            modal={false}
            open={this.state.open}
            onClose={this.handleRemoveDialogClose}
            className="app-dialog"
          >
            <DialogTitle>
              {formatMessage(localMessages.removeTitle)}
            </DialogTitle>
            <DialogActions>
              {dialogActions}
            </DialogActions>
            <DialogContent>
              <p><FormattedMessage {...localMessages.removeAbout} /></p>
              <ComingSoon />
            </DialogContent>
          </Dialog>
          <Row>
            <Col lg={12}>
              <StatBar stats={summaryStats} columnWidth={2} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <TopicCountOverTimeContainer titleMsg={messages.attention} uid="media" extraQueryClause={`media_id:${mediaId}`} />
            </Col>
          </Row>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <TopicStoriesContainer titleMsg={messages.stories} uid="media" extraQueryClause={`media_id:${mediaId}`} />
            </Col>
          </Row>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <TopicStoriesContainer extraArgs={{ linkToMediaId: mediaId }} titleMsg={messages.inlinks} uid="inlinking" />
            </Col>
          </Row>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <TopicStoriesContainer extraArgs={{ linkFromMediaId: mediaId }} titleMsg={messages.outlinks} uid="outlinked" />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <TopicWordCloudContainer
                title={messages.topWords}
                svgName={`media-${mediaId}`}
                extraQueryClause={`media_id:${mediaId}`}
                width={720}
                uid="media"
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6} xs={12}>
              <CollectionList
                title={formatMessage(localMessages.collectionTitle)}
                intro={formatMessage(localMessages.collectionIntro)}
                collections={media.media_source_tags}
                linkToFullUrl
              />
            </Col>
            <Col lg={6} xs={12}>
              <SourceMetadataStatBar source={media} columnWidth={6} />
            </Col>
          </Row>
        </Grid>
      </>
    );
  }
}

MediaContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from state
  filters: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  topicId: PropTypes.number.isRequired,
  media: PropTypes.object.isRequired,
  mediaId: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.topics.selected.mediaSource.info.fetchStatus,
  topicId: state.topics.selected.id,
  media: state.topics.selected.mediaSource.info,
  mediaId: parseInt(ownProps.params.mediaId, 10),
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(selectMedia(props.mediaId)); // save it to the state
  dispatch(fetchMedia(props.topicId, props.mediaId, props.filters))
    .catch(() => { // a 500
      // this means the media source has no stories in the timespan
      dispatch(updateFeedback({ open: true, message: props.intl.formatMessage(localMessages.noStories) }));
    });
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData, ['mediaId'])(
      MediaContainer
    )
  )
);
