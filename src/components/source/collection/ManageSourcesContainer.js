import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedNumber, injectIntl, FormattedDate } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import composeAsyncContainer from '../../common/AsyncContainer';
import { fetchCollectionSourceList, scrapeSourceFeeds } from '../../../actions/sourceActions';
import AppButton from '../../common/AppButton';
import messages from '../../../resources/messages';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { updateFeedback } from '../../../actions/appActions';
import { SOURCE_SCRAPE_STATE_QUEUED, SOURCE_SCRAPE_STATE_RUNNING, SOURCE_SCRAPE_STATE_COMPLETED, SOURCE_SCRAPE_STATE_ERROR } from '../../../reducers/sources/sources/selected/sourceDetails';
import FilledStarIcon from '../../common/icons/FilledStarIcon';
import { googleFavIconUrl, slugifyLocalSourcePath } from '../../../lib/urlUtil';
import { parseSolrShortDate, jobStatusDateToMoment } from '../../../lib/dateUtil';

const localMessages = {
  title: { id: 'collection.manageSources.title', defaultMessage: 'Manage Sources' },
  scrapeAll: { id: 'collection.manageSources.scrapeAll', defaultMessage: 'Scrape all For New Feeds' },
  inLast90Days: { id: 'collection.manageSources.column.last90', defaultMessage: '90 Day Story Count' },
  startedScrapingAll: { id: 'collection.manageSources.startedScrapingAll', defaultMessage: 'Started scraping all sources for RSS feeds' },
  lastScrapeQueuedSince: { id: 'source.basicInfo.feed.lastScrapeQueuedSince', defaultMessage: 'Queued since {date}' },
  lastScrapeRunningSince: { id: 'source.basicInfo.feed.lastScrapeRunningSince', defaultMessage: 'Running since {date}' },
  lastScrapeWorkedOn: { id: 'source.basicInfo.feed.lastScrapeWorkedOn', defaultMessage: 'Worked on {date}' },
  lastScrapeFailedOn: { id: 'source.basicInfo.feed.lastScrapeFailedOn', defaultMessage: 'Failed on {date}) ' },
  activeFeedCount: { id: 'collection.manageSources.column.activeFeedCount', defaultMessage: 'Active Feeds' },
};

class ManageSourcesContainer extends React.Component {

  state = {
    scrapedAll: false,
  }

  componentWillReceiveProps(nextProps) {
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

  render() {
    const { scrapeFeeds, sources } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    return (
      <Grid>
        <Row>
          <Col lg={8}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
          </Col>
          <Col lg={4}>
            <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
              <div className="action-buttons">
                <AppButton
                  className="source-scrape-feeds-button"
                  label={formatMessage(localMessages.scrapeAll)}
                  onClick={this.onScrapeAll}
                  disabled={this.state.scrapedAll}
                />
              </div>
            </Permissioned>
          </Col>
        </Row>
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
                    <th className="numeric"><FormattedMessage {...localMessages.activeFeedCount} /></th>
                    <th><FormattedMessage {...messages.sourceScrapeStatus} /></th>
                  </tr>
                  {sources.map((source, idx) => {
                    const scrapeButton = (
                      <AppButton
                        className="source-scrape-feeds-button"
                        label={formatMessage(messages.scrapeForFeeds)}
                        onClick={() => scrapeFeeds(source.media_id)}
                      />
                    );
                    let scrapeContent;
                    const lastScrapeUpdatedDate = formatDate(jobStatusDateToMoment(source.latest_scrape_job.last_updated));
                    if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_QUEUED) {
                      scrapeContent = (
                        <span>
                          <FormattedMessage {...localMessages.lastScrapeQueuedSince} values={{ date: lastScrapeUpdatedDate }} />
                        </span>
                      );
                    } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_RUNNING) {
                      scrapeContent = (
                        <span>
                          <FormattedMessage {...localMessages.lastScrapeRunningSince} values={{ date: lastScrapeUpdatedDate }} />
                        </span>
                      );
                    } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_COMPLETED) {
                      scrapeContent = (
                        <span>
                          {scrapeButton} &nbsp;
                          <FormattedMessage {...localMessages.lastScrapeWorkedOn} values={{ date: lastScrapeUpdatedDate }} />
                        </span>
                      );
                    } else if (source.latest_scrape_job.state === SOURCE_SCRAPE_STATE_ERROR) {
                      scrapeContent = (
                        <span>
                          {scrapeButton} &nbsp;
                          <FormattedMessage {...localMessages.lastScrapeFailedOn} values={{ date: lastScrapeUpdatedDate }} />
                        </span>
                      );
                    }
                    return (
                      <tr key={source.id ? source.id : source.media_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                        <td>
                          <img className="google-icon" src={googleFavIconUrl(source.url)} alt={source.name} />
                        </td>
                        <td>
                          <Link to={slugifyLocalSourcePath(source)}>{source.name}</Link>
                          { source.isFavorite ? <FilledStarIcon /> : '' }
                        </td>
                        <td><a href={source.url} rel="noopener noreferrer" target="_blank">{source.url}</a></td>
                        <td className="numeric"><FormattedNumber value={Math.round(source.num_stories_90)} /></td>
                        <td className="numeric"><FormattedDate value={parseSolrShortDate(source.start_date)} /></td>
                        <td className="numeric"><FormattedNumber value={Math.round(source.num_stories_90 * 90)} /></td>
                        <td className="numeric"><FormattedNumber value={source.active_feed_count} /></td>
                        <td>
                          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
                            {scrapeContent}
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
};

const mapStateToProps = state => ({
  collectionId: state.sources.collections.selected.id,
  collection: state.sources.collections.selected.collectionDetails.object,
  fetchStatus: state.sources.collections.selected.collectionSourceList.fetchStatus,
  sources: state.sources.collections.selected.collectionSourceList.sources,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (collectionId) => {
    dispatch(fetchCollectionSourceList(collectionId));
  },
  scrapeFeeds: (sourceId) => {
    dispatch(scrapeSourceFeeds(sourceId))
      .then((results) => {
        if ((results.job_state.state === SOURCE_SCRAPE_STATE_QUEUED) ||
          (results.job_state.state === SOURCE_SCRAPE_STATE_RUNNING)) {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(messages.sourceScraping) }));
          // update the page so the user sees the new scrape status
          window.location.reload();
        } else {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(messages.sourceScrapeFailed) }));
        }
      });
  },
  scrapeAllFeeds: (mediaIdList) => {
    mediaIdList.forEach(mediaId => dispatch(scrapeSourceFeeds(mediaId)));
    dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.startedScrapingAll) }));
  },
});


function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps.collectionId);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeAsyncContainer(
        ManageSourcesContainer
      )
    )
  );
