import { SELECT_METADATA_QUERY_ARGS } from '../../../../actions/systemActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';

const publicationState = createAsyncReducer({
  initialState: {
    tags: [],
    label: null,
  },
  action: SELECT_METADATA_QUERY_ARGS,
});

export default publicationState;
