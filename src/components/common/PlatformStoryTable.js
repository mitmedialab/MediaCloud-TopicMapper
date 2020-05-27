import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { storyPubDateToTimestamp } from '../../lib/dateUtil';
import { googleFavIconUrl, storyDomainName } from '../../lib/urlUtil';
import { trimToMaxLength } from '../../lib/stringUtil';

const localMessages = {
  undateable: { id: 'story.publishDate.undateable', defaultMessage: 'Undateable' },
  foci: { id: 'story.foci.list', defaultMessage: 'List of Subtopics {list}' },
};

const PlatformStoryTable = (props) => {
  const { stories, maxTitleLength, selectedStory, extraColumns, extraHeaderColumns } = props;
  const { formatMessage, formatDate } = props.intl;
  return (
    <div className="story-table">
      <table>
        <tbody>
          <tr>
            <th><FormattedMessage {...messages.storyTitle} /></th>
            <th><FormattedMessage {...messages.platformSource} /></th>
            <th><FormattedMessage {...messages.storyDate} /></th>
            { extraHeaderColumns}
          </tr>
          {stories.map((story, idx) => {
            const domain = storyDomainName(story);
            let dateToShow = null; // need to handle undateable stories
            let dateStyle = '';
            const title = maxTitleLength !== undefined ? `${trimToMaxLength(story.title, maxTitleLength)}` : story.title;
            const isSelected = selectedStory === story.stories_id ? ' selected' : ' ';
            if (story.publish_date === 'undateable') {
              dateToShow = formatMessage(localMessages.undateable);
              dateStyle = 'story-date-undateable';
            } else {
              dateToShow = formatDate(storyPubDateToTimestamp(story.publish_date));
              dateStyle = (story.date_is_reliable === 0) ? 'story-date-unreliable' : 'story-date-reliable';
              if (story.date_is_reliable === 0) {
                dateToShow += '?';
              }
            }
            return (
              <tr key={`${story.stories_id}${idx}`} className={(idx % 2 === 0) ? `even${isSelected}` : `odd${isSelected}`}>
                <td>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">{title}</a>
                </td>
                <td>
                  <a href={story.media_url} rel="noopener noreferrer" target="_blank">
                    <img className="google-icon" src={googleFavIconUrl(domain)} alt={domain} />
                  </a>
                  <a href={story.media_url} rel="noopener noreferrer" target="_blank">{story.media_name}</a>
                </td>
                <td><span className={`story-date ${dateStyle}`}>{dateToShow}</span></td>
                {extraColumns && extraColumns(story, idx)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

PlatformStoryTable.propTypes = {
  stories: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
  extraColumns: PropTypes.func,
  extraHeaderColumns: PropTypes.object,
  sortedBy: PropTypes.string,
  maxTitleLength: PropTypes.number,
  selectedStory: PropTypes.number,
};

export default injectIntl(PlatformStoryTable);
