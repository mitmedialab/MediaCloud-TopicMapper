import { FETCH_SOURCES_BY_IDS } from '../../../../actions/sourceActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';

const sourceSearch = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_SOURCES_BY_IDS,
  handleSuccess: payload => ({
    // add name and id so we can display it in an NoSsr
    list: payload.results.map(m => ({ ...m, id: m.media_id, type: 'mediaSource' })),
  }),
});

export default sourceSearch;
