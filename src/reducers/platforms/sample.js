import { FETCH_PLATFORM_SAMPLE } from '../../actions/platformActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const sample = createAsyncReducer({
  initialState: {
    list: [],
    links_ids: {},
    supported: true,
  },
  action: FETCH_PLATFORM_SAMPLE,
  handleSuccess: payload => ({
    total: payload.length,
    ...payload,
  }),
});

export default sample;
