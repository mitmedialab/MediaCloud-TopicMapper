import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedNumber, injectIntl, FormattedDate } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { fetchCollectionSourceList, scrapeSourceFeeds, removeSourcesFromCollection, fetchSourceReviewInfo }
  from '../../../actions/sourceActions';
import AppButton from '../../common/AppButton';
import { DownloadButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import Permissioned from '../../common/Permissioned';
import TabSelector from '../../common/TabSelector';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { updateFeedback } from '../../../actions/appActions';
import { SOURCE_SCRAPE_STATE_QUEUED, SOURCE_SCRAPE_STATE_RUNNING, SOURCE_SCRAPE_STATE_COMPLETED, SOURCE_SCRAPE_STATE_ERROR } from '../../../reducers/sources/sources/selected/sourceDetails';
import FilledStarIcon from '../../common/icons/FilledStarIcon';
import { googleFavIconUrl } from '../../../lib/urlUtil';
import { parseSolrShortDate, jobStatusDateToMoment } from '../../../lib/dateUtil';
import PageTitle from '../../common/PageTitle';

const REVIEW = 0;
const REMOVE = 1;
const UNSCRAPEABLE = 2;
const WORKING = 3;
const ALL = 4;

const localMessages = {
  title: { id: 'collection.manageSources.title', defaultMessage: 'Review Sources' },
  scrape: { id: 'collection.manageSources.scrape', defaultMessage: 'Scrape' }, // using this so we have a smaller button
  scrapeAll: { id: 'collection.manageSources.scrapeAll', defaultMessage: 'Scrape all For New Feeds' },
  inLast90Days: { id: 'collection.manageSources.column.last90', defaultMessage: 'Last 90 Days' },
  inLastYear: { id: 'collection.manageSources.column.lastYear', defaultMessage: 'Last Year' },
  startedScrapingAll: { id: 'collection.manageSources.startedScrapingAll', defaultMessage: 'Started scraping all sources for RSS feeds' },
  lastScrapeQueuedSince: { id: 'source.basicInfo.feed.lastScrapeQueuedSince', defaultMessage: 'Scrape queued since {date}' },
  lastScrapeRunningSince: { id: 'source.basicInfo.feed.lastScrapeRunningSince', defaultMessage: 'Scrape running since {date}' },
  lastScrapeWorkedOn: { id: 'source.basicInfo.feed.lastScrapeWorkedOn', defaultMessage: 'Last scrape worked on {date}' },
  lastScrapeFailedOn: { id: 'source.basicInfo.feed.lastScrapeFailedOn', defaultMessage: 'Last scrape failed on {date}) ' },
  neverScraped: { id: 'source.basicInfo.feed.neverScraped', defaultMessage: 'Never been scraped :-(' },
  activeFeedCount: { id: 'collection.manageSources.column.activeFeedCount', defaultMessage: 'Active Feeds' },
  review: { id: 'collection.manageSources.tab.review', defaultMessage: 'Review ({count})' },
  reviewDesc: { id: 'collection.manageSources.tab.review.desc', defaultMessage: 'These sources have no feeds (scrape failed) or feeds with no stories (bad feeds). Click each URL to check if the website is still live (or parked with ads). If they are valid sites with news content, poke around the source code to look for any RSS feeds that might have been missed by the feed scraper.' },
  remove: { id: 'collection.manageSources.tab.remove', defaultMessage: 'Remove ({count})' },
  removeAllFeeds: { id: 'collection.manageSources.tab.removeAll', defaultMessage: 'Remove These Sources From This Collection' },
  removeDesc: { id: 'collection.manageSources.tab.remove.desc', defaultMessage: 'These sources have no feeds and no recent stories, or trying to scrape them failed, and are candidates to remove from the collection. If the scrape job failed, that probably means the website is down (i.e. gone out of business or moved to a new URL). They will stay in Media Cloud, but won\'t be part of this collection.' },
  removedFeed: { id: 'collection.manageSources.tab.removedFeed', defaultMessage: 'We removed the feed as requested' },
  unscrapeable: { id: 'collection.manageSources.tab.unscrapeable', defaultMessage: 'Unscrapeable ({count})' },
  unscrapeableDesc: { id: 'collection.manageSources.tab.unscrapeable.desc', defaultMessage: 'These sources have content (that we have probably spidered), but we can\'t find any RSS feeds for them.' },
  working: { id: 'collection.manageSources.tab.working', defaultMessage: 'Working ({count})' },
  workingDesc: { id: 'collection.manageSources.tab.working.desc', defaultMessage: 'These are sources we think are working well and do not need to be checked' },
  all: { id: 'collection.manageSources.tab.all', defaultMessage: 'All ({count})' },
};

function needReview(sources) {
  return sources.filter(s => (s.active_feed_count === 0 && s.num_stories_90 === 0) || ((s.active_feed_count && s.active_feed_count > 0) && s.num_stories_90 === 0 && (s.num_stories_last_year && s.num_stories_last_year > 0)));
}

function areWorking(sources) {
  return sources.filter(s => (s.active_feed_count > 0 && (s.num_stories_90 && s.num_stories_90 > 0)));
}

function maybeRemove(sources) {
  return sources.filter(s => (s.active_feed_count > 0 && s.num_stories_90 === 0 && (s.num_stories_last_year && s.num_stories_last_year === 0)) || (s.latest_scrape_job && s.latest_scrape_job.state === 'failed'));
}

function areUnscrapeable(sources) {
  return sources.filter(s => (s.active_feed_count === 0 && s.num_stories_90 > 0));
}

class ManageSourcesContainer extends React.Component {
  state = {
    scrapedAll: false,
    selectedViewIndex: 0,
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { collectionId, fetchData } = this.props;
    if ((nextProps.collectionId !== collectionId)) {
      fetchData(nextProps.collectionId);
    }
  }

  onScrapeAll = () => {
    const { scrapeAllFeeds, sources } = this.props;
    scrapeAllFeeds(sources.map(s => s.media_id));
    this.setState({ scrapedAll: true });
  }

  downloadCsv = (type) => {
    const { collectionId } = this.props;
    const url = `/api/collections/${collectionId}/sources/${type}.csv`;
    window.location = url;
    this.props.notifyOfCsvDownload();
  }

  render() {
    const { collectionId, collection, scrapeFeeds, sources, removeSource } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    let viewSources = '';
    let viewDesc = '';
    switch (this.state.selectedViewIndex) {
      case REVIEW:
        viewSources = needReview(sources);
        viewDesc = (
          <Row>
            <Col lg={11}>
              <p><FormattedMessage {...localMessages.reviewDesc} /></p>
            </Col>
            <DownloadButton tooltip={formatMessage(messages.download)} onClick={() => this.downloadCsv(formatMessage(localMessages.review, { count: '' }))} />
          </Row>
        );
        break;
      case REMOVE:
        viewSources = maybeRemove(sources);
        const removeAllButton = (
          <AppButton
            color="secondary"
            variant="outlined"
            className="source-remove-feeds-button"
            label={formatMessage(localMessages.removeAllFeeds)}
            onClick={() => removeSource(collectionId, viewSources)}
          />
        );
        viewDesc = (
          <div>
            <Row>
              <Col lg={11}>
                <p><FormattedMessage {...localMessages.reviewDesc} /></p>
              </Col>
              <DownloadButton tooltip={formatMessage(messages.download)} onClick={() => this.downloadCsv(formatMessage(localMessages.remove, { count: '' }))} />
            </Row>
            <Row>
              {removeAllButton}
            </Row>
          </div>
        );
        break;
      case UNSCRAPEABLE:
        viewSources = areUnscrapeable(sources);
        viewDesc = (
          <Row>
            <Col lg={11}>
              <p><FormattedMessage {...localMessages.unscrapeableDesc} /></p>
            </Col>
            <DownloadButton tooltip={formatMessage(messages.download)} onClick={() => this.downloadCsv(formatMessage(localMessages.unscrapeable, { count: '' }))} />
          </Row>
        );
        break;
      case WORKING:
        viewSources = areWorking(sources);
        viewDesc = (
          <Row>
            <Col lg={11}>
              <p><FormattedMessage {...localMessages.workingDesc} /></p>
            </Col>
            <DownloadButton tooltip={formatMessage(messages.download)} onClick={() => this.downloadCsv(formatMessage(localMessages.working, { count: '' }))} />
          </Row>
        );
        break;
      case ALL:
        viewSources = sources;
        viewDesc = (
          <Row>
            <Col lg={11} />
            <DownloadButton tooltip={formatMessage(messages.download)} onClick={() => this.downloadCsv(formatMessage(localMessages.all, { count: '' }))} />
          </Row>
        );
        break;
      default:
        break;
    }
    const tabContent = (
      <div>
        <Row>
          <TabSelector
            tabLabels={[
              formatMessage(localMessages.review, { count: needReview(sources).length }),
              formatMessage(localMessages.remove, { count: maybeRemove(sources).length }),
              formatMessage(localMessages.unscrapeable, { count: areUnscrapeable(sources).length }),
              formatMessage(localMessages.working, { count: areWorking(sources).length }),
              formatMessage(localMessages.all, { count: sources.length }),
            ]}
            onViewSelected={index => this.setState({ selectedViewIndex: index })}
          />
        </Row>
        {viewDesc}
      </div>
    );
    return (
      <Grid>
        <PageTitle value={[localMessages.title, collection.label]} />
        <Row>
          <Col lg={8}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
          </Col>
          <Col lg={4}>
            <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
              <div className="action-buttons">
                <AppButton
                  color="primary"
                  className="source-scrape-feeds-button"
                  label={formatMessage(localMessages.scrapeAll)}
                  onClick={this.onScrapeAll}
                  disabled={this.state.scrapedAll}
                />
              </div>
            </Permissioned>
          </Col>
        </Row>
        { tabContent }
        <Row>
          <Col lg={12}>
            <br /><br />
            <div className="source-table">
              <table width="100%">
                <tbody>
                  <tr>
                    <th colSpan="2"><FormattedMessage {...messages.sourceName} /></th>
                    <th><FormattedMessage {...messages.sourceUrlProp} /></th>
                    <th className="numeric"><FormattedMessage {...messages.storiesPerDay} /></th>
                    <th className="numeric"><FormattedMessage {...messages.sourceStartDate} /></th>
                    <th className="numeric"><FormattedMessage {...localMessages.inLast90Days} /></th>
                    <th className="numeric"><FormattedMessage {...localMessages.inLastYear} /></th>
                    <th className="numeric"><FormattedMessage {...localMessages.activeFeedCount} /></th>
                    <th><FormattedMessage {...messages.sourceScrapeStatus} /></th>
                  </tr>
                  {viewSources.map((source, idx) => {
                    const scrapeButton = (
                      <AppButton
                        color="secondary"
                        variant="outlined"
                        className="source-scrape-feeds-button"
                        label={formatMessage(localMessages.scrape)}
                        onClick={() => scrapeFeeds(source.media_id)}
                      />
                    );
                    const removeButton = (
                      <AppButton
                        color="secondary"
                        variant="outlined"
                        className="source-remove-feeds-button"
                        label={formatMessage(localMessages.remove)}
                        onClick={() => removeSource(collectionId, [source])}
                      />
                    );
                    let removeContent;
                    if (this.state.selectedViewIndex === REMOVE) {
                      removeContent = removeButton;
                    }
                    let scrapeContent;
                    const lastScrapeUpdatedDate = source.latest_scrape_job ? formatDate(jobStatusDateToMoment(source.latest_scrape_job.last_updated)) : 'n/a';
                    if (source && source.latest_scrape_job) {
                      if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_QUEUED) {
                        scrapeContent = (<FormattedMessage {...localMessages.lastScrapeQueuedSince} values={{ date: lastScrapeUpdatedDate }} />);
                      } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_RUNNING) {
                        scrapeContent = (<FormattedMessage {...localMessages.lastScrapeRunningSince} values={{ date: lastScrapeUpdatedDate }} />);
                      } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_COMPLETED) {
                        scrapeContent = (
                          <>
                            {scrapeButton}
                            <br />
                            <FormattedMessage {...localMessages.lastScrapeWorkedOn} values={{ date: lastScrapeUpdatedDate }} />
                          </>
                        );
                      } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_ERROR) {
                        scrapeContent = (
                          <>
                            {scrapeButton}
                            <br />
                            <FormattedMessage {...localMessages.lastScrapeFailedOn} values={{ date: lastScrapeUpdatedDate }} />
                          </>
                        );
                      }
                    } else {
                      scrapeContent = (
                        <>
                          {scrapeButton}
                          <br />
                          <FormattedMessage {...localMessages.neverScraped} />
                        </>
                      );
                    }
                    return (
                      <tr key={source.id ? source.id : source.media_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                        <td>
                          <img className="google-icon" src={googleFavIconUrl(source.url)} alt={source.name} />
                        </td>
                        <td>
                          <Link to={`/sources/${source.id ? source.id : source.media_id}`}>{source.name}</Link>
                          { source.isFavorite ? <FilledStarIcon /> : '' }
                        </td>
                        <td><a href={source.url} rel="noopener noreferrer" target="_blank">{source.url}</a></td>
                        <td className="numeric"><FormattedNumber value={Math.round(source.num_stories_90)} /></td>
                        <td className="date"><FormattedDate value={parseSolrShortDate(source.start_date)} /></td>
                        <td className={`numeric ${Math.round(source.num_stories_90 * 90) === 0 ? 'error' : ''}`}>
                          <FormattedNumber value={Math.round(source.num_stories_90 * 90)} />
                        </td>
                        <td className="numeric"><FormattedNumber value={source.num_stories_last_year} /></td>
                        <td className={`numeric ${source.active_feed_count === 0 ? 'error' : ''}`}>
                          <FormattedNumber value={source.active_feed_count} />
                        </td>
                        <td>
                          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
                            {scrapeContent}
                            {removeContent}
                          </Permissioned>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

ManageSourcesContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from store
  collectionId: PropTypes.number.isRequired,
  collection: PropTypes.object.isRequired,
  sources: PropTypes.array.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  scrapeFeeds: PropTypes.func.isRequired,
  scrapeAllFeeds: PropTypes.func.isRequired,
  removeSource: PropTypes.func.isRequired,
  // from hoc
  notifyOfCsvDownload: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  collectionId: state.sources.collections.selected.id,
  collection: state.sources.collections.selected.collectionDetails.object,
  fetchStatus: state.sources.collections.selected.collectionSourceList.fetchStatus,
  sources: state.sources.collections.selected.collectionSourceList.sources,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (collectionId) => {
    // fetch source list again here, but this time with details about feed count and scrape status
    const collId = collectionId !== null ? collectionId : ownProps.collectionId;
    dispatch(fetchCollectionSourceList(collId)).then(
      results => results.sources.forEach(source => dispatch(fetchSourceReviewInfo(source.media_id)))
    );
  },
  scrapeFeeds: (sourceId) => {
    dispatch(scrapeSourceFeeds(sourceId))
      .then((results) => {
        if ((results.job_state.state === SOURCE_SCRAPE_STATE_QUEUED)
          || (results.job_state.state === SOURCE_SCRAPE_STATE_RUNNING)) {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(messages.sourceScraping) }));
          // update the page so the user sees the new scrape status
          window.location.reload();
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(messages.sourceScrapeFailed) }));
        }
      });
  },
  removeSource: (collectionId, sources) => {
    const removeInfo = { id: collectionId };
    if (sources && sources.length > 0) {
      removeInfo['sources[]'] = sources.map(s => (s.id ? s.id : s.media_id));
    }
    dispatch(removeSourcesFromCollection(removeInfo))
      .then((result) => {
        if (result.success === 1) {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removedFeed) }));
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(messages.removeSourceError) }));
        }
      });
  },
  scrapeAllFeeds: (mediaIdList) => {
    mediaIdList.forEach(mediaId => dispatch(scrapeSourceFeeds(mediaId)));
    dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.startedScrapingAll) }));
  },
});

const fetchAsyncData = (dispatch, { collectionId }) => dispatch(fetchCollectionSourceList(collectionId))
  .then(results => results.sources.forEach(source => dispatch(fetchSourceReviewInfo(source.media_id))));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      withCsvDownloadNotifyContainer(
        ManageSourcesContainer
      )
    )
  )
);
