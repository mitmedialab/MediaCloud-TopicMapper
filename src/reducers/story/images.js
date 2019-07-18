import { FETCH_STORY_IMAGES } from '../../actions/storyActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';

const images = createAsyncReducer({
  initialState: {
    images: { all: [], top: null },
  },
  action: FETCH_STORY_IMAGES,
});

export default images;
