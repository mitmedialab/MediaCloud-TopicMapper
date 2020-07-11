import { FETCH_PLATFORM_COUNT } from '../../actions/platformActions';
import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';

const counts = createIndexedAsyncReducer({
  initialState: {
    count: null,
    supported: true,
  },
  action: FETCH_PLATFORM_COUNT,
});

export default counts;
