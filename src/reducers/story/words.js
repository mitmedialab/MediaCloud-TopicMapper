import { FETCH_STORY_WORDS } from '../../actions/storyActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const words = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_STORY_WORDS,
  handleSuccess: payload => ({
    list: payload,
  }),
});

export default words;
