import { combineReducers } from 'redux';
import entities from './entities';
import nytThemes from './nytThemes';
import info from './info';
import words from './words';
import reddit from './reddit';
import images from './images';

const rootReducer = combineReducers({
  reddit,
  entities,
  nytThemes,
  info,
  words,
  images,
});

export default rootReducer;
