import { combineReducers } from 'redux';
import { SELECT_COLLECTION } from '../../../../actions/sourceActions';
import collectionDetails from './collectionDetails';
import collectionSourceRepresentation from './collectionSourceRepresentation';
import collectionSimilar from './collectionSimilar';
import historicalSplitStoryCounts from './historicalSplitStoryCounts';
import collectionSourceList from './collectionSourceList';

const INITIAL_STATE = null;

function id(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SELECT_COLLECTION:
      return action.payload ? parseInt(action.payload, 10) : null;
    default:
      return state;
  }
}

const selected = combineReducers({
  id,
  collectionDetails,
  collectionSourceRepresentation,
  collectionSimilar,
  collectionSourceList,
  historicalSplitStoryCounts,
});

export default selected;
