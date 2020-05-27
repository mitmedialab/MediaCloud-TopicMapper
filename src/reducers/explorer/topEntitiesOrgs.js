import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_ENTITIES_ORGS, RESET_ENTITIES_ORGS } from '../../actions/explorerActions';
import { FETCH_INVALID } from '../../lib/fetchConstants';

const topEntitiesPeople = createIndexedAsyncReducer({
  action: FETCH_TOP_ENTITIES_ORGS,
  [RESET_ENTITIES_ORGS]: () => ({
    fetchStatus: FETCH_INVALID, fetchStatuses: {}, results: {},
  }),
});
export default topEntitiesPeople;
