import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { Grid } from '@material-ui/core';
import CollectionList from '../../common/CollectionList';
import SourceStatInfo from './SourceStatInfo';
import SourceSplitStoryCountContainer from './SourceSplitStoryCountContainer';
import SourceTopWordsContainer from './SourceTopWordsContainer';
import SourceGeographyContainer from './SourceGeographyContainer';
import { SOURCE_SCRAPE_STATE_QUEUED, SOURCE_SCRAPE_STATE_RUNNING, SOURCE_SCRAPE_STATE_COMPLETED, SOURCE_SCRAPE_STATE_ERROR } from '../../../reducers/sources/sources/selected/sourceDetails';
import { InfoNotice, ErrorNotice, WarningNotice } from '../../common/Notice';
import { jobStatusDateToMoment } from '../../../lib/dateUtil';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';
import SourceMetadataStatBar from '../../common/SourceMetadataStatBar';
import TabSelector from '../../common/TabSelector';

const localMessages = {
  sourceDetailsCollectionsTitle: { id: 'source.details.collections.title', defaultMessage: 'Collections' },
  sourceDetailsCollectionsIntro: { id: 'source.details.collections.intro',
    defaultMessage: 'Here are the collections {name} media source is part of:\n.',
  },
  favoritedCollectionsTitle: { id: 'source.details.collections.favorited.title', defaultMessage: 'Starred Collections' },
  favoritedCollectionsIntro: { id: 'source.details.collections.favorited.intro',
    defaultMessage: 'You have starred {count, plural,\n =0 {no collections}\n =1 {one collection}\n other {# collections}\n}.',
  },
  feedLastScrapeDate: { id: 'source.basicInfo.feed.lastScrape', defaultMessage: ' (Last scraped on {date}) ' },
  feedLink: { id: 'source.basicInfo.feedLink', defaultMessage: 'See all feeds' },
  dateInfo: { id: 'source.basicInfo.dates', defaultMessage: 'We have collected stories between {startDate} and {endDate}.' },
  metadataLabel: { id: 'source.basicInfo.metadata', defaultMessage: 'Metadata' },
  metadataDescription: { id: 'source.basicInfo.metadataDescription', defaultMessage: '{label}' },
  metadataEmpty: { id: 'source.basicInfo.metadata.empty', defaultMessage: 'No metadata available at this time' },
  unknown: { id: 'source.basicInfo.health.unknown', defaultMessage: '(unknown)' },
  isMonitored: { id: 'source.basicInfo.isMonitored', defaultMessage: 'monitored to ensure health' },
  publicNotes: { id: 'source.basicInfo.publicNotes', defaultMessage: '<p><b>Notes</b>: {notes}</p>' },
  editorNotes: { id: 'source.basicInfo.editorNotes', defaultMessage: '<p><b>Editor\'s Notes</b>: {notes}</p>' },
  scraping: { id: 'source.scrape.scraping', defaultMessage: 'We are current trying to scrape this source to discover RSS feeds we can pull content from.' },
  scrapeFailed: { id: 'source.scrape.failed', defaultMessage: 'Our last attempt to scrape this source for RSS feeds failed.' },
  unhealthySource: { id: 'source.warning.unhealthy', defaultMessage: 'It looks like we aren\'t actively tracking this source. Don\'t use it in general queries.' },
  about: { id: 'source.about', defaultMessage: 'About this Source' },
  content: { id: 'source.content', defaultMessage: 'Source Content' },
};

