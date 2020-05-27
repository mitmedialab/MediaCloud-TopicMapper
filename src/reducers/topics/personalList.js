import { FETCH_PERSONAL_TOPIC_LIST, SET_TOPIC_FAVORITE } from '../../actions/topicActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { addUsefulDetailsToTopic } from './selected/info';

export const addUsefulDetailsToTopicsList = topics => topics.map(t => addUsefulDetailsToTopic(t));

/**
 * When the user favorites a topic make sure to update the list indiating that it is marked as a favorite.
 * @param topicId the topic the user marked or unmarked as a favorite
 * @param isFav boolean indicating if favorited or unfavorited
 * @param topicList the list of user-accessible topics
 * @return a new list of topics, updated for the one that was favorited or unfavorited
 */
export const updateFavorite = (topicId, isFav, topicList) => {
  // make sure to return a copy, so redux norms aren't violated
  const matching = [...topicList].find(t => t.topics_id === topicId);
  if (matching) {
    matching.isFavorite = isFav;
  }
  return topicList;
};

/**
 * the list of topics a user can access.
 */
const personalList = createAsyncReducer({
  initialState: {
    topics: [],
    link_ids: {},
  },
  action: FETCH_PERSONAL_TOPIC_LIST,
  handleSuccess: payload => ({
    ...payload,
    topics: addUsefulDetailsToTopicsList(payload.topics),
  }),
  [SET_TOPIC_FAVORITE]: (payload, state) => ({
    topics: updateFavorite(payload.args[0], payload.args[1], state.topics),
  }),
});

export default personalList;
