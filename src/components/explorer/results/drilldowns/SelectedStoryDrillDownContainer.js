import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Row, Col } from 'react-flexbox-grid/lib';
import ActionMenu from '../../../common/ActionMenu';
import { resetStory } from '../../../../actions/storyActions';
import withHelp from '../../../common/hocs/HelpfulContainer';
import DataCard from '../../../common/DataCard';
import StoryEntitiesContainer from '../../../common/story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../../common/story/StoryNytThemesContainer';
import messages from '../../../../resources/messages';
import { urlToSource } from '../../../../lib/urlUtil';
import { ACTION_MENU_ITEM_CLASS } from '../../../../lib/explorerUtil';
import { TAG_SET_NYT_THEMES } from '../../../../lib/tagUtil';
import { trimToMaxLength } from '../../../../lib/stringUtil';
import StatBar from '../../../common/statbar/StatBar';

const localMessages = {
  title: { id: 'word.inContext.title', defaultMessage: 'Story Details: ' },
  helpTitle: { id: 'word.inContext.help.title', defaultMessage: 'About Word in Context' },
  helpText: { id: 'word.inContext.help.text',
    defaultMessage: '<p>It is helpful to look at how a word is used, in addition to the fact that it is used.  While a word cloud can tell you what words are used, this interactive visualization can help you explore the use of a word in context.</p>',
  },
  close: { id: 'drilldown.story.inContext.close', defaultMessage: 'Close' },
  readThisStory: { id: 'drilldown.story.readThisStory', defaultMessage: 'Read This Story' },
  fullDescription: { id: 'explorer.story.fullDescription', defaultMessage: 'Published in {media} on {publishDate} in {language}' },
  published: { id: 'explorer.story.published', defaultMessage: 'Published in {media}' },
};

class SelectedStoryDrillDownContainer extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { selectedStory, lastSearchTime } = this.props;
    return (nextProps.lastSearchTime !== lastSearchTime || nextProps.selectedStory !== selectedStory);
  }
  openNewPage = (url) => {
    window.open(url, '_blank');
  }
  render() {
    const { selectedStory, storyInfo, handleClose, helpButton } = this.props;
    const { formatDate } = this.props.intl;

    let content = null;
    if (selectedStory) {
      content = (
        <div className="drill-down">
          <DataCard className="query-story-drill-down">
            <Row>
              <Col lg={12}>
                <ActionMenu>
                  <MenuItem
                    className={ACTION_MENU_ITEM_CLASS}
                    onTouchTap={handleClose}
                  >
                    <ListItemText>
                      <FormattedMessage {...localMessages.close} />
                    </ListItemText>
                  </MenuItem>
                  <MenuItem
                    className={ACTION_MENU_ITEM_CLASS}
                    onTouchTap={() => this.openNewPage(storyInfo.url)}
                  >
                    <ListItemText>
                      <FormattedMessage {...localMessages.readThisStory} />
                    </ListItemText>
                  </MenuItem>
                </ActionMenu>
                <h2>
                  <FormattedMessage {...localMessages.title} />
                  <a href={storyInfo.url} target="_blank" rel="noopener noreferrer">{trimToMaxLength(storyInfo.title, 80)}</a>
                  {helpButton}
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
                          {storyInfo.media_name}
                        </a>
                      ),
                    },
                    { message: messages.storyDate,
                      data: formatDate(storyInfo.publish_date),
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
  helpButton: PropTypes.node.isRequired,
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
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.wordTreeHelpText])(
        SelectedStoryDrillDownContainer
      )
    )
  );

