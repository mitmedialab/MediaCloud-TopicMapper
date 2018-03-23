import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import CollectionList from '../../common/CollectionList';
import SourceStatInfo from './SourceStatInfo';
import SourceSentenceCountContainer from './SourceSentenceCountContainer';
import SourceTopWordsContainer from './SourceTopWordsContainer';
import SourceGeographyContainer from './SourceGeographyContainer';
import { anyCollectionTagSets } from '../../../lib/tagUtil';
import { SOURCE_SCRAPE_STATE_QUEUED, SOURCE_SCRAPE_STATE_RUNNING, SOURCE_SCRAPE_STATE_COMPLETED, SOURCE_SCRAPE_STATE_ERROR } from '../../../reducers/sources/sources/selected/sourceDetails';
import { InfoNotice, ErrorNotice, WarningNotice } from '../../common/Notice';
import { jobStatusDateToMoment, getCurrentDate, oneMonthBefore } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';
import AppButton from '../../common/AppButton';
import SourceMetadataStatBar from '../../common/SourceMetadataStatBar';

const localMessages = {
  searchNow: { id: 'source.basicInfo.searchNow', defaultMessage: 'Search in Explorer' },
  sourceDetailsTitle: { id: 'source.details.title', defaultMessage: 'Media Source: {name}' },
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
  dateInfo: { id: 'source.basicInfo.dates', defaultMessage: 'We have collected sentences between {startDate} and {endDate}.' },
  contentInfo: { id: 'source.basicInfo.content', defaultMessage: 'Averaging {storyCount} stories per day and {sentenceCount} sentences in the last week.' },
  gapInfo: { id: 'source.basicInfo.gaps', defaultMessage: 'We\'d guess there are {gapCount} "gaps" in our coverage (highlighted in <b><span class="health-gap">in orange</span></b> on the chart).  Gaps are when we were unable to collect as much content as we expected to, which means we might be missing some content for those dates.' },
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
};

class SourceDetailsContainer extends React.Component {

  searchInExplorer = () => {
    const { source } = this.props;
    /* let explorerUrl = `https://explorer.mediacloud.org/#/queries/search?q=[{"sources":[${source.media_id}], "collections":[], `;
    if (source.health && source.health.start_date && source.health.end_date) {
      explorerUrl += `"startDate","${source.health.start_date.substring(0, 10)}","endDate": "${source.health.end_date.substring(0, 10)}"`;
    } else {
      explorerUrl += ''; // should pick up default dates
    }
    explorerUrl += `"label": ${encodeURIComponent('*')}`.concat(', ');
    explorerUrl += `"q": ${encodeURIComponent('*')}`.concat(', ');
    explorerUrl += `"color": ${encodeURIComponent(source.color)}`.concat('}]');
*/
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const explorerUrl = urlToExplorerQuery(source.name, '*', source.id, '', startDate, endDate);
    window.open(explorerUrl, '_blank');
  }

  render() {
    const { source } = this.props;
    const { formatMessage, formatNumber, formatDate } = this.props.intl;
    const filename = `SentencesOverTime-Source-${source.media_id}`;
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
    return (
      <Grid className="details source-details">
        <Row>
          <Col lg={9} xs={12}>
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
              <FormattedMessage
                {...localMessages.contentInfo}
                values={{
                  storyCount: (source.health && source.health.num_stories_w) ? formatNumber(source.health.num_stories_w) : formatMessage(localMessages.unknown),
                  sentenceCount: (source.health && source.health.num_sentences_w) ? formatNumber(source.health.num_sentences_w) : formatMessage(localMessages.unknown),
                }}
              />
              &nbsp;
              <FormattedHTMLMessage
                {...localMessages.gapInfo}
                values={{ gapCount: (source.health && source.health.coverage_gaps) ? formatNumber(source.health.coverage_gaps) : formatMessage(localMessages.unknown) }}
              />
              &nbsp;
              <Link to={`/sources/${source.media_id}/feeds`} >
                <FormattedMessage {...localMessages.feedLink} />
              </Link>
              {feedScrapeMsg}
            </p>
          </Col>
          <Col lg={3} xs={12} className="search-section">
            <AppButton label={formatMessage(localMessages.searchNow)} primary onClick={this.searchInExplorer} />
            <p>
              <a href={source.url}> {source.url} </a>
            </p>
          </Col>
        </Row>
        <SourceStatInfo sourceId={source.media_id} />
        <Row>
          <Col lg={6} xs={12}>
            <SourceTopWordsContainer source={source} />
          </Col>
          <Col lg={6} xs={12}>
            <SourceSentenceCountContainer sourceId={source.media_id} filename={filename} />
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12} sm={12}>
            <SourceGeographyContainer source={source} />
          </Col>
        </Row>
        <Row>
          <Col lg={6} md={6} sm={12}>
            <CollectionList
              title={formatMessage(localMessages.sourceDetailsCollectionsTitle)}
              intro={formatMessage(localMessages.sourceDetailsCollectionsIntro, {
                name: source.name,
              })}
              collections={source.media_source_tags}
            />
          </Col>
          <Col lg={6} md={6} sm={12} >
            <SourceMetadataStatBar source={source} columnWidth={6} />
          </Col>
        </Row>
      </Grid>
    );
  }

}

SourceDetailsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  params: PropTypes.object.isRequired,       // params from router
  sourceId: PropTypes.number.isRequired,
  // from state
  source: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  source: state.sources.sources.selected.sourceDetails,
});

export default
  injectIntl(
    connect(mapStateToProps)(
      SourceDetailsContainer
    )
  );
