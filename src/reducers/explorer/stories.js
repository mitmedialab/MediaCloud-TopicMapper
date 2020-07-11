import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_SAMPLE_STORIES } from '../../actions/explorerActions';

const stories = createIndexedAsyncReducer({
  initialState: {
    selectedStory: {},
  },
  action: FETCH_QUERY_SAMPLE_STORIES,
});

export default stories;
