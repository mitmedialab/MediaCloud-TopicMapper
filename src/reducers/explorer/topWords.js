import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_TOP_WORDS, SELECT_WORD, RESET_SELECTED_WORD, SET_QUERY_WORD_COUNT_SAMPLE_SIZE }
  from '../../actions/explorerActions';

const topWords = createIndexedAsyncReducer({
  initialState: ({
    selectedWord: null,
    sampleSize: 1000, // default to smaller, faster word clouds
  }),
  action: FETCH_QUERY_TOP_WORDS,
  [SET_QUERY_WORD_COUNT_SAMPLE_SIZE]: sampleSize => ({ sampleSize }),
  [SELECT_WORD]: payload => ({ selectedWord: payload }),
  [RESET_SELECTED_WORD]: () => ({ selectedWord: null }),
});
export default topWords;
