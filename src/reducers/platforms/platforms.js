import { combineReducers } from 'redux';
import countOverTime from './countOverTime';
import count from './count';
import sample from './sample';
import words from './words';

const modifyPlatformReducer = combineReducers({
  count,
  countOverTime,
  words,
  sample,
});

export default modifyPlatformReducer;
