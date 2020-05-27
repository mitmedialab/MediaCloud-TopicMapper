import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_GEO, RESET_GEO } from '../../actions/explorerActions';
import { FETCH_INVALID } from '../../lib/fetchConstants';

const geo = createIndexedAsyncReducer({
  action: FETCH_QUERY_GEO,
  [RESET_GEO]: () => ({
    fetchStatus: FETCH_INVALID, fetchStatuses: {}, results: {},
  }),
});

export default geo;
