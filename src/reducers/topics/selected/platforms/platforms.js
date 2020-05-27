import { combineReducers } from 'redux';
import all from './all';
import create from './create/create';
import selected from './selected';

const platforms = combineReducers({
  all,
  create,
  selected,
});

export default platforms;
