import { combineReducers } from 'redux';
import all from './all';
import create from './create/create';
import preview from './preview/preview';

const platforms = combineReducers({
  all,
  create,
  preview,
});

export default platforms;