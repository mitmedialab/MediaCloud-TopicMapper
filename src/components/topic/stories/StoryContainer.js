import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Link from 'react-router/lib/Link';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { selectStory, fetchStory } from '../../../actions/storyActions';
import { fetchTopicStoryInfo } from '../../../actions/topicActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import TopicStoriesContainer from '../provider/TopicStoriesContainer';
import ActionMenu from '../../common/ActionMenu';
import TabSelector from '../../common/TabSelector';
import StoryEntitiesContainer from '../../common/story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../common/story/StoryNytThemesContainer';
import StoryImages from '../../common/story/StoryImages';
import { TAG_SET_GEOGRAPHIC_PLACES, TAG_SET_NYT_THEMES } from '../../../lib/tagUtil';
import StoryDetails from '../../common/story/StoryDetails';
import StoryPlaces from './StoryPlaces';
import messages from '../../../resources/messages';
import { EditButton, ReadItNowButton } from '../../common/IconButton';
import StoryIcon from '../../common/icons/StoryIcon';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_STORY_EDIT, PERMISSION_ADMIN } from '../../../lib/auth';
import StatBar from '../../common/statbar/StatBar';
import { trimToMaxLength, extractWordsFromQuery } from '../../../lib/stringUtil';
import { filteredLinkTo, urlWithFilters } from '../../util/location';
import TopicPageTitle from '../TopicPageTitle';
import StoryRedditAttention from '../../common/story/StoryRedditAttention';
import StoryUrlSharingCounts from './StoryUrlSharingCounts';
import TopicWordCloudContainer from '../provider/TopicWordCloudContainer';
import { safeStoryDate } from '../../common/StoryTable';

const MAX_STORY_TITLE_LENGTH = 70; // story titles longer than this will be trimmed and ellipses added

const localMessages = {
  unknownLanguage: { id: 'story.details.language.unknown', defaultMessage: 'Unknown' },
  toolStoryManagement: { id: 'story.details.manage', defaultMessage: 'Go To Story Management' },
  editStory: { id: 'story.details.edit', defaultMessage: 'Edit This Story' },
  readStory: { id: 'story.details.read', defaultMessage: 'Read at Original URL' },
  readCachedCopy: { id: 'story.details.readCached', defaultMessage: 'Read Cached Text (admin only)' },
  viewCachedHtml: { id: 'story.details.viewCachedHtml', defaultMessage: 'View Cached HTML (admin only)' },
  storyOptions: { id: 'story.details.storyOptions', defaultMessage: 'Story Options' },
  mediaSourceInfo: { id: 'admin.story.fullDescription', defaultMessage: 'Published in {media} on {publishDate}' },
  publishedIn: { id: 'story.details.publishedIn', defaultMessage: 'Published In ' },
  basicInfo: { id: 'story.details.basicInfo', defaultMessage: 'Basic Info' },
  links: { id: 'story.details.links', defaultMessage: 'Links' },
  images: { id: 'story.details.images', defaultMessage: 'Images' },
  socialSharing: { id: 'story.details.socialSharing', defaultMessage: 'Social Sharing ' },
};

class StoryContainer extends React.Component {
  state = {
    selectedTab: 0,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { refetchAsyncData } = this.props;
    if (nextProps.storiesId !== this.props.storiesId) {
      refetchAsyncData(nextProps);
    }
  }

