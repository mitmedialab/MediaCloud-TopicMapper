import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ActionMenu from '../../common/ActionMenu';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { postToDownloadUrl, downloadExplorerSvg } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import WordSpace from '../../vis/WordSpace';
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
    const { results, selectedQuery, tabSelector } = this.props;
    const domId = `${WORD_SPACE_DOM_ID}-${selectedQuery.uid}`;
    const selectedResults = results[selectedQuery.uid];
    if (selectedResults) {
      return (
        <div>
          {tabSelector}
          <WordSpace
            words={selectedResults.results.slice(0, 50)}
            domId={domId}
            xProperty="google_w2v_x"
            yProperty="google_w2v_y"
            noDataMsg={localMessages.noGoogleW2VData}
            length={660}
          />
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <SVGAndCSVMenu
                downloadCsv={() => this.handleDownloadCsv(selectedQuery)}
                downloadSvg={() => downloadExplorerSvg(selectedQuery.label, 'sampled-word-space', domId)}
                label={selectedQuery.label}
              />
            </ActionMenu>
          </div>
        </div>
      );
    }
    return <div>Error</div>;
  }
}

QueryWordSpaceResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  selectedQuery: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleWordCloudClick: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleWordCloudClick: (word) => {
    ownProps.onQueryModificationRequested(word.term);
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.descriptionIntro, messages.wordSpaceLayoutHelp)(
      // pass through with no async fetch because the WordsResults container fetches all the data for us!
      withQueryResults()(
        QueryWordSpaceResultsContainer
      )
    )
  )
);
