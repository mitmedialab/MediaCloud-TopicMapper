import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { fetchPlatformWords } from '../../../actions/platformActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import PeriodicEditableWordCloudDataCard from '../../common/PeriodicEditableWordCloudDataCard';
import { downloadData } from '../../common/EditableWordCloudDataCard';
import withHelp from '../../common/hocs/HelpfulContainer';
import messages from '../../../resources/messages';
import { getCurrentDate, oneMonthBefore, getDateRange, PAST_WEEK } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';

const localMessages = {
  title: { id: 'collection.summary.topWords.title', defaultMessage: 'Top Words' },
  intro: { id: 'collection.summary.topWords.intro',
    defaultMessage: '<p>This wordcloud shows you the most commonly used words in this collection (based on a sample of sentences). Click a word to load an Explorer search showing you how sources in this colleciton write about it.</p>' },
  helpTitle: { id: 'collection.summary.topWords.help.title', defaultMessage: 'About Top Words' },
};

const fetchAsyncData = (dispatch, { collectionId, timePeriod }) => {
  // the first time this is called, timePeriod isn't set becuase it isn't a prop; but future calls set it manually from the state variable
  const dateObj = getDateRange(timePeriod || PAST_WEEK);
  dateObj.start = dateObj.start.format('YYYY-MM-DD');
  dateObj.end = dateObj.end.format('YYYY-MM-DD');
  dispatch(fetchPlatformWords({ uid: 'collection', platform_query: `tags_id_media:${collectionId}`, start_date: dateObj.start, end_date: dateObj.end }));
};

class CollectionTopWordsContainer extends React.Component {
  state = {
    timePeriod: PAST_WEEK,
  };

  fetchWordsByTimePeriod = (dateQuery, timePeriod) => {
    const { collectionId, dispatch } = this.props;
    this.setState({ timePeriod });
    fetchAsyncData(dispatch, { collectionId, timePeriod });
  }

  handleDownload = (ngramSize, sampleSize, words) => {
    const { collectionId } = this.props;
    const filename = `colletion-${collectionId}-ngram-${ngramSize}-words.csv`;
    downloadData(filename, words, sampleSize);
  }

  handleWordClick = (word) => {
    const { collectionName, collectionId } = this.props;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const searchStr = `${word.stem}*`;
    const explorerUrl = urlToExplorerQuery(collectionName, searchStr, [], [collectionId], startDate, endDate);
    window.open(explorerUrl, '_blank');
  }

  render() {
    const { collectionId, words, helpButton } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <PeriodicEditableWordCloudDataCard
        words={words}
        handleTimePeriodClick={this.fetchWordsByTimePeriod}
        selectedTimePeriod={this.state.timePeriod}
        onDownload={this.handleDownload}
        onViewModeClick={this.handleWordClick}
        title={formatMessage(localMessages.title)}
        domId={`collection-top-words-${collectionId}`}
        width={520}
        helpButton={helpButton}
      />
    );
  }
}

CollectionTopWordsContainer.propTypes = {
  // from parent
  collectionId: PropTypes.number.isRequired,
  collectionName: PropTypes.string.isRequired,
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
  words: state.platforms.words.results.collection ? state.platforms.words.results.collection.list : [],
});

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.intro, messages.wordSpaceLayoutHelp])(
      withAsyncData(fetchAsyncData)(
        CollectionTopWordsContainer
      )
    )
  )
);
