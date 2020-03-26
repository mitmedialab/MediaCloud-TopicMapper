import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import messages from '../../resources/messages';
import LinkWithFilters from './LinkWithFilters';
import { storyPubDateToTimestamp, STORY_PUB_DATE_UNDATEABLE } from '../../lib/dateUtil';
import { googleFavIconUrl, storyDomainName } from '../../lib/urlUtil';
import { ReadItNowButton } from '../common/IconButton';
import SafelyFormattedNumber from '../common/SafelyFormattedNumber';
import HelpDialog from '../common/HelpDialog';

const localMessages = {
  undateable: { id: 'story.publishDate.undateable', defaultMessage: 'Undateable' },
  foci: { id: 'story.foci.list', defaultMessage: 'List of Subtopics {list}' },
  facebookSharesHelp: { id: 'story.help.facebookShares', defaultMessage: '<p>The total number of shares this link has had on Facebook. It is important to note that this is captures at the time we first pulled this link into our system. Also note that many of these shares could have been for reasons totalled unrealted to the topic you are researching. Based on those caveats, we don\'t recommend using this for much.<p>' },
  authorCountHelp: { id: 'story.help.authorCount', defaultMessage: '<p>The number of unique users that posted this link to the platform you are looking at.<p>' },
  postCountHelp: { id: 'story.help.postCount', defaultMessage: '<p>The number of posts that included this link on the platform you are looking at.<p>' },
  channelCountHelp: { id: 'story.help.channelCount', defaultMessage: '<p>This varies by platform:</p><ul><li>Twitter: it is identical to the author count</li></ul>' },
};

const ICON_STYLE = { margin: 0, padding: 0, width: 12, height: 12 };

/**
 * Main component to use for showing a table of stories within a topic. Used across the entire interface.
 * Most likely you want to use TopicStoryTableContainer, so it adds in some of the required properties for you.
 */
class TopicStoryTable extends React.Component {
  sortableHeader = (sortKey, textMsg) => {
    const { onChangeSort, sortedBy } = this.props;
    const { formatMessage } = this.props.intl;
    let content;
    if (onChangeSort) {
      if (sortedBy === sortKey) {
        // currently sorted by this key
        content = (
          <a>
            <b><FormattedMessage {...textMsg} /></b>
            <ArrowDropDownIcon style={ICON_STYLE} />
          </a>
        );
      } else {
        // link to sort by this key
        content = (
          <a
            href={`#${formatMessage(textMsg)}`}
            onClick={(e) => { e.preventDefault(); onChangeSort(sortKey); }}
            title={formatMessage(textMsg)}
          >
            <FormattedMessage {...textMsg} />
          </a>
        );
      }
    } else {
      // not sortable
      content = <FormattedMessage {...textMsg} />;
    }
    return content;
  }

