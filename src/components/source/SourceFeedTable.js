import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { EditButton } from '../common/IconButton';
import TabSelector from '../common/TabSelector';
import { PERMISSION_MEDIA_EDIT } from '../../lib/auth';
import Permissioned from '../common/Permissioned';
import withHelp from '../common/hocs/HelpfulContainer';

const localMessages = {
  activeTabLabel: { id: 'source.feed.active', defaultMessage: 'Active ({num})' },
  inactiveTabLabel: { id: 'source.feed.inactive', defaultMessage: 'Disabled ({num})' },
  lastNewStory: { id: 'source.feed.lastNewStory', defaultMessage: 'Last New Story' },
  lastDownloadAttempt: { id: 'source.feed.lastDownloadAttempt', defaultMessage: 'Last Attempt' },
  lastDownloadSuccess: { id: 'source.feed.lastDownloadSuccess', defaultMessage: 'Last Success' },
  helpTitle: { id: 'source.feed.help.title', defaultMessage: 'About Sources Feed' },
  helpText: { id: 'source.feed.help.text',
    defaultMessage: '<p>A Spider Feed is a source found via spidering. When a story is found via spidering, as opposed to RSS publishing, Media Cloud creates a system generated source.</p>',
  },
};

class SourceFeedTable extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  isSystemGenerated = (feed) => feed.name === 'Spider Feed' || feed.url.endsWith('#spidered');

  render() {
    const { feeds, helpButton } = this.props;
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
                  {this.isSystemGenerated(feed) && <i>System Generated {' '}</i>}
                  {feed.name}
                  {this.isSystemGenerated(feed) && helpButton}
                </td>
                <td>
                  {feed.type}
                </td>
                <td>
                  { feed.active ? <FormattedMessage {...messages.feedIsActive} /> : <FormattedMessage {...messages.feedIsDisabled} /> }
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
  helpButton: PropTypes.node.isRequired,
};

export default injectIntl(
  withHelp(localMessages.helpTitle, localMessages.helpText)(
    SourceFeedTable
  )
);
