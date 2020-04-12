import { FETCH_CREATE_FOCUS_SEARCH_STORIES } from '../../../../../actions/topicActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStories = createAsyncReducer({
  initialState: {
    stories: [],
    links_ids: {},
  },
  action: FETCH_CREATE_FOCUS_SEARCH_STORIES,
});

export default matchingStories;
