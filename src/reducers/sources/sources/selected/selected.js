import { combineReducers } from 'redux';
import { SELECT_SOURCE } from '../../../../actions/sourceActions';
import sourceDetails from './sourceDetails';
import feed from './feed/feed';
import stats from './stats';

const INITIAL_STATE = null;

function id(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SELECT_SOURCE:
      return action.payload ? parseInt(action.payload, 10) : null;
    default:
      return state;
  }
}

const selected = combineReducers({
  id,
  sourceDetails,
  feed,
  stats,
});

export default selected;
