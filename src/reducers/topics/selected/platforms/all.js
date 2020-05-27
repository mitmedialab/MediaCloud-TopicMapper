import { FETCH_PLATFORMS_IN_TOPIC, RESET_PLATFORMS }
  from '../../../../actions/topicActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';
import { MEDIA_CLOUD_SOURCE } from '../../../../lib/platformTypes';

const all = createAsyncReducer({
  initialState: {
    results: [],
    initialized: false,
  },
  action: FETCH_PLATFORMS_IN_TOPIC,
  handleSuccess: payload => ({
    // add in a helpful flag to tell us which of these platforms are actually enabled
    results: payload.results.map(p => ({ ...p, isEnabled: (p.topic_seed_queries_id !== -1), channel: p.channel || [] })),
    initialized: payload.results.filter(p => p.topic_seed_queries_id !== -1 && p.source === MEDIA_CLOUD_SOURCE && p.query.indexOf('null') === -1).length > 0,
  }),

  [RESET_PLATFORMS]: () => ({ results: [] }),
});

export default all;
