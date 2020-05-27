import { combineReducers } from 'redux';
import workflow from './workflow';

const createFocusReducer = combineReducers({
  workflow,
});

export default createFocusReducer;
