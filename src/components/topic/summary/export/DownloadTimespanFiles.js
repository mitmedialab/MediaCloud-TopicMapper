import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import withSummary from '../../../common/hocs/SummarizedVizualization';
import messages from '../../../../resources/messages';

const localMessages = {
  title: { id: 'topic.summary.timespanDownload.title', defaultMessage: 'Download Timespan Files' },
  helpIntro: { id: 'topic.summary.timespanDownload.help.intro', defaultMessage: '<p>Quickly download CSVs of all the content in this timespan. This will respect the version, timespan, and subtopic you have selected. It will ignore any Story Filter you might be using. These files are automatically generated when you make a new version, so they download quickly.</p>' },
  none: { id: 'topic.summary.timespanDownload.none', defaultMessage: '<p><b>No files available for this timespan. Make a new version to generate some</b></p>' },
  unsupported: { id: 'topic.summary.timespanDownload.unsupported', defaultMessage: 'Your "{q}" query filter is not respected in these files.' },
  link: { id: 'topic.summary.timespanDownload.link', defaultMessage: '{name} - in {format} format ({size}MB) - ' },
  // user-friendly names for different type of maps
  rename_stories: { id: 'topic.summary.stories.name', defaultMessage: 'All Stories' },
  rename_media: { id: 'topic.summary.media.name', defaultMessage: 'All Media' },
  rename_story_links: { id: 'topic.summary.story_links.name', defaultMessage: 'Links between stories' },
  rename_medium_links: { id: 'topic.summary.medium_links.name', defaultMessage: 'Links between media' },
  rename_topic_posts: { id: 'topic.summary.topic_posts.name', defaultMessage: 'Platform-specific metadata about each post' },
  rename_post_stories: { id: 'topic.summary.post_stories.name', defaultMessage: 'Lookup to map from post to the story it links to' },
};

// these files are only non-empty if you are in a URL Sharing subtopic right now
const urlSharingTimespanOnlyFiles = ['topic_posts', 'post_stories'];

/**
 * When a new verson is run, we generate help CSVs for every timespan automatically and stick them on S3. This widgets
 * lists those so that it is easy to download them quickly, rather than paging through the results of API calls forever.
 */
const DownloadTimespanFiles = ({ filters, files, usingUrlSharingSubtopic }) => {
  if (files.length === 0) {
    return <FormattedHTMLMessage {...localMessages.none} />;
  }
  return (
    <>
      {filters.q && (<FormattedMessage {...localMessages.unsupported} values={{ q: filters.q }} />)}
      <ul>
        {files.map((f, idx) => {
          // only show certain files if the user is in a URL Sharing subtopic
          const okToDisplay = !urlSharingTimespanOnlyFiles.includes(f.name) || (usingUrlSharingSubtopic && urlSharingTimespanOnlyFiles.includes(f.name));
          return (okToDisplay && (
            <li key={idx}>
              {localMessages[`rename_${f.name}`] ? (<FormattedMessage {...localMessages[`rename_${f.name}`]} />) : f.name }
              &nbsp; &nbsp;
              <a target="_new" href={f.url}><FormattedMessage {...messages.download} /></a>
            </li>
          ));
        })}
      </ul>
    </>
  );
};

DownloadTimespanFiles.propTypes = {
  // from parent
  filters: PropTypes.object.isRequired,
  files: PropTypes.array,
  usingUrlSharingSubtopic: PropTypes.bool,
};

export default
injectIntl(
  withSummary(localMessages.title, localMessages.helpIntro)(
    DownloadTimespanFiles
  )
);
