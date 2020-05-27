import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_THEMES, RESET_THEMES } from '../../actions/explorerActions';
import { FETCH_INVALID } from '../../lib/fetchConstants';

const topThemes = createIndexedAsyncReducer({
  action: FETCH_TOP_THEMES,
  [RESET_THEMES]: () => ({
    fetchStatus: FETCH_INVALID, fetchStatuses: {}, results: {}, coverage_percentage: 0,
  }),
});
export default topThemes;
