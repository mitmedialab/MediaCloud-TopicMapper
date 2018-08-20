import { FETCH_SOURCES_BY_IDS, RESET_SOURCES_BY_IDS } from '../../../../actions/sourceActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';
import * as fetchConstants from '../../../../lib/fetchConstants';

const sourceSearch = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_SOURCES_BY_IDS,
  handleSuccess: payload => ({
    // add name and id so we can display it in an NoSsr
    list: payload.results.map(m => ({ ...m, id: m.media_id, type: 'mediaSource' })),
  }),
  [RESET_SOURCES_BY_IDS]: () => ({
    fetchStatus: fetchConstants.FETCH_SUCCEEDED,
    list: [],
  }),
});

export default sourceSearch;
