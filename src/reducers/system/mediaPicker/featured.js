import { FETCH_FEATURED_COLLECTIONS_FOR_QUERY, MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, RESET_MEDIAPICKER_FEATURED_COLLECTION_SEARCH } from '../../../actions/systemActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';

const featured = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_FEATURED_COLLECTIONS_FOR_QUERY,
  handleSuccess: (payload, state, meta) => ({
    args: { ...meta.args[0], selected: false }, // for adding/removing from selected list
    list: payload.list.map(c => ({
      ...c,
      name: `${c.label || c.tag}`,
      id: c.tags_id,
      type: 'collection',
      selected: false, // for adding/removing from selected list
    })),
  }),
  [RESET_MEDIAPICKER_FEATURED_COLLECTION_SEARCH]: () => ({ list: [] }),
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
export default featured;
