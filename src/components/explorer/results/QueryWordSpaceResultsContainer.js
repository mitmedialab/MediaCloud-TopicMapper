import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ActionMenu from '../../common/ActionMenu';
import composeSummarizedVisualization from './SummarizedVizualization';
import { postToDownloadUrl, downloadExplorerSvg } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import WordSpace from '../../vis/WordSpace';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withQueryResults from './QueryResultsSelector';
import SVGAndCSVMenu from '../../common/SVGAndCSVMenu';

const localMessages = {
  title: { id: 'explorer.topWords.title', defaultMessage: 'Word Space' },
  descriptionIntro: { id: 'explorer.topWords.help.title', defaultMessage: '<p>Understanding which words are used together can help you find sub-conversations within the reporting about your issue.  We created this chart to show information about how the top 50 words are used. The bigger and darker a word is, the more it is used. Words are laid out based on how they are used in general news reporting (not based on the stories matching your query). Rollover a word to highlight words used in similar phrases in general news reporting.</p>' },
  noGoogleW2VData: { id: 'wordcloud.editable.mode.googleW2V.noData', defaultMessage: 'Sorry, but the Google News word2vec data is missing.' },
  downloadCsv: { id: 'explorer.googleW2V.downloadCsv', defaultMessage: 'Download { name } word space CSV' },
  downloadSvg: { id: 'explorer.googleW2V.downloadSvg', defaultMessage: 'Download { name } word space SVG' },
};

const WORD_SPACE_DOM_ID = 'query-word-space-wrapper';

class QueryWordSpaceResultsContainer extends React.Component {
  handleDownloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/words/wordcount.csv', query);
  }
  render() {
    const { results, queries, selectedTabIndex, tabSelector } = this.props;
    const domId = `${WORD_SPACE_DOM_ID}-${selectedTabIndex}`;
    return (
      <div>
        {tabSelector}
        <WordSpace
          words={results[selectedTabIndex].list.slice(0, 50)}
          domId={domId}
          xProperty="google_w2v_x"
          yProperty="google_w2v_y"
          noDataMsg={localMessages.noGoogleW2VData}
          length={660}
        />
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <SVGAndCSVMenu
              downloadCsv={() => this.handleDownloadCsv(queries[selectedTabIndex])}
              downloadSvg={() => downloadExplorerSvg(queries[selectedTabIndex].label, 'sampled-word-space', domId)}
              label={queries[selectedTabIndex].label}
            />
          </ActionMenu>
        </div>
      </div>
    );
  }
}

QueryWordSpaceResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from dispatch
  handleWordCloudClick: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleWordCloudClick: (word) => {
    ownProps.onQueryModificationRequested(word.term);
  },
  asyncFetch: () => {
    // pass through because the WordsResults container fetches all the data for us!
  },
  fetchData: () => {
    // pass through because the WordsResults container fetches all the data for us!
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeSummarizedVisualization(localMessages.title, localMessages.descriptionIntro, messages.wordSpaceLayoutHelp)(
        withAsyncFetch(
          withQueryResults(
            QueryWordSpaceResultsContainer
          )
        )
      )
    )
  );
