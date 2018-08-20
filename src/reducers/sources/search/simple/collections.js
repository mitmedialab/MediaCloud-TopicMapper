import { FETCH_COLLECTION_SEARCH, RESET_COLLECTION_SEARCH } from '../../../../actions/sourceActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';

const collectionSearch = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_COLLECTION_SEARCH,
  handleSuccess: payload => ({
    // add name and id so we can display it in an NoSsr
    list: payload.list.map(c => ({
      ...c,
      name: `${c.tag_set_label}: ${c.label || c.tag}`,
      id: c.tags_id,
      type: 'collection',
    })),
  }),
  [RESET_COLLECTION_SEARCH]: () => ({ list: [] }),
});

export default collectionSearch;
