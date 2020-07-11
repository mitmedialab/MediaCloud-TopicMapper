import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_ENTITIES_ORGS } from '../../actions/explorerActions';

const topEntitiesPeople = createIndexedAsyncReducer({
  action: FETCH_TOP_ENTITIES_ORGS,
});
export default topEntitiesPeople;
