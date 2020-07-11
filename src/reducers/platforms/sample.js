import { FETCH_PLATFORM_SAMPLE } from '../../actions/platformActions';
import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';

const sample = createIndexedAsyncReducer({
  initialState: {
    list: [],
    supported: true,
  },
  action: FETCH_PLATFORM_SAMPLE,
  handleSuccess: payload => ({
    total: payload.length,
    ...payload,
  }),
});

export default sample;