class SourceDetailsContainer extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  render() {
    const { source, collectionSets } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    const filename = `StoriesOverTime-Source-${source.media_id}`;
    const anyCollectionTagSets = (tagSetIdList) => tagSetIdList.reduce((any, tagSetId) => collectionSets.includes(tagSetId) || any, false);
    // check if source is not suitable for general queries
    let unhealthySourceWarning;
    if ((source.is_healthy === 0) && (source.media_source_tags.length > 0 && !anyCollectionTagSets(source.media_source_tags.map(m => m.tag_sets_id)))) {
      unhealthySourceWarning = (
        <span>
          <WarningNotice>
            <FormattedMessage {...localMessages.unhealthySource} />
          </WarningNotice>
          <br />
        </span>
      );
    }
    let notice;
    // pull together any relevant warnings
    if ((source.latestScrapeState === SOURCE_SCRAPE_STATE_QUEUED) || (source.latestScrapeState === SOURCE_SCRAPE_STATE_RUNNING)) {
      notice = (<InfoNotice><FormattedMessage {...localMessages.scraping} /></InfoNotice>);
    } else if (source.latestScrapeState === SOURCE_SCRAPE_STATE_ERROR) {
      notice = (<ErrorNotice><FormattedMessage {...localMessages.scrapeFailed} /></ErrorNotice>);
    }
    // show them the last feed scrape date, if there was a successfull one
    let feedScrapeMsg;
    if (source.latestScrapeState === SOURCE_SCRAPE_STATE_COMPLETED) {
      feedScrapeMsg = (
        <FormattedMessage
          {...localMessages.feedLastScrapeDate}
          values={{ date: formatDate(jobStatusDateToMoment(source.scrape_status.job_states[0].last_updated)) }}
        />
      );
    }
    const publicNotes = (source.public_notes) ? <FormattedHTMLMessage {...localMessages.publicNotes} values={{ notes: source.public_notes }} /> : null;
    const editorNotes = (source.editor_notes) ? <FormattedHTMLMessage {...localMessages.editorNotes} values={{ notes: source.editor_notes }} /> : null;

    let viewContent;
    switch (this.state.selectedViewIndex) {
      case 0:
        viewContent = (
          <>
            <Grid item xs={12}>
              <SourceStatInfo sourceId={source.media_id} />
            </Grid>
            <Grid item lg={6} md={6} sm={12}>
              <SourceMetadataStatBar source={source} columnWidth={6} />
            </Grid>
            <Grid item md={6} sm={12}>
              <CollectionList
                title={formatMessage(localMessages.sourceDetailsCollectionsTitle)}
                intro={formatMessage(localMessages.sourceDetailsCollectionsIntro, {
                  name: source.name,
                })}
                collections={source.media_source_tags}
                collectionSets={collectionSets}
              />
            </Grid>
          </>
        );
        break;
      case 1:
        viewContent = (
          <>
            <Grid item xs={12}>
              <SourceSplitStoryCountContainer sourceId={source.media_id} sourceName={source.name} filename={filename} />
            </Grid>
            <Grid item xs={12}>
              <SourceTopWordsContainer source={source} />
            </Grid>
            <Grid item xs={12}>
              <SourceGeographyContainer source={source} />
            </Grid>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {notice}
          {unhealthySourceWarning}
          {publicNotes}
          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
            {editorNotes}
          </Permissioned>
          <p>
            <FormattedMessage
              {...localMessages.dateInfo}
              values={{
                startDate: (source.health && source.health.start_date) ? source.health.start_date.substring(0, 10) : formatMessage(localMessages.unknown),
                endDate: (source.health && source.health.end_date) ? source.health.end_date.substring(0, 10) : formatMessage(localMessages.unknown),
              }}
            />
            &nbsp;
            <Link to={`/sources/${source.media_id}/feeds`}>
              <FormattedMessage {...localMessages.feedLink} />
            </Link>
            {feedScrapeMsg}
          </p>
        </Grid>

        <Grid item xs={12}>
          <TabSelector
            tabLabels={[
              formatMessage(localMessages.about),
              formatMessage(localMessages.content),
            ]}
            onViewSelected={index => this.setState({ selectedViewIndex: index })}
          />
        </Grid>

        {viewContent}
      </Grid>
    );
  }
}

SourceDetailsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  params: PropTypes.object.isRequired, // params from router
  sourceId: PropTypes.number.isRequired,
  // from state
  source: PropTypes.object,
  collectionSets: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  source: state.sources.sources.selected.sourceDetails,
  collectionSets: state.system.staticTags.tagSets.collectionSets,
});

export default
injectIntl(
  connect(mapStateToProps)(
    SourceDetailsContainer
  )
);