  render() {
    const { stories, showTweetCounts, onChangeFocusSelection, topicId, maxTitleLength,
      showInlinksOutlinks, showAuthorCount } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    return (
      <div className="story-table">
        <table>
          <tbody>
            <tr>
              <th><FormattedMessage {...messages.storyTitle} /></th>
              <th><FormattedMessage {...messages.media} /></th>
              <th>
                <FormattedMessage {...messages.storyDate} />
                <HelpDialog title={messages.pubDateTableHelpTitle} content={messages.pubDateTableHelpText} />
              </th>
              {showInlinksOutlinks && (
                <>
                  <th className="numeric">{this.sortableHeader('inlink', messages.mediaInlinks)}</th>
                  <th className="numeric"><FormattedMessage {...messages.outlinks} /></th>
                </>
              )}
              <th className="numeric">
                {this.sortableHeader('facebook', messages.facebookShares)}
                <HelpDialog title={messages.facebookShares} content={localMessages.facebookSharesHelp} />
              </th>
              { showAuthorCount && (
                <>
                  <th className="numeric">
                    {this.sortableHeader('post_count', messages.postCount)}
                    <HelpDialog title={messages.postCount} content={localMessages.postCountHelp} />
                  </th>
                  <th className="numeric">
                    {this.sortableHeader('author_count', messages.authorCount)}
                    <HelpDialog title={messages.authorCount} content={localMessages.authorCountHelp} />
                  </th>
                  <th className="numeric">
                    {this.sortableHeader('channel_count', messages.channelCount)}
                    <HelpDialog title={messages.channelCount} content={localMessages.channelCountHelp} />
                  </th>
                </>
              )}
              {showTweetCounts && (
                <th className="numeric">{this.sortableHeader('twitter', messages.tweetCounts)}</th>
              )}
              <th>{}</th>
              <th><FormattedMessage {...messages.focusHeader} /></th>
            </tr>
            {stories.map((story, idx) => {
              const domain = storyDomainName(story);
              let dateToShow = null; // need to handle undateable stories
              let dateStyle = '';
              const title = maxTitleLength !== undefined ? `${story.title.substr(0, maxTitleLength)}...` : story.title;
              if (story.publish_date === STORY_PUB_DATE_UNDATEABLE) {
                dateToShow = formatMessage(localMessages.undateable);
                dateStyle = 'story-date-undateable';
              } else {
                dateToShow = formatDate(storyPubDateToTimestamp(story.publish_date));
                dateStyle = (story.date_is_reliable === 0) ? 'story-date-unreliable' : 'story-date-reliable';
                if (story.date_is_reliable === 0) {
                  dateToShow += '?';
                }
              }
              let listOfFoci = 'none';
              if (story.foci && story.foci.length > 0) {
                listOfFoci = (
                  story.foci.map((foci, i) => (
                    <span key={foci.foci_id}>
                      {!!i && ', '}
                      <LinkWithFilters
                        to={`/topics/${topicId}/summary`}
                        filters={{ focusId: foci.foci_id, timespanId: null }}
                        onClick={() => onChangeFocusSelection(foci.foci_id)}
                      >
                        { foci.name }
                      </LinkWithFilters>
                    </span>
                  )));
                // listOfFoci = intersperse(listOfFoci, ', ');
              }
              return (
                <tr key={story.stories_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                  <td>
                    <LinkWithFilters to={`/topics/${topicId}/stories/${story.stories_id}`}>
                      {title}
                    </LinkWithFilters>
                  </td>
                  <td>
                    <img className="google-icon" src={googleFavIconUrl(domain)} alt={domain} />
                    <LinkWithFilters to={`/topics/${topicId}/media/${story.media_id}`}>
                      {story.media_name}
                    </LinkWithFilters>
                  </td>
                  <td><span className={`story-date ${dateStyle}`}>{dateToShow}</span></td>
                  {showInlinksOutlinks && (
                    <>
                      <td className="numeric"><SafelyFormattedNumber value={story.media_inlink_count} /></td>
                      <td className="numeric"><SafelyFormattedNumber value={story.outlink_count} /></td>
                    </>
                  )}
                  <td className="numeric"><SafelyFormattedNumber value={story.facebook_share_count} /></td>
                  { showAuthorCount && (
                    <>
                      <td className="numeric"><SafelyFormattedNumber value={story.post_count} /></td>
                      <td className="numeric"><SafelyFormattedNumber value={story.author_count} /></td>
                      <td className="numeric"><SafelyFormattedNumber value={story.channel_count} /></td>
                    </>
                  )}
                  { showTweetCounts && (
                    <td className="numeric"><SafelyFormattedNumber value={story.simple_tweet_count} /></td>
                  )}
                  <td>
                    <a href={story.url} target="_blank" rel="noopener noreferrer">
                      <ReadItNowButton />
                    </a>
                  </td>
                  <td>{listOfFoci}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

TopicStoryTable.propTypes = {
  // from original parent
  stories: PropTypes.array.isRequired,
  onChangeSort: PropTypes.func,
  maxTitleLength: PropTypes.number,
  sortedBy: PropTypes.string,
  onChangeFocusSelection: PropTypes.func,
  // from parent (container)
  showTweetCounts: PropTypes.bool.isRequired,
  topicId: PropTypes.number.isRequired,
  showInlinksOutlinks: PropTypes.bool.isRequired,
  showAuthorCount: PropTypes.bool.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicStoryTable
);
