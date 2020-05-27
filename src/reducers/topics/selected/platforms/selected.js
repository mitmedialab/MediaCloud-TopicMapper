import { SELECT_PLATFORM } from '../../../../actions/topicActions';

const INITIAL_STATE = { topic_seed_queries_id: -1, currentPlatformType: '', channel: [] };

function selected(state = INITIAL_STATE, action) {
  let updatedState = null;
  switch (action.type) {
    case SELECT_PLATFORM:
      updatedState = state ? { ...state } : undefined; // could be null;
      if (updatedState == null) {
        return { ...action.payload };
      }
      updatedState = action.payload.promise ? { ...state, ...action.payload.promise } : updatedState;
      return updatedState;
    default:
      return state;
  }
}

export default selected;
