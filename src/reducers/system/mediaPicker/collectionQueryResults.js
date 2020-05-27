import { FETCH_MEDIAPICKER_COLLECTION_SEARCH, MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, RESET_MEDIAPICKER_COLLECTION_SEARCH } from '../../../actions/systemActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';

const initialState = {
  args: { type: 0, mediaKeyword: null },
  list: [],
  linkId: 0,
};

const collectionSearch = createAsyncReducer({
  initialState,
  action: FETCH_MEDIAPICKER_COLLECTION_SEARCH,
  handleSuccess: (payload, state, meta) => ({
    args: { ...meta.args[0], selected: false }, // for adding/removing from selected list
    list: payload.list.map(c => ({
      ...c,
      name: `${c.label || c.tag}`,
      id: c.tags_id,
      type: 'collection',
      selected: false,
    })),
    linkId: payload.link_id,
  }),
  [RESET_MEDIAPICKER_COLLECTION_SEARCH]: () => initialState,
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
});

export default collectionSearch;
