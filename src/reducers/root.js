import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form';
import { combineReducers } from 'redux';
import { APP_TOOLS, APP_TOPIC_MAPPER, APP_SOURCE_MANAGER, APP_EXPLORER } from '../config';
import app from './app';
import user from './user';
import topics from './topics/topics';
import explorer from './explorer/explorer';
import sources from './sources/sources';
import system from './system/system';
import story from './story/story';
import platforms from './platforms/platforms';

const LIMIT_REDUCERS = true; // so we enforce that apps don't accidently use another apps reducer

function getRootReducer(appName) {
  let appReducers;
  if (LIMIT_REDUCERS) {
    // only load the reducer for the appropriate app
    switch (appName) {
      case APP_TOPIC_MAPPER:
        appReducers = { topics };
        break;
      case APP_SOURCE_MANAGER:
        appReducers = { sources };
        break;
      case APP_EXPLORER:
        appReducers = { explorer };
        break;
      case APP_TOOLS:
      default:
        appReducers = {};
        break;
    }
  } else {
    appReducers = { topics, sources, explorer };
  }

  const defaultReducers = {
    app,
    user,
    system,
    form,
    routing,
    story,
    platforms,
  };

  let reducers = { ...appReducers };
  reducers = Object.assign(reducers, defaultReducers);

  const rootReducer = combineReducers(reducers);

  return rootReducer;
}

export default getRootReducer;
