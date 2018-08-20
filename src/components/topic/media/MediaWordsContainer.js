import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import withSampleSize from '../../common/composers/SampleSize';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { filteredLinkTo, filtersAsUrlParams, combineQueryParams } from '../../util/location';
import { fetchTopicTopWords } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withHelp from '../../common/hocs/HelpfulContainer';
import EditableWordCloudDataCard from '../../common/EditableWordCloudDataCard';
import messages from '../../../resources/messages';
import { generateParamStr } from '../../../lib/apiUtil';
import { VIEW_1K, mergeFilters } from '../../../lib/topicFilterUtil';
import { topicDownloadFilename } from '../../util/topicUtil';

const localMessages = {
  helpTitle: { id: 'media.words.help.title', defaultMessage: 'About Media Top Words' },
  helpText: { id: 'media.words.help.into',
    defaultMessage: '<p>This is a visualization showing the top words used by this Media Source within the Topic.</p>',
  },
};

const WORD_CLOUD_DOM_ID = 'topic-summary-media-word-cloud';


class MediaWordsContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { fetchData, filters } = this.props;
    if (nextProps.filters !== filters) {
      fetchData(nextProps);
    }
  }

  render() {
    const { topicInfo, topicId, mediaId, initSampleSize, onViewSampleSizeClick, filters, handleWordCloudClick } = this.props;
    const urlDownload = `/api/topics/${topicId}/words.csv?${filtersAsUrlParams({ ...filters, q: combineQueryParams(filters.q, `media_id:${mediaId}`) })}`;
    const { formatMessage } = this.props.intl;
    return (
      <EditableWordCloudDataCard
        words={this.props.words}
        explore={filteredLinkTo(`/topics/${topicId}/words`, filters)}
        initSampleSize={initSampleSize}
        downloadUrl={urlDownload}
        onViewModeClick={handleWordCloudClick}
        onViewSampleSizeClick={onViewSampleSizeClick}
        title={formatMessage(messages.topWords)}
        domId={WORD_CLOUD_DOM_ID}
        svgDownloadPrefix={`${topicDownloadFilename(topicInfo.name, filters)}-media-${mediaId}-words`}
        includeTopicWord2Vec
      />
    );
  }
}

MediaWordsContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  onViewSampleSizeClick: PropTypes.func.isRequired,
  initSampleSize: PropTypes.string.isRequired,
  // from parent
  mediaId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  // from state
  words: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
  handleWordCloudClick: PropTypes.func,
  topicInfo: PropTypes.object,

};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.mediaSource.words.fetchStatus,
  topicInfo: state.topics.selected.info,
  words: state.topics.selected.mediaSource.words.list,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (props) => {
    const currentProps = props || ownProps;
    const filterObj = mergeFilters(currentProps, `media_id:${ownProps.mediaId}`);
    dispatch(fetchTopicTopWords(ownProps.topicId, filterObj));
  },
  pushToUrl: url => dispatch(push(url)),
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData({ ...stateProps, sample_size: VIEW_1K });
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
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.wordCloudTopicWord2VecLayoutHelp])(
        withSampleSize(
          withAsyncFetch(
            withCsvDownloadNotifyContainer(
              MediaWordsContainer
            )
          )
        )
      )
    )
  );
