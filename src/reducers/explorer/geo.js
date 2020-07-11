import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_GEO } from '../../actions/explorerActions';

const geo = createIndexedAsyncReducer({
  action: FETCH_QUERY_GEO,
});

export default geo;
