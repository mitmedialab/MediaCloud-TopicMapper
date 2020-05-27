import { combineReducers } from 'redux';
import personalList from './personalList';
import favoriteList from './favoriteList';
import adminList from './adminList';
import selected from './selected/selected';
import search from './search';
import modify from './modify/modify';

const rootReducer = combineReducers({
  selected,
  favoriteList,
  personalList,
  adminList,
  search,
  modify,
});

export default rootReducer;
