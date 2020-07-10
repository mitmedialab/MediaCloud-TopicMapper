import { FETCH_MEDIAPICKER_SOURCE_SEARCH, MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, RESET_MEDIAPICKER_SOURCE_SEARCH } from '../../../actions/systemActions';
import { createAsyncReducer, concatPrevAndNext } from '../../../lib/reduxHelpers';
import { MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING } from '../../../lib/mediaUtil';

const sourceQueryResults = createAsyncReducer({
  initialState: {
    args: { type: MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING, mediaKeyword: null },
    list: [],
    linkId: { next: 0 },
  },
  action: FETCH_MEDIAPICKER_SOURCE_SEARCH,
  handleSuccess: (payload, state, meta) => ({
    args: { ...meta.args[0], selected: false },
    list: concatPrevAndNext(payload.list, state.list, 'source'),
    linkId: { next: payload.link_id },
  }),
  [MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST]: (payload, state) => ({
    list: state.list.map((c) => {
      if (c.id === payload.selectedMedia.id) {
        return ({
          ...c,
          selected: payload.setSelected,
        });
      }
      return c;
    }),
  }),
  [RESET_MEDIAPICKER_SOURCE_SEARCH]: () => ({ args: { type: MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING, mediaKeyword: null }, list: [], linkId: { next: 0 } }),
});

export default sourceQueryResults;
