import { createReducer } from '../../../../lib/reduxHelpers';
import { RESET_TOPIC_ATTENTION_DRILL_DOWN, SET_TOPIC_ATTENTION_DRILL_DOWN } from '../../../../actions/topicActions';

const storiesPerDateRange = createReducer({
  initialState: {
    drillDownTimespan: null,
    selectedStartTimestamp: null,
    selectedStoryCount: null,
  },
  // save where the user clicked on the main attention chart
  [SET_TOPIC_ATTENTION_DRILL_DOWN]: (payload) => ({
    selectedStartTimestamp: payload.point0x,
    selectedStoryCount: payload.pointValue,
    drillDownTimespan: payload.selectedTimespan,
  }),
  // when clicked item changes we need to clear it all
  [RESET_TOPIC_ATTENTION_DRILL_DOWN]: () => ({
    selectedStartTimestamp: null,
    selectedStoryCount: null,
    drillDownTimespan: null,
  }),
});

export default storiesPerDateRange;
