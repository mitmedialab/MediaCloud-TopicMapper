import { FETCH_MEDIAPICKER_COLLECTION_SEARCH, MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, RESET_MEDIAPICKER_COLLECTION_SEARCH } from '../../../actions/systemActions';
import { createAsyncReducer, concatPrevAndNext } from '../../../lib/reduxHelpers';
import { MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING } from '../../../lib/mediaUtil';

const initialState = {
  args: { type: MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING, mediaKeyword: null },
  list: [],
  linkId: { next: 0 },
};

const collectionSearch = createAsyncReducer({
  initialState,
  action: FETCH_MEDIAPICKER_COLLECTION_SEARCH,
  handleSuccess: (payload, state, meta) => ({
    args: { ...meta.args[0], selected: false }, // for adding/removing from selected list
    list: concatPrevAndNext(payload.list, state.list, 'collection'),
    linkId: { next: payload.link_id },
  }),
  [MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST]: (payload, state) => ({
    list: state.list.map((c) => {
      if (c.id === payload.selectedMedia.id) {
        return ({
          ...c,
          name: payload.selectedMedia.label,
          selected: payload.setSelected,
        });
      }
      return c;
    }),
  }),
  [RESET_MEDIAPICKER_COLLECTION_SEARCH]: () => ({ args: { type: MEDIAPICKER_SOURCES_COLLECTIONS_QUERY_SETTING, mediaKeyword: null }, list: [], linkId: { next: 0 } }),
});

export default collectionSearch;
