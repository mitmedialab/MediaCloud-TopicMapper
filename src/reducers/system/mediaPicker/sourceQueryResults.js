import { FETCH_MEDIAPICKER_SOURCE_SEARCH, MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, RESET_MEDIAPICKER_SOURCE_SEARCH } from '../../../actions/systemActions';
import { createAsyncReducer, concatPrevAndNext } from '../../../lib/reduxHelpers';

const sourceQueryResults = createAsyncReducer({
  initialState: {
    args: { type: 1, mediaKeyword: null },
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
  [RESET_MEDIAPICKER_SOURCE_SEARCH]: () => ({ args: { type: 1, mediaKeyword: null }, list: [], linkId: { next: 0 } }),
});

export default sourceQueryResults;
