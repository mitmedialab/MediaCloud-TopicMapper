import { createAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_TOP_WORDS_COMPARISON, SELECT_COMPARATIVE_WORD_FIELD } from '../../actions/explorerActions';
// import { cleanDateCounts } from '../../lib/dateUtil';
// import * as fetchConstants from '../../lib/fetchConstants';
const LEFT = 0;

const topWordsComparison = createAsyncReducer({
  initialState: ({
    left: null, // ui component selection
    right: null,
  }),
  action: FETCH_QUERY_TOP_WORDS_COMPARISON,
  handleSuccess: payload => ({
    // result of left and right queries
    results: payload.list,
  }),
  [SELECT_COMPARATIVE_WORD_FIELD]: (payload) => {
    // store query selection
    let value = payload.query;
    if (payload.query && payload.query.length) {
      value = payload.query[payload.target];
    }
    if (payload.target === LEFT) return { left: value };
    return { right: value };
  },
});
export default topWordsComparison;
