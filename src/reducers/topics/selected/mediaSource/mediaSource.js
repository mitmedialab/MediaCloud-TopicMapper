import { combineReducers } from 'redux';
import info from './info';

const mediaSourceReducer = combineReducers({
  info,
});

export default mediaSourceReducer;
