import { combineReducers } from 'redux';
import info from './info';
import sampleSentences from './sampleSentences';
import similarWords from './similarWords';

const wordReducer = combineReducers({
  info,
  sampleSentences,
  similarWords,
});

export default wordReducer;
