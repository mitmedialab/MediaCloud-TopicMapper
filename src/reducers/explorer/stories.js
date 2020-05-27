import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_SAMPLE_STORIES, RESET_SAMPLE_STORIES } from '../../actions/explorerActions';
import { FETCH_INVALID } from '../../lib/fetchConstants';

const stories = createIndexedAsyncReducer({
  initialState: {
    selectedStory: {},
  },
  action: FETCH_QUERY_SAMPLE_STORIES,
  [RESET_SAMPLE_STORIES]: () => ({
    fetchStatus: FETCH_INVALID, fetchStatuses: {}, results: {},
  }),
});

export default stories;
