import PropTypes from 'prop-types';
import React from 'react';
import { Col } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { fetchQueryPerDateTopWords, fetchDemoQueryPerDateTopWords, fetchQueryPerDateSampleStories,
  fetchDemoQueryPerDateSampleStories, resetQueriesPerDateTopWords, resetQueriesPerDateSampleStories,
  resetSentenceDataPoint } from '../../../../actions/explorerActions';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import CloseableDataCard from '../../../common/CloseableDataCard';
import StorySentencePreview from '../../../common/StorySentencePreview';
import OrderedWordCloud from '../../../vis/OrderedWordCloud';

const localMessages = {
  sampleSentences: { id: 'explorer.attention.drillDown.sampleSentences', defaultMessage: 'Sample Sentences' },
  topWords: { id: 'explorer.attention.drillDown.topWords', defaultMessage: 'Top Words' },
  topStories: { id: 'explorer.attention.drillDown.topStories', defaultMessage: 'Top Stories' },
  detailsSingular: { id: 'explorer.attention.drillDown.details', defaultMessage: 'Details for {date1}' },
  detailsRange: { id: 'explorer.attention.drillDown.details', defaultMessage: 'Details for {date1} to {date2}' },
};

class QueryAttentionOverTimeDrillDownContainer extends React.Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    const { dataPoint, lastSearchTime } = this.props;
    return (nextProps.lastSearchTime !== lastSearchTime || nextProps.dataPoint !== dataPoint);
  }

  componentDidUpdate(prevProps) {
    const { dataPoint } = this.props;
    const prevDataPoint = prevProps.dataPoint;
    const rootNode = this.rootRef;
    // have to treat this node carefully, because it might not be showing
    if (rootNode && rootNode.current && dataPoint && (dataPoint !== prevDataPoint)) {
      rootNode.current.scrollIntoView();
    }
  }

  render() {
    const { words, handleClose, sentences, dataPoint } = this.props;
    let content = <span />;
    if (dataPoint) {
      const date1 = dataPoint.start_date;
      const date2 = dataPoint.end_date;
      const dateTitle = dataPoint.dayGap ? <h2><FormattedMessage {...localMessages.detailsSingular} values={{ date1 }} /></h2> : <h2><FormattedMessage {...localMessages.detailsRange} values={{ date1, date2 }} /></h2>;
      const hexToRGBArray = clr => clr.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(v, 16));
      const rgbColor = dataPoint.color ? hexToRGBArray(dataPoint.color) : '#000000';
      content = (
        <div className="drill-down" ref={this.rootRef}>
          <CloseableDataCard title={dateTitle} onClose={handleClose}>
            <>
              { sentences && (
                <Col lg={6}>
                  <h3 style={{ rgbColor }}><FormattedMessage {...localMessages.sampleSentences} /></h3>
                  <StorySentencePreview sentences={sentences.slice(0, 8)} />
                </Col>
              )}
              { words && (
                <Col lg={6}>
                  <h3 style={{ rgbColor }}><FormattedMessage {...localMessages.topWords} /></h3>
                  <OrderedWordCloud words={words} textColor={`rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`} />
                </Col>
              )}
            </>
          </CloseableDataCard>
        </div>
      );
    }
    return content;
  }
}

QueryAttentionOverTimeDrillDownContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleClose: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.array.isRequired,
  dataPoint: PropTypes.object,
  words: PropTypes.array,
  sentences: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: [state.explorer.storiesPerDateRange.fetchStatus, state.explorer.topWordsPerDateRange.fetchStatus],
  dataPoint: state.explorer.storySplitCount.dataPoint,
  words: state.explorer.topWordsPerDateRange.results,
  sentences: state.explorer.storiesPerDateRange.results,
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => {
    dispatch(resetSentenceDataPoint());
    dispatch(resetQueriesPerDateSampleStories());
    dispatch(resetQueriesPerDateTopWords());
  },
});

const fetchAsyncData = (dispatch, { isLoggedIn, dataPoint }) => {
  // this should trigger when the user clicks a data point on the attention over time chart
  dispatch(resetQueriesPerDateSampleStories());
  dispatch(resetQueriesPerDateTopWords());
  if (dataPoint) {
    if (isLoggedIn) {
      dispatch(fetchQueryPerDateSampleStories({ ...dataPoint }));
      dispatch(fetchQueryPerDateTopWords({ ...dataPoint }));
    } else {
      dispatch(fetchDemoQueryPerDateTopWords(dataPoint));
      dispatch(fetchDemoQueryPerDateSampleStories(dataPoint));
    }
  }
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['dataPoint'])(
      QueryAttentionOverTimeDrillDownContainer
    )
  )
);
