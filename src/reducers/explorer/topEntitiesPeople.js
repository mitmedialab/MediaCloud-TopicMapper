import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_ENTITIES_PEOPLE, RESET_ENTITIES_PEOPLE } from '../../actions/explorerActions';
import { FETCH_INVALID } from '../../lib/fetchConstants';

const topEntitiesPeople = createIndexedAsyncReducer({
  action: FETCH_TOP_ENTITIES_PEOPLE,
  [RESET_ENTITIES_PEOPLE]: () => ({
    fetchStatus: FETCH_INVALID, fetchStatuses: {}, results: {},
  }),
});
export default topEntitiesPeople;
