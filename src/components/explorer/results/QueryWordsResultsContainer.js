import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withSummary from '../../common/hocs/SummarizedVizualization';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
import { fetchQueryTopWords, fetchDemoQueryTopWords, resetTopWords, selectWord, setQueryWordCountSampleSize }
  from '../../../actions/explorerActions';
import { postToDownloadUrl, slugifiedQueryLabel } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';
import EditableWordCloudDataCard from '../../common/EditableWordCloudDataCard';

const localMessages = {
  descriptionIntro: { id: 'explorer.topWords.help.title', defaultMessage: '<p>Here are the top words used with each query. Looking at the language used can help you identify how this issue is talked about in the media online.</p>' },
  menuHeader: { id: 'explorer.topWords.menuHeader', defaultMessage: 'Query: {queryName}' },
};

const WORD_CLOUD_DOM_ID = 'query-word-cloud-wrapper';

class QueryWordsResultsContainer extends React.Component {
  handleDownload = (query, ngramSize, sampleSize) => {
    postToDownloadUrl('/api/explorer/words/wordcount.csv', query, { ngramSize, sample_size: sampleSize });
  }

  handleWordClick = (wordDataPoint) => {
    const { handleSelectedWord, selectedQuery, isLoggedIn, onShowLoginDialog } = this.props;
    if (isLoggedIn) {
      handleSelectedWord(selectedQuery, wordDataPoint.term);
    } else {
      onShowLoginDialog();
    }
  }

  render() {
    const { results, queries, tabSelector, selectedTabIndex, internalItemSelected, handleViewSampleSizeClick } = this.props;
    const selectedQuery = queries[selectedTabIndex];
    if (results && results.length > 0) {
      // save sample size to props somewhere
      return (
        <EditableWordCloudDataCard
          onViewSampleSizeClick={handleViewSampleSizeClick}
          initSampleSize={results[selectedTabIndex].sample_size}
          subHeaderContent={tabSelector}
          words={results[selectedTabIndex].results}
          onViewModeClick={this.handleWordClick}
          border={false}
          domId={WORD_CLOUD_DOM_ID}
          width={585}
          onDownload={ngramSize => this.handleDownload(selectedQuery, ngramSize, results[selectedTabIndex].sample_size)}
          svgDownloadPrefix={`${slugifiedQueryLabel(selectedQuery.label)}-ngram-1`}
          textColor={selectedQuery.color}
          actionsAsLinksUnderneath
          showTooltips
          hideGoogleWord2Vec
          selectedTerm={internalItemSelected ? internalItemSelected.word : ''}
        />
      );
    }
    return <div>Error</div>;
  }
}

QueryWordsResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from hocs
  intl: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  selectedQuery: PropTypes.object.isRequired,
  tabSelector: PropTypes.object.isRequired,
  onShowLoginDialog: PropTypes.func.isRequired,
  // from dispatch
  handleSelectedWord: PropTypes.func.isRequired,
  handleViewSampleSizeClick: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
  internalItemSelected: PropTypes.object,
  sampleSize: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
  internalItemSelected: state.explorer.topWords.selectedWord,
  sampleSize: state.explorer.topWords.sampleSize,
});

const mapDispatchToProps = dispatch => ({
  handleViewSampleSizeClick: (sampleSize) => {
    dispatch(setQueryWordCountSampleSize(sampleSize));
  },
  handleSelectedWord: (selectedQuery, word) => {
    // add the word they clicked to the query and save that for drilling down into
    const clickedQuery = {
      q: `${selectedQuery.q} AND ${word}`,
      start_date: selectedQuery.startDate,
      end_date: selectedQuery.endDate,
      sources: selectedQuery.sources.map(s => s.id),
      collections: selectedQuery.collections.map(c => c.id),
      word,
      rows: 1000, // need a big sample size here for good results
    };
    // dispatch(resetSelectedWord());
    dispatch(selectWord(clickedQuery));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    shouldUpdate: (nextProps) => { // QueryResultsSelector needs to ask the child for internal repainting
      const { internalItemSelected } = stateProps;
      return nextProps.internalItemSelected !== internalItemSelected;
    },
  });
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withSummary(messages.topWords, localMessages.descriptionIntro, messages.wordcloudHelpText)(
      withQueryResults(resetTopWords, fetchQueryTopWords, fetchDemoQueryTopWords, ['sampleSize'])(
        withLoginRequired(
          QueryWordsResultsContainer
        )
      )
    )
  )
);
