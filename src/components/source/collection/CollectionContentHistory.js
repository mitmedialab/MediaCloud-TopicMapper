import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { Link } from 'react-router';
import Title from 'react-title-component';
import { fetchCollectionSourceSentenceHistoricalCounts, setCollectionSourceHistoryTimePeriod } from '../../../actions/sourceActions';
import composeAsyncContainer from '../../common/AsyncContainer';
import composePeriodicContent from '../../common/PeriodicContent';
import { getBrandDarkColor } from '../../../styles/colors';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';
import { getDateRange } from '../../../lib/dateUtil';
import { slugifyLocalSourcePath } from '../../../lib/urlUtil';

const localMessages = {
  title: { id: 'collection.contentHistory.title', defaultMessage: 'Total Sentences over Time' },
  counts: { id: 'collection.contentHistory.counts', defaultMessage: '{stories} Stories, {sentences} Sentences' },
};

class CollectionContentHistory extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { collectionId, fetchData, selectedTimePeriod } = this.props;
    if ((nextProps.collectionId !== collectionId) || (nextProps.selectedTimePeriod !== selectedTimePeriod)) {
      fetchData(nextProps.collectionId, nextProps.selectedTimePeriod);
    }
  }

  render() {
    const { collection, historicalCounts, timePeriodControls } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    const titleHandler = parentTitle => `${formatMessage(localMessages.title)} | ${parentTitle}`;
    return (
      <div>
        <Title render={titleHandler} />
        <Grid>
          <h1>
            {collection.label} - <FormattedMessage {...localMessages.title} />
            {timePeriodControls}
          </h1>
          {historicalCounts.map(source => (
            <Row key={source.media_id}>
              <Col lg={2} xs={12}>
                <h3><Link to={slugifyLocalSourcePath(source)}>{source.media_name}</Link></h3>
                <p>
                  <FormattedMessage
                    {...localMessages.counts}
                    values={{
                      stories: formatNumber(source.total_stories),
                      sentences: formatNumber(source.total_sentences),
                    }}
                  />
                </p>
              </Col>
              <Col lg={8} xs={12}>
                <AttentionOverTimeChart
                  data={source.sentencesOverTime}
                  height={150}
                  filename={`source-${source.media_id}-history`}
                  lineColor={getBrandDarkColor()}
                  onDataPointClick={this.handleDataPointClick}
                  showLegend={false}
                />
              </Col>
            </Row>
            )
          )}
        </Grid>
      </div>
    );
  }

}

CollectionContentHistory.propTypes = {
  intl: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  // from state
  collectionId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  collection: PropTypes.object.isRequired,
  historicalCounts: PropTypes.array.isRequired,
  timePeriodControls: PropTypes.node.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
  // from dispatch
  handleTimePeriodClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  collectionId: state.sources.collections.selected.id,
  collection: state.sources.collections.selected.collectionDetails.object,
  fetchStatus: state.sources.collections.selected.historicalSentenceCounts.fetchStatus,
  selectedTimePeriod: state.sources.collections.selected.historicalSentenceCounts.timePeriod,
  historicalCounts: state.sources.collections.selected.historicalSentenceCounts.counts,
});

const mapDispatchToProps = dispatch => ({
  fetchData: (collectionId, timePeriod) => {
    const dates = getDateRange(timePeriod);
    dispatch(fetchCollectionSourceSentenceHistoricalCounts(collectionId,
      { start: dates.start.format('YYYY-MM-DD'), end: dates.end.format('YYYY-MM-DD') }));
  },
  changeTimePeriod: (timePeriod) => {
    dispatch(setCollectionSourceHistoryTimePeriod(timePeriod));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps.collectionId, stateProps.selectedTimePeriod);
    },
    handleTimePeriodClick: (dateQuery, timePeriod) => {
      dispatchProps.changeTimePeriod(timePeriod);
      dispatchProps.fetchData(stateProps.collectionId, timePeriod);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composePeriodicContent(
        composeAsyncContainer(
          CollectionContentHistory
        ),
        true, // hide the ALL_TIME option
      )
    )
  );
