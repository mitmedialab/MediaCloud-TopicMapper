import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_THEMES } from '../../actions/explorerActions';

const topThemes = createIndexedAsyncReducer({
  action: FETCH_TOP_THEMES,
});
export default topThemes;
