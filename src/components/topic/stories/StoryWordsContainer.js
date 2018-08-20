import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import withSampleSize from '../../common/composers/SampleSize';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { fetchTopicTopWords } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withHelp from '../../common/hocs/HelpfulContainer';
import EditableWordCloudDataCard from '../../common/EditableWordCloudDataCard';
import { filteredLinkTo, filtersAsUrlParams, combineQueryParams } from '../../util/location';
import messages from '../../../resources/messages';
import { generateParamStr } from '../../../lib/apiUtil';
import { VIEW_1K, mergeFilters } from '../../../lib/topicFilterUtil';
import { topicDownloadFilename } from '../../util/topicUtil';

const localMessages = {
  helpTitle: { id: 'story.words.help.title', defaultMessage: 'About Story Top Words' },
  helpText: { id: 'story.words.help.into',
    defaultMessage: '<p>This is a visualization showing the top words in this Story.  Rollover a word to see the stem and how often it was used in this Story.</p>',
  },
};

const WORD_CLOUD_DOM_ID = 'word-cloud';

class StoryWordsContainer extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { fetchData, filters } = this.props;
    if (nextProps.filters !== filters) {
      fetchData(nextProps);
    }
  }

  render() {
    const { storiesId, topicInfo, handleWordCloudClick, filters, initSampleSize, onViewSampleSizeClick } = this.props;
    const { formatMessage } = this.props.intl;
    const urlDownload = `/api/topics/${topicInfo.topics_id}/words.csv?${filtersAsUrlParams({ ...filters, q: combineQueryParams(filters.q, `stories_id:${storiesId}`) })}`;
    return (
      <EditableWordCloudDataCard
        words={this.props.words}
        explore={filteredLinkTo(`/topics/${topicInfo.topics_id}/words`, filters)}
        initSampleSize={initSampleSize}
        downloadUrl={urlDownload}
        onViewModeClick={handleWordCloudClick}
        onViewSampleSizeClick={onViewSampleSizeClick}
        title={formatMessage(messages.topWords)}
        domId={WORD_CLOUD_DOM_ID}
        svgDownloadPrefix={`${topicDownloadFilename(topicInfo.name, filters)}-story-${storiesId}-words`}
        includeTopicWord2Vec
      />
    );
  }
}

StoryWordsContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  onViewSampleSizeClick: PropTypes.func.isRequired,
  initSampleSize: PropTypes.string.isRequired,
  // from parent
  storiesId: PropTypes.number.isRequired,
  topicName: PropTypes.string.isRequired,
  filters: PropTypes.object,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  words: PropTypes.array.isRequired,
  handleWordCloudClick: PropTypes.func,
  topicInfo: PropTypes.object,

};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.story.words.fetchStatus,
  topicInfo: state.topics.selected.info,
  words: state.topics.selected.story.words.list,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (props) => {
    const currentProps = props || ownProps;
    const filterObj = mergeFilters(currentProps, `stories_id:${ownProps.storiesId}`);
    dispatch(fetchTopicTopWords(ownProps.topicId, filterObj));
  },
  pushToUrl: url => dispatch(push(url)),
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData({ ...stateProps, sample_size: VIEW_1K }); // fetch the info we need
    },
    handleWordCloudClick: (word) => {
      const params = generateParamStr({ ...stateProps.filters, stem: word.stem, term: word.term });
      const url = `/topics/${ownProps.topicId}/words/${word.stem}*?${params}`;
      dispatchProps.pushToUrl(url);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.wordcloudHelpText, messages.wordCloudTopicWord2VecLayoutHelp])(
        withSampleSize(
          withAsyncFetch(
            withCsvDownloadNotifyContainer(
              StoryWordsContainer
            )
          )
        )
      )
    )
  );
