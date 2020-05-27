import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { fetchTopicSimilarWords } from '../../../actions/topicActions';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import WordSimilarWords from './WordSimilarWords';

const WordSimilarWordsContainer = props => <WordSimilarWords similarWords={props.similarWords} />;

WordSimilarWordsContainer.propTypes = {
  // from composition chain
  filters: PropTypes.object.isRequired,
  // from parent
  term: PropTypes.string.isRequired,
  stem: PropTypes.string.isRequired,
  topicId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  similarWords: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.word.similarWords.fetchStatus,
  similarWords: state.topics.selected.word.similarWords.words,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicSimilarWords(props.topicId, props.stem, props.filters));
};

export default
connect(mapStateToProps)(
  withFilteredAsyncData(fetchAsyncData, ['stem'])(
    WordSimilarWordsContainer
  )
);
