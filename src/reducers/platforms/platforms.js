import { combineReducers } from 'redux';
import countOverTime from './countOverTime';
import count from './count';
import sample from './sample';
import words from './words';
import tags from './tags';

const modifyPlatformReducer = combineReducers({
  count,
  countOverTime,
  words,
  sample,
  tags,
});

export default modifyPlatformReducer;
