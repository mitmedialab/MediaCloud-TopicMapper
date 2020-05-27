import { FETCH_PLATFORM_COUNT } from '../../actions/platformActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const counts = createAsyncReducer({
  initialState: {
    count: null,
    supported: true,
  },
  action: FETCH_PLATFORM_COUNT,
});

export default counts;
