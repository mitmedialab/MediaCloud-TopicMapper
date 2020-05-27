import { FETCH_TOPIC_SEARCH_RESULTS } from '../../actions/topicActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { addUsefulDetailsToTopicsList } from './personalList';

const search = createAsyncReducer({
  initialState: {
    topics: [],
  },
  action: FETCH_TOPIC_SEARCH_RESULTS,
  handleSuccess: payload => ({
    ...payload,
    topics: addUsefulDetailsToTopicsList(payload.topics),
  }),
});

export default search;
