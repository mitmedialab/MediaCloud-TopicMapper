import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { fetchPlatformWords } from '../../../actions/platformActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import withHelp from '../../common/hocs/HelpfulContainer';
import messages from '../../../resources/messages';
import PeriodicEditableWordCloudDataCard from '../../common/PeriodicEditableWordCloudDataCard';
import { downloadData } from '../../common/EditableWordCloudDataCard';
import { getCurrentDate, oneMonthBefore, getDateRange, PAST_WEEK } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';

const localMessages = {
  title: { id: 'source.summary.topWords.title', defaultMessage: 'Top Words' },
  intro: { id: 'source.summary.topWords.info',
    defaultMessage: '<p>This wordcloud shows you the most commonly used words in this source (based on a sample of stories). Click a word to load an Explorer search showing you how the this source writes about it.</p>' },
  helpTitle: { id: 'source.summary.sentenceCount.help.title', defaultMessage: 'About Top Words' },
};

const fetchAsyncData = (dispatch, { source, timePeriod }) => {
  // the first time this is called, timePeriod isn't set becuase it isn't a prop; but future calls set it manually from the state variable
  const dateObj = getDateRange(timePeriod || PAST_WEEK);
  dateObj.start = dateObj.start.format('YYYY-MM-DD');
  dateObj.end = dateObj.end.format('YYYY-MM-DD');
  dispatch(fetchPlatformWords({ uid: 'mediaSource', platform_query: `media_id:${source.media_id}`, start_date: dateObj.start, end_date: dateObj.end }));
};

class SourceTopWordsContainer extends React.Component {
  state = {
    timePeriod: PAST_WEEK,
  };

  fetchWordsByTimePeriod = (dateQuery, timePeriod) => {
    const { source, dispatch } = this.props;
    this.setState({ timePeriod });
    fetchAsyncData(dispatch, { source, timePeriod });
  }

  handleDownload = (ngramSize, sampleSize, words) => {
    const { source } = this.props;
    const filename = `source-${source.media_id}-ngram-${ngramSize}-words.csv`;
    downloadData(filename, words, sampleSize);
  }

  defaultOnWordClick = (word) => {
    const { source } = this.props;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const searchStr = `${word.stem}*`;
    const explorerUrl = urlToExplorerQuery(source.name || source.url, searchStr, [source.media_id], [], startDate, endDate);
    window.open(explorerUrl, '_blank');
  }

  render() {
    const { source, words, helpButton } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <PeriodicEditableWordCloudDataCard
        words={words}
        handleTimePeriodClick={this.fetchWordsByTimePeriod}
        selectedTimePeriod={this.state.timePeriod}
        onDownload={this.handleDownload}
        onViewModeClick={this.defaultOnWordClick}
        title={formatMessage(localMessages.title)}
        domId={`media-source-top-words-${source.media_id}`}
        width={900}
        helpButton={helpButton}
      />
    );
  }
}

SourceTopWordsContainer.propTypes = {
  // from parent
  source: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  words: PropTypes.array,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.platforms.words.fetchStatus,
  words: state.platforms.words.results.mediaSource ? state.platforms.words.results.mediaSource.list : [],
});

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.intro, messages.wordSpaceLayoutHelp])(
      withAsyncData(fetchAsyncData)(
        SourceTopWordsContainer
      )
    )
  )
);
