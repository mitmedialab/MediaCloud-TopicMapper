import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { selectStory, fetchStory } from '../../../actions/storyActions';
import { fetchTopicStoryInfo } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import StoryWordsContainer from './StoryWordsContainer';
import StoryInlinksContainer from './StoryInlinksContainer';
import StoryOutlinksContainer from './StoryOutlinksContainer';
import StoryActionMenu from '../../common/StoryActionMenu';
import StoryEntitiesContainer from '../../common/story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../common/story/StoryNytThemesContainer';
import { TAG_SET_GEOGRAPHIC_PLACES, TAG_SET_NYT_THEMES } from '../../../lib/tagUtil';
import StoryDetails from '../../common/story/StoryDetails';
import StoryPlaces from './StoryPlaces';
import messages from '../../../resources/messages';
import { EditButton, RemoveButton, ReadItNowButton } from '../../common/IconButton';
import ComingSoon from '../../common/ComingSoon';
import StoryIcon from '../../common/icons/StoryIcon';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE, PERMISSION_STORY_EDIT } from '../../../lib/auth';
import StatBar from '../../common/statbar/StatBar';
import AppButton from '../../common/AppButton';
import { urlToTopicMapper } from '../../../lib/urlUtil';

const MAX_STORY_TITLE_LENGTH = 70;  // story titles longer than this will be trimmed and ellipses added

const localMessages = {
  mainTitle: { id: 'story.details.mainTitle', defaultMessage: 'Story: {title}' },
  removeTitle: { id: 'story.details.remove', defaultMessage: 'Remove from Next Snapshot' },
  removeAbout: { id: 'story.details.remove.about', defaultMessage: 'If story is clearly not related to the Topic, or is messing up your analysis, you can remove it from the next Snapshot.  Be careful, because this means it won\'t show up anywhere on the new Snapshot you generate.' },
  unknownLanguage: { id: 'story.details.language.unknown', defaultMessage: 'Unknown' },
  editStory: { id: 'story.details.edit', defaultMessage: 'Edit This Story' },
  readStory: { id: 'story.details.read', defaultMessage: 'Read This Story' },
  removeStory: { id: 'story.details.remove', defaultMessage: 'Remove From Topic' },
  readCachedCopy: { id: 'story.details.readCached', defaultMessage: 'Read Cached Copy' },
};

class StoryContainer extends React.Component {

