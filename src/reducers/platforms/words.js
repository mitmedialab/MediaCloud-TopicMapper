import { FETCH_PLATFORM_WORDS } from '../../actions/platformActions';
import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';

const words = createIndexedAsyncReducer({
  initialState: {
    list: [], // the thing you queried for
    totals: [], // options topic/focus-level totals to compare to
    supported: true,
  },
  action: FETCH_PLATFORM_WORDS,
  handleSuccess: payload => ({
    total: payload.results.length,
    list: payload.results,
    supported: payload.supported,
  }),
});

export default words;
