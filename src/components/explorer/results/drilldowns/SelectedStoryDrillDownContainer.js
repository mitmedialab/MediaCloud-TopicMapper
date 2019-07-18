import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { CloseButton } from '../../../common/IconButton';
import { resetStory } from '../../../../actions/storyActions';
import DataCard from '../../../common/DataCard';
import ActionMenu from '../../../common/ActionMenu';
import StoryEntitiesContainer from '../../../common/story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../../common/story/StoryNytThemesContainer';
import messages from '../../../../resources/messages';
import { urlToSource } from '../../../../lib/urlUtil';
import { TAG_SET_NYT_THEMES } from '../../../../lib/tagUtil';
import { trimToMaxLength, extractWordsFromQuery } from '../../../../lib/stringUtil';
import { storyPubDateToTimestamp } from '../../../../lib/dateUtil';
import Permissioned from '../../../common/Permissioned';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import StatBar from '../../../common/statbar/StatBar';

const localMessages = {
  title: { id: 'word.inContext.title', defaultMessage: 'Story Info: ' },
  close: { id: 'drilldown.story.inContext.close', defaultMessage: 'Close' },
  readThisStory: { id: 'drilldown.story.readThisStory', defaultMessage: 'Read This Story' },
  fullDescription: { id: 'explorer.story.fullDescription', defaultMessage: 'Published in {media} on {publishDate} in {language}' },
  published: { id: 'explorer.story.published', defaultMessage: 'Published in {media}' },
  adminOptions: { id: 'drilldown.adminOptions.title', defaultMessage: 'Admin Options...' },
  goToManageStory: { id: 'drilldown.adminOptions.manageStory', defaultMessage: 'Manage Story' },
  highlightedCachedText: { id: 'drilldown.adminOptions.highlightedCachedText', defaultMessage: 'Cached Text (highlighted)' },
};

class SelectedStoryDrillDownContainer extends React.Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    const { selectedStory, lastSearchTime } = this.props;
    return (nextProps.lastSearchTime !== lastSearchTime || nextProps.selectedStory !== selectedStory);
  }

  componentDidUpdate(prevProps) {
    const { selectedStory } = this.props;
    const prevSelectedStory = prevProps.selectedStory;
    const rootNode = this.rootRef;
    // have to treat this node carefully, because it might not be showing
    if (rootNode && rootNode.current && selectedStory && (selectedStory !== prevSelectedStory)) {
      rootNode.current.scrollIntoView();
    }
  }

  openNewPage = (url) => {
    window.open(url, '_blank');
  }

  render() {
    const { selectedStory, storyInfo, handleClose } = this.props;
    const { formatDate } = this.props.intl;

    let content = null;
    if (selectedStory) {
      content = (
        <div className="drill-down" ref={this.rootRef}>
          <DataCard className="query-story-drill-down">
            <Row>
              <Col lg={12}>
                <div className="actions">
                  <Permissioned onlyRole={PERMISSION_ADMIN}>
                    <ActionMenu actionTextMsg={localMessages.adminOptions}>
                      <MenuItem onClick={() => window.open(`/#/admin/story/${storyInfo.stories_id}/details`, '_blank')}>
                        <ListItemText><FormattedMessage {...localMessages.goToManageStory} /></ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => window.open(`/#/admin/story/${storyInfo.stories_id}/cached?search=${extractWordsFromQuery(storyInfo.search)}`, '_blank')}>
                        <ListItemText><FormattedMessage {...localMessages.highlightedCachedText} /></ListItemText>
                      </MenuItem>
                    </ActionMenu>
                  </Permissioned>
                  <CloseButton onClick={handleClose} />
                </div>
                <h2>
                  <FormattedMessage {...localMessages.title} />
                  <a href={storyInfo.url} target="_blank" rel="noopener noreferrer">{trimToMaxLength(storyInfo.title, 80)}</a>
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
                        <a href={urlToSource(storyInfo.media_id)} target="_blank" rel="noopener noreferrer">
                          {storyInfo.media_name || storyInfo.media.name}
                        </a>
                      ),
                    },
                    { message: messages.storyDate,
                      data: formatDate(storyPubDateToTimestamp(storyInfo.publish_date)),
                    },
                    { message: messages.language,
                      data: storyInfo.language ? storyInfo.language : '?',
                    },
                    { message: messages.mediaType,
                      data: storyInfo.media.metadata.media_type ? storyInfo.media.metadata.media_type.label : '?',
                      helpTitleMsg: messages.mediaTypeHelpTitle,
                      helpContentMsg: messages.mediaTypeHelpContent,
                    },
                    { message: messages.pubCountry,
                      data: storyInfo.media.metadata.pub_country ? storyInfo.media.metadata.pub_country.label : '?',
                    },
                    { message: messages.pubState,
                      data: storyInfo.media.metadata.pub_state ? storyInfo.media.metadata.pub_state.label : '?' },
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={9}>
                <StoryEntitiesContainer storyId={selectedStory} />
              </Col>
              <Col lg={3}>
                <StoryNytThemesContainer
                  storyId={selectedStory}
                  tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_NYT_THEMES) : []}
                  hideFullListOption
                />
              </Col>
            </Row>
          </DataCard>
        </div>
      );
    }
    return content;
  }
}

SelectedStoryDrillDownContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from store
  fetchStatus: PropTypes.string.isRequired,
  storyInfo: PropTypes.object,
  selectedStory: PropTypes.number,
  // from dispatch
  handleClose: PropTypes.func.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
};


const mapStateToProps = state => ({
  fetchStatus: state.explorer.stories.fetchStatus,
  storyInfo: state.story.info,
  selectedStory: state.story.info.stories_id,
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => {
    dispatch(resetStory());
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SelectedStoryDrillDownContainer
  )
);
