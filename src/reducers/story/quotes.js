import { FETCH_STORY_QUOTES } from '../../actions/storyActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const quotes = createAsyncReducer({
  initialState: {
    all: [],
  },
  action: FETCH_STORY_QUOTES,
});

export default quotes;
