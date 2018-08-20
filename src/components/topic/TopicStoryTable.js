import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Link from 'react-router/lib/Link';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import messages from '../../resources/messages';
import LinkWithFilters from './LinkWithFilters';
import { storyPubDateToTimestamp, STORY_PUB_DATE_UNDATEABLE } from '../../lib/dateUtil';
import { googleFavIconUrl, storyDomainName } from '../../lib/urlUtil';
import { ReadItNowButton } from '../common/IconButton';
import SafelyFormattedNumber from '../common/SafelyFormattedNumber';

const localMessages = {
  undateable: { id: 'story.publishDate.undateable', defaultMessage: 'Undateable' },
  foci: { id: 'story.foci.list', defaultMessage: 'List of Subtopics {list}' },
};

const ICON_STYLE = { margin: 0, padding: 0, width: 12, height: 12 };

class TopicStoryTable extends React.Component {

  sortableHeader = (sortKey, textMsg) => {
    const { onChangeSort, sortedBy } = this.props;
    const { formatMessage } = this.props.intl;
    let content;
    if (onChangeSort) {
      if (sortedBy === sortKey) {
        // currently sorted by this key
        content = (
          <div>
            <b><FormattedMessage {...textMsg} /></b>
            <ArrowDropDownIcon style={ICON_STYLE} />
          </div>
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
    const { stories, showTweetCounts, onChangeFocusSelection, topicId, maxTitleLength } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    const tweetHeader = showTweetCounts ? <th className="numeric">{this.sortableHeader('twitter', messages.tweetCounts)}</th> : null;
    return (
      <div className="story-table">
        <table>
          <tbody>
            <tr>
              <th><FormattedMessage {...messages.storyTitle} /></th>
              <th>{}</th>
              <th><FormattedMessage {...messages.media} /></th>
              <th><FormattedMessage {...messages.storyDate} /></th>
              <th className="numeric">{this.sortableHeader('inlink', messages.mediaInlinks)}</th>
              <th className="numeric"><FormattedMessage {...messages.outlinks} /></th>
              <th className="numeric">{this.sortableHeader('facebook', messages.facebookShares)}</th>
              {tweetHeader}
              <th>{}</th>
              <th><FormattedMessage {...messages.focusHeader} /></th>
            </tr>
            {stories.map((story, idx) => {
              const domain = storyDomainName(story);
              let dateToShow = null;  // need to handle undateable stories
              let dateStyle = '';
              const title = maxTitleLength !== undefined ? `${story.title.substr(0, maxTitleLength)}...` : story.title;
              const tweetInfo = showTweetCounts ? <td className="numeric"><SafelyFormattedNumber value={story.simple_tweet_count} /></td> : null;
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
                      <Link
                        to={`/topics/${topicId}/summary?focusId=${foci.foci_id}`}
                        onClick={() => onChangeFocusSelection(foci.foci_id)}
                      >
                        { foci.name }
                      </Link>
                    </span>
                  ),
                  )
                );
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
                  </td>
                  <td>
                    <LinkWithFilters to={`/topics/${topicId}/media/${story.media_id}`}>
                      {story.media_name}
                    </LinkWithFilters>
                  </td>
                  <td><span className={`story-date ${dateStyle}`}>{dateToShow}</span></td>
                  <td className="numeric"><SafelyFormattedNumber value={story.media_inlink_count} /></td>
                  <td className="numeric"><SafelyFormattedNumber value={story.outlink_count} /></td>
                  <td className="numeric"><SafelyFormattedNumber value={story.facebook_share_count} /></td>
                  {tweetInfo}
                  <td>
                    <a href={story.url} target="_blank" rel="noopener noreferrer">
                      <ReadItNowButton />
                    </a>
                  </td>
                  <td>{listOfFoci}</td>
                </tr>
              );
            }
            )}
          </tbody>
        </table>
      </div>
    );
  }

}

TopicStoryTable.propTypes = {
  stories: PropTypes.array.isRequired,
  showTweetCounts: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  topicId: PropTypes.number, // not required as this table is now also used by query routine
  onChangeSort: PropTypes.func,
  onChangeFocusSelection: PropTypes.func,
  sortedBy: PropTypes.string,
  maxTitleLength: PropTypes.number,
};

export default injectIntl(TopicStoryTable);