  render() {
    const { storyInfo, topicStoryInfo, topicId, storiesId, topicPlatforms,
      handleStoryCachedTextClick, handleStoryEditClick, filters, topicSeedQuery, intl } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    const mediaUrl = `/topics/${topicId}/media/${storyInfo.media.media_id}`;

    // use tabs to figure out which content to show
    let viewContent;
    switch (this.state.selectedTab) {
      case 0: // basic info
        viewContent = (
          <>
            <Row>
              <Col lg={12}>
                <StatBar
                  stats={[
                    { message: messages.mediaInlinks, data: formatNumber(topicStoryInfo.media_inlink_count) },
                    { message: messages.inlinks, data: formatNumber(topicStoryInfo.inlink_count) },
                    { message: messages.outlinks, data: formatNumber(topicStoryInfo.outlink_count) },
                    { message: messages.facebookShares, data: formatNumber(topicStoryInfo.facebook_share_count) },
                    { message: messages.language, data: storyInfo.language || formatMessage(localMessages.unknownLanguage) },
                    { message: messages.storyDate, data: safeStoryDate(storyInfo, intl).text },
                  ]}
                  columnWidth={2}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <StoryDetails mediaLink={urlWithFilters(mediaUrl, filters).substring(2)} story={storyInfo} />
              </Col>
            </Row>
          </>
        );
        break;
      case 1: // inlinks/outlinks
        viewContent = (
          <>
            <Row>
              <Col lg={12}>
                <TopicStoriesContainer extraArgs={{ linkToStoriesId: storiesId }} titleMsg={messages.inlinks} uid="inlinking" />
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <TopicStoriesContainer extraArgs={{ linkFromStoriesId: storiesId }} titleMsg={messages.outlinks} uid="outlinked" />
              </Col>
            </Row>
          </>
        );
        break;
      case 2: // langauge
        viewContent = (
          <>
            <Row>
              <Col lg={12}>
                <TopicWordCloudContainer
                  title={messages.topWords}
                  svgName={`story-${storiesId}`}
                  extraQueryClause={`stories_id:${storiesId}`}
                  width={720}
                  uid="story"
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <StoryNytThemesContainer
                  storyId={storiesId}
                  tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_NYT_THEMES) : []}
                />
              </Col>
            </Row>
          </>
        );
        break;
      case 3: // entites
        viewContent = (
          <>
            <Row>
              <Col lg={12}>
                <StoryEntitiesContainer storyId={storiesId} />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <StoryPlaces
                  tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_GEOGRAPHIC_PLACES) : []}
                  geocoderVersion={storyInfo.geocoderVersion}
                />
              </Col>
            </Row>
          </>
        );
        break;
      case 4: // images
        viewContent = (
          <Row>
            <Col lg={12}>
              <StoryImages storyId={storiesId} />
            </Col>
          </Row>
        );
        break;
      case 5: // social data
        viewContent = (
          <>
            <StoryUrlSharingCounts story={topicStoryInfo} platforms={topicPlatforms} />
            <Row>
              <Col lg={12}>
                <StoryRedditAttention storyId={storiesId} />
              </Col>
            </Row>
          </>
        );
        break;
      default:
        viewContent = '';
        break;
    }
    return (
      <div>
        <TopicPageTitle value={trimToMaxLength(storyInfo.title, 20)} />
        <Grid>
          <Row>
            <Col lg={12}>
              <h1>
                <ActionMenu actionTextMsg={localMessages.storyOptions}>
                  <MenuItem onClick={() => window.open(storyInfo.url, '_blank')}>
                    <ListItemText><FormattedMessage {...localMessages.readStory} /></ListItemText>
                    <ListItemIcon><ReadItNowButton /></ListItemIcon>
                  </MenuItem>
                  <Permissioned onlyTopic={PERMISSION_ADMIN}>
                    <MenuItem
                      onClick={() => handleStoryCachedTextClick(
                        topicId, storiesId, filters, extractWordsFromQuery(topicSeedQuery)
                      )}
                    >
                      <ListItemText><FormattedMessage {...localMessages.readCachedCopy} /></ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => window.open(`/api/stories/${storyInfo.stories_id}/raw.html`, '_blank')}>
                      <ListItemText><FormattedMessage {...localMessages.viewCachedHtml} /></ListItemText>
                    </MenuItem>
                  </Permissioned>
                  <Permissioned onlyRole={PERMISSION_STORY_EDIT}>
                    <MenuItem onClick={() => handleStoryEditClick(storiesId)}>
                      <ListItemText><FormattedMessage {...localMessages.editStory} /></ListItemText>
                      <ListItemIcon><EditButton tooltip={formatMessage(localMessages.editStory)} /></ListItemIcon>
                    </MenuItem>
                  </Permissioned>
                </ActionMenu>
                <StoryIcon height={32} />
                {trimToMaxLength(storyInfo.title, MAX_STORY_TITLE_LENGTH)}
              </h1>
              <h2>
                <FormattedMessage {...localMessages.publishedIn} />
                <Link to={filteredLinkTo(mediaUrl, filters)}>{storyInfo.media.name}</Link>
              </h2>
            </Col>
          </Row>
          <Row>
            <TabSelector
              tabLabels={[
                // basic info
                formatMessage(localMessages.basicInfo),
                // inlinks/oulinks
                formatMessage(localMessages.links),
                // language
                formatMessage(messages.language),
                // entities
                formatMessage(messages.representation),
                // images
                formatMessage(localMessages.images),
                // social
                formatMessage(localMessages.socialSharing),
              ]}
              onViewSelected={index => this.setState({ selectedTab: index })}
            />
          </Row>
          {viewContent}
        </Grid>
      </div>
    );
  }
}

StoryContainer.propTypes = {
  // from context
  params: PropTypes.object.isRequired, // params from router
  intl: PropTypes.object.isRequired,
  // from compositional chain
  dispatch: PropTypes.func.isRequired,
  // from dispatch
  refetchAsyncData: PropTypes.func.isRequired,
  handleStoryCachedTextClick: PropTypes.func.isRequired,
  handleStoryEditClick: PropTypes.func.isRequired,
  // from state
  topicStoryInfo: PropTypes.object.isRequired,
  storyInfo: PropTypes.object.isRequired,
  storiesId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  topicSeedQuery: PropTypes.string.isRequired,
  topicPlatforms: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => ({
  // check both of these to the spinner doesn't stop until the topic-specific stats are ready
  fetchStatus: [state.story.info.fetchStatus, state.topics.selected.story.info.fetchStatus],
  filters: state.topics.selected.filters,
  storiesId: parseInt(ownProps.params.storiesId, 10),
  topicId: state.topics.selected.id,
  topicSeedQuery: state.topics.selected.info.solr_seed_query,
  topicStoryInfo: state.topics.selected.story.info,
  storyInfo: state.story.info,
  topicPlatforms: state.topics.selected.snapshots.selected.platform_seed_queries,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(selectStory({ id: props.storiesId }));
  const q = {
    ...props.filters,
    id: props.topicId,
  };
  dispatch(fetchStory(props.storiesId, q));
  dispatch(fetchTopicStoryInfo(props.topicId, props.storiesId, props.filters));
};

const mapDispatchToProps = dispatch => ({
  refetchAsyncData: (props) => {
    fetchAsyncData(dispatch, props);
  },
  handleStoryCachedTextClick: (topicId, storiesId, filters, searchStr) => {
    dispatch(push(filteredLinkTo(`topics/${topicId}/stories/${storiesId}/cached`, filters, { search: searchStr })));
  },
  handleStoryEditClick: (storiesId) => {
    dispatch(push(`admin/story/${storiesId}/update`)); // to admin page
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      StoryContainer
    )
  )
);
