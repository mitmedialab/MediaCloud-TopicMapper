import { createAsyncReducer } from '../../../../lib/reduxHelpers';
import { FETCH_TOPIC_TOP_STORIES_ON_DATES, RESET_TOPIC_ATTENTION_DRILL_DOWN } from '../../../../actions/topicActions';

const storiesPerDateRange = createAsyncReducer({
  initialState: { stories: [] },
  action: FETCH_TOPIC_TOP_STORIES_ON_DATES,
  [RESET_TOPIC_ATTENTION_DRILL_DOWN]: () => {},
});

export default storiesPerDateRange;
