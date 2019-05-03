import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { EditButton } from '../common/IconButton';
import TabSelector from '../common/TabSelector';
import { PERMISSION_MEDIA_EDIT } from '../../lib/auth';
import Permissioned from '../common/Permissioned';

const localMessages = {
  activeTabLabel: { id: 'source.feed.active', defaultMessage: 'Active ({num})' },
  inactiveTabLabel: { id: 'source.feed.inactive', defaultMessage: 'Disabled ({num})' },
  lastNewStory: { id: 'source.feed.lastNewStory', defaultMessage: 'Last New Story' },
  lastDownloadAttempt: { id: 'source.feed.lastDownloadAttempt', defaultMessage: 'Last Attempt' },
  lastDownloadSuccess: { id: 'source.feed.lastDownloadSuccess', defaultMessage: 'Last Success' },
};

class SourceFeedTable extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  render() {
    const { feeds } = this.props;
    const { formatMessage } = this.props.intl;
    const content = null;

    if (feeds === undefined) {
      return (
        <div>
          { content }
        </div>
      );
    }

    const sortedFeeds = feeds.sort((a, b) => b.lastNewStoryMoment - a.lastNewStoryMoment);
    const activeFeeds = sortedFeeds.filter(f => f.active);
    const inactiveFeeds = sortedFeeds.filter(f => !f.active);

    let tabFeeds;
    switch (this.state.selectedViewIndex) {
      case 0:
        tabFeeds = activeFeeds;
        break;
      case 1:
        tabFeeds = inactiveFeeds;
        break;
      default:
        break;
    }

    return (
      <div className="source-feed-table">
        <TabSelector
          tabLabels={[
            formatMessage(localMessages.activeTabLabel, { num: activeFeeds.length }),
            formatMessage(localMessages.inactiveTabLabel, { num: inactiveFeeds.length }),
          ]}
          onViewSelected={index => this.setState({ selectedViewIndex: index })}
        />
        <table width="100%">
          <tbody>
            <tr>
              <th><FormattedMessage {...messages.feedName} /></th>
              <th><FormattedMessage {...messages.feedType} /></th>
              <th><FormattedMessage {...messages.feedIsActive} /></th>
              <th><FormattedMessage {...messages.feedUrl} /></th>
              <th><FormattedMessage {...localMessages.lastNewStory} /></th>
              <th><FormattedMessage {...localMessages.lastDownloadAttempt} /></th>
              <th><FormattedMessage {...localMessages.lastDownloadSuccess} /></th>
              <th />
            </tr>
            {tabFeeds.map((feed, idx) => (
              <tr key={feed.feeds_id} className={`${(idx % 2 === 0) ? 'even' : 'odd'} feed-${(feed.active) ? 'active' : 'disabled'}`}>
                <td>
                  {feed.name}
                </td>
                <td>
                  {feed.type}
                </td>
                <td>
                  {feed.active ? 'active' : 'disabled'}
                </td>
                <td>
                  <a href={feed.url}>{feed.url}</a>
                </td>
                <td>
                  {feed.lastNewStoryMoment && <FormattedDate value={feed.lastNewStoryMoment} />}
                </td>
                <td>
                  {feed.lastDownloadMoment && <FormattedDate value={feed.lastDownloadMoment} />}
                </td>
                <td>
                  {feed.lastSuccessfulDownloadMoment && <FormattedDate value={feed.lastSuccessfulDownloadMoment} />}
                </td>
                <td>
                  <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
                    <Link to={`/sources/${feed.media_id}/feeds/${feed.feeds_id}/edit`}>
                      <EditButton />
                    </Link>
                  </Permissioned>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

SourceFeedTable.propTypes = {
  feeds: PropTypes.array,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SourceFeedTable);
