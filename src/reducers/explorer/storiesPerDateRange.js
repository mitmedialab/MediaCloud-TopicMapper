import { createAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_PER_DATE_SAMPLE_STORIES, RESET_QUERY_PER_DATE_SAMPLE_STORIES } from '../../actions/explorerActions';

const storiesPerDateRange = createAsyncReducer({
  action: FETCH_QUERY_PER_DATE_SAMPLE_STORIES,
  [RESET_QUERY_PER_DATE_SAMPLE_STORIES]: () => {},
});

export default storiesPerDateRange;
