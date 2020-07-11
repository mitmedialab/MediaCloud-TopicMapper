import { FETCH_PLATFORM_TAGS } from '../../actions/platformActions';
import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';

const tags = createIndexedAsyncReducer({
  initialState: {
    list: [], // the thing you queried for
    supported: true,
  },
  action: FETCH_PLATFORM_TAGS,
});

export default tags;
