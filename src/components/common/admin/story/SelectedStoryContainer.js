import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withAsyncData from '../../hocs/AsyncDataContainer';
import ActionMenu from '../../ActionMenu';
import { EditButton, ReadItNowButton, DownloadButton } from '../../IconButton';
import { fetchStory } from '../../../../actions/storyActions';
import TagListContainer from './TagListContainer';
import StoryEntitiesContainer from '../../story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../story/StoryNytThemesContainer';
import messages from '../../../../resources/messages';
import { urlToSource } from '../../../../lib/urlUtil';
import { TAG_SET_NYT_THEMES } from '../../../../lib/tagUtil';
import { trimToMaxLength } from '../../../../lib/stringUtil';
import { storyPubDateToTimestamp } from '../../../../lib/dateUtil';
import Permissioned from '../../Permissioned';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import StatBar from '../../statbar/StatBar';
import StoryRedditAttention from '../../story/StoryRedditAttention';
import StoryImages from '../../story/StoryImages';
import StoryQuoteTable from '../../story/StoryQuoteTable';

const localMessages = {
  title: { id: 'admin.story.title', defaultMessage: 'Admin Story Details: ' },
  close: { id: 'admin.story.inContext.close', defaultMessage: 'Close' },
  readThisStory: { id: 'admin.story.readThisStory', defaultMessage: 'Read This Story' },
  editThisStory: { id: 'admin.story.editThisStory', defaultMessage: 'Edit This Story' },
  published: { id: 'admin.story.published', defaultMessage: 'Published in {media}' },
  readCachedCopy: { id: 'admin.story.details.readCached', defaultMessage: 'Read Cached Text (admin only)' },
  viewCachedHtml: { id: 'admin.story.details.viewCachedHtml', defaultMessage: 'View Cached HTML (admin only)' },
  downloadAllTagsCsv: { id: 'admin.story.details.downloadTagsCsv', defaultMessage: 'Download all Story Tags' },
  storyOptions: { id: 'admin.story.details.storyOptions', defaultMessage: 'Story Options' },
  storyExtrasTitle: { id: 'admin.story.extras.title', defaultMessage: 'Other Custom Story Info' },
  storyExtrasDetails: { id: 'admin.story.extras.details', defaultMessage: 'Below is some extra info about this story that we\'ve pulled from other services, but isn\'t saved or searchable within our system.' },
};

class SelectedStoryContainer extends React.Component {
  goToUpdateUrl = (storyId) => {
    window.location = `admin/story/${storyId}/update`;
  }

  downloadCsv = (storyId) => {
    window.location = `/api/admin/story/${storyId}/storytags.csv`;
  }

  render() {
    const { selectedStory, selectedStoryId, handleStoryEditClick, handleStoryCachedTextClick } = this.props;
    const { formatDate, formatMessage } = this.props.intl;

    let content = null;
    if (selectedStoryId) {
      content = (
        <>
          <Row>
            <Col lg={12}>
              <ActionMenu actionTextMsg={messages.options}>
                <MenuItem onClick={() => window.open(selectedStory.url, '_blank')}>
                  <ListItemText><FormattedMessage {...localMessages.readThisStory} /></ListItemText>
                  <ListItemIcon><ReadItNowButton /></ListItemIcon>
                </MenuItem>
                <Permissioned onlyRole={PERMISSION_ADMIN}>
                  <MenuItem onClick={() => handleStoryCachedTextClick(selectedStoryId)}>
                    <ListItemText><FormattedMessage {...localMessages.readCachedCopy} /></ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => window.open(`/api/stories/${selectedStoryId}/raw.html`, '_blank')}>
                    <ListItemText><FormattedMessage {...localMessages.viewCachedHtml} /></ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleStoryEditClick(selectedStoryId)}>
                    <ListItemText><FormattedMessage {...localMessages.editThisStory} /></ListItemText>
                    <ListItemIcon><EditButton tooltip={formatMessage(localMessages.editThisStory)} /></ListItemIcon>
                  </MenuItem>
                  <MenuItem onClick={() => this.downloadCsv(selectedStoryId)}>
                    <ListItemText>
                      <FormattedMessage {...localMessages.downloadAllTagsCsv} />
                    </ListItemText>
                    <ListItemIcon>
                      <DownloadButton />
                    </ListItemIcon>
                  </MenuItem>
                </Permissioned>
              </ActionMenu>
              <h2>
                <FormattedMessage {...localMessages.title} />
                <a href={selectedStory.url} target="_blank" rel="noopener noreferrer">{trimToMaxLength(selectedStory.title, 80)}</a>
              </h2>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StatBar
                columnWidth={2}
                stats={[
                  { message: messages.sourceName,
                    data: (
                      <a href={urlToSource(selectedStory.media.media_id)} target="_blank" rel="noopener noreferrer">
                        {selectedStory.media_name || selectedStory.media.name}
                      </a>
                    ),
                  },
                  { message: messages.storyDate,
                    data: formatDate(storyPubDateToTimestamp(selectedStory.publish_date)),
                  },
                  { message: messages.language,
                    data: selectedStory.language ? selectedStory.language : '?',
                  },
                  { message: messages.mediaType,
                    data: selectedStory.media.metadata.media_type ? selectedStory.media.metadata.media_type.label : '?',
                    helpTitleMsg: messages.mediaTypeHelpTitle,
                    helpContentMsg: messages.mediaTypeHelpContent,
                  },
                  { message: messages.pubCountry,
                    data: selectedStory.media.metadata.pub_country ? selectedStory.media.metadata.pub_country.label : '?',
                  },
                  { message: messages.pubState,
                    data: selectedStory.media.metadata.pub_state ? selectedStory.media.metadata.pub_state.label : '?' },
                ]}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={9}>
              <StoryEntitiesContainer storyId={selectedStoryId} />
            </Col>
            <Col lg={3}>
              <StoryNytThemesContainer
                storyId={selectedStoryId}
                tags={selectedStory.story_tags ? selectedStory.story_tags.filter(t => t.tag_sets_id === TAG_SET_NYT_THEMES) : []}
                hideFullListOption
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <TagListContainer story={selectedStory} />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <h1><FormattedMessage {...localMessages.storyExtrasTitle} /></h1>
              <p><FormattedMessage {...localMessages.storyExtrasDetails} /></p>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryRedditAttention storyId={selectedStory.stories_id} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryImages storyId={selectedStory.stories_id} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoryQuoteTable storyId={selectedStory.stories_id} />
            </Col>
          </Row>
        </>
      );
    }
    return content;
  }
}

SelectedStoryContainer.propTypes = {
  // from store
  fetchStatus: PropTypes.string.isRequired,
  selectedStory: PropTypes.object.isRequired,
  selectedStoryId: PropTypes.number,
  // from context
  intl: PropTypes.object.isRequired,
  handleStoryCachedTextClick: PropTypes.func.isRequired,
  handleStoryEditClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.info.fetchStatus,
  selectedStory: state.story.info,
  selectedStoryId: state.story.info.stories_id,
});

const mapDispatchToProps = dispatch => ({
  handleStoryCachedTextClick: (storiesId) => {
    dispatch(push(`admin/story/${storiesId}/cached`));
  },
  handleStoryEditClick: (storiesId) => {
    dispatch(push(`admin/story/${storiesId}/update`));
  },
});

const fetchAsyncData = (dispatch, { id }) => dispatch(fetchStory(id, { text: true }));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['id'])(
      SelectedStoryContainer
    )
  )
);
