import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const SELECT_WORD = 'SELECT_WORD';
export const FETCH_WORD = 'FETCH_WORD';
export const FETCH_WORD_SPLIT_STORY_COUNT = 'FETCH_WORD_SENTENCE_COUNT';
export const FETCH_WORD_SAMPLE_SENTENCES = 'FETCH_WORD_SAMPLE_SENTENCES';
export const FETCH_TOPIC_SIMILAR_WORDS = 'FETCH_TOPIC_SIMILAR_WORDS';

export const selectWord = createAction(SELECT_WORD, payload => payload);

export const fetchWord = createAsyncAction(FETCH_WORD, api.word);

// pass in topic id, media id, snapshot id, timespan id
export const fetchWordSplitStoryCounts = createAsyncAction(FETCH_WORD_SPLIT_STORY_COUNT, api.wordSplitStoryCounts);

export const fetchWordSampleSentences = createAsyncAction(FETCH_WORD_SAMPLE_SENTENCES, api.wordSampleSentences);

// pass in topicId, word, and snapshotId
export const fetchTopicSimilarWords = createAsyncAction(FETCH_TOPIC_SIMILAR_WORDS, api.topicSimilarWords);