  state = {
    open: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.storiesId !== this.props.storiesId) {
      const { fetchData } = this.props;
      fetchData(nextProps.storiesId, nextProps.filters);
    }
  }

  handleRemoveClick = () => {
    this.setState({ open: true });
  };

  handleRemoveDialogClose = () => {
    this.setState({ open: false });
  };

  goToEdit = (topicId, storiesId) => {
    window.location = urlToTopicMapper(`topics/${topicId}/stories/${storiesId}/update`);
  };

  goToStory = (url) => {
    // target="_blank"
    window.open = url;
  };

  goToCachedCopy = (topicId, storiesId) => {
    window.location = urlToTopicMapper(`topics/${topicId}/stories/${storiesId}/cached`);
  };

  render() {
    const { storyInfo, topicStoryInfo, topicId, storiesId, topicName } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    let displayTitle = storyInfo.title;
    if (storyInfo.title && storyInfo.title.length > MAX_STORY_TITLE_LENGTH) {
      displayTitle = `${storyInfo.title.substr(0, MAX_STORY_TITLE_LENGTH)}...`;
    }
    const dialogActions = [
      <AppButton
        label={formatMessage(messages.ok)}
        primary
        onTouchTap={this.handleRemoveDialogClose}
      />,
    ];
    return (
      <div>
        <Helmet><title>{formatMessage(localMessages.mainTitle, { title: displayTitle })}</title></Helmet>
        <Grid>
          <Row>
            <Col lg={12}>
              <h1>
                <StoryActionMenu>
                  <Permissioned onlyRole={PERMISSION_STORY_EDIT}>
                    <MenuItem onClick={() => this.goToEdit(topicId, storiesId)}>
                      <ListItemText><FormattedMessage {...localMessages.editStory} /></ListItemText>
                      <ListItemIcon><EditButton tooltip={formatMessage(localMessages.editStory)} /></ListItemIcon>
                    </MenuItem>
                  </Permissioned>
                  <MenuItem onClick={() => this.goToStory(storyInfo.url)}>
                    <ListItemText><FormattedMessage {...localMessages.readStory} /></ListItemText>
                    <ListItemIcon><ReadItNowButton /></ListItemIcon>
                  </MenuItem>
                  <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
                    <MenuItem onClick={this.handleRemoveClick}>
                      <ListItemText><FormattedMessage {...localMessages.removeStory} /></ListItemText>
                      <ListItemIcon><RemoveButton tooltip={formatMessage(localMessages.removeTitle)} /></ListItemIcon>
                    </MenuItem>
                  </Permissioned>
                  <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
                    <MenuItem onClick={() => this.goToCachedCopy(topicId, storiesId)}>
                      <ListItemText><FormattedMessage {...localMessages.readCachedCopy} /></ListItemText>
                      <ListItemIcon><ReadItNowButton tooltip={formatMessage(localMessages.readCachedCopy)} /></ListItemIcon>
                    </MenuItem>
                  </Permissioned>
                </StoryActionMenu>
                <StoryIcon height={32} />
                {displayTitle}
              </h1>
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
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StatBar
                stats={[
                  { message: messages.mediaInlinks, data: formatNumber(topicStoryInfo.media_inlink_count) },
                  { message: messages.inlinks, data: formatNumber(topicStoryInfo.inlink_count) },
                  { message: messages.outlinks, data: formatNumber(topicStoryInfo.outlink_count) },
                  { message: messages.facebookShares, data: formatNumber(topicStoryInfo.facebook_share_count) },
                  { message: messages.language, data: storyInfo.language || formatMessage(localMessages.unknownLanguage) },
                ]}
                columnWidth={2}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryInlinksContainer topicId={topicId} storiesId={storiesId} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryOutlinksContainer topicId={topicId} storiesId={storiesId} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryWordsContainer topicId={topicId} storiesId={storiesId} topicName={topicName} />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <StoryPlaces
                tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_GEOGRAPHIC_PLACES) : []}
                geocoderVersion={storyInfo.geocoderVersion}
              />
            </Col>
            <Col lg={6}>
              <StoryNytThemesContainer
                storyId={storiesId}
                tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_NYT_THEMES) : []}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <StoryDetails mediaLink={urlToTopicMapper(topicId)} story={storyInfo} />
            </Col>
          </Row>
          <Row>
            <Col lg={12} >
              <StoryEntitiesContainer storyId={storiesId} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

StoryContainer.propTypes = {
  // from context
  params: PropTypes.object.isRequired,       // params from router
  intl: PropTypes.object.isRequired,
  // from parent
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  // from state
  topicStoryInfo: PropTypes.object.isRequired,
  storyInfo: PropTypes.object.isRequired,
  storiesId: PropTypes.number.isRequired,
  topicName: PropTypes.string.isRequired,
  topicId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.story.info.fetchStatus,
  filters: state.topics.selected.filters,
  storiesId: parseInt(ownProps.params.storiesId, 10),
  topicId: state.topics.selected.id,
  topicName: state.topics.selected.info.name,
  topicStoryInfo: state.topics.selected.story.info,
  storyInfo: state.story.info,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (storiesId, filters) => {
    dispatch(selectStory(storiesId));
    const q = {
      ...filters,
      id: ownProps.params.topicId,
    };
    dispatch(fetchStory(storiesId, q));
    dispatch(fetchTopicStoryInfo(ownProps.params.topicId, storiesId, filters));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => dispatchProps.fetchData(stateProps.storiesId, stateProps.filters),
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withAsyncFetch(
        StoryContainer
      )
    )
  );
