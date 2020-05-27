import { FETCH_FAVORITE_TOPICS_LIST, SET_TOPIC_FAVORITE } from '../../actions/topicActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { addUsefulDetailsToTopicsList, updateFavorite } from './personalList';

const favoriteList = createAsyncReducer({
  initialState: {
    topics: [],
    link_ids: {},
  },
  action: FETCH_FAVORITE_TOPICS_LIST,
  handleSuccess: payload => ({
    ...payload,
    topics: addUsefulDetailsToTopicsList(payload.topics),
  }),
  [SET_TOPIC_FAVORITE]: (payload, state) => ({
    topics: updateFavorite(payload.args[0], payload.args[1], state.topics),
  }),
});

export default favoriteList;
