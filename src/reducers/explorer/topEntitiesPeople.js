import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_TOP_ENTITIES_PEOPLE } from '../../actions/explorerActions';

const topEntitiesPeople = createIndexedAsyncReducer({
  action: FETCH_TOP_ENTITIES_PEOPLE,
});
export default topEntitiesPeople;
