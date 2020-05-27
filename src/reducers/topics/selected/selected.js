import { combineReducers } from 'redux';
import { SELECT_TOPIC, SET_TOPIC_NEEDS_NEW_SNAPSHOT, TOGGLE_FILTER_CONTROLS } from '../../../actions/topicActions';
import snapshots from './snapshots';
import timespans from './timespans';
import summary from './summary/summary';
import filters from './filters';
import info from './info';
import mediaSource from './mediaSource/mediaSource';
import story from './story/story';
import focalSets from './focalSets/focalSets';
import permissions from './permissions';
import attention from './attention';
import word from './word/word';
import snapshotStoryCounts from './snapshotStoryCounts';
import platforms from './platforms/platforms';
import provider from './provider';
import { parseId } from '../../../lib/numberUtil';

function id(state = null, action) {
  switch (action.type) {
    case SELECT_TOPIC:
      if (action.payload) {
        if (action.payload !== state) {
          // only update the topic id if it has changed
          return parseId(action.payload);
        }
        return state;
      }
      return null;
    default:
      return state;
  }
}

function needsNewSnapshot(state = false, action) {
  switch (action.type) {
    case SET_TOPIC_NEEDS_NEW_SNAPSHOT:
      return action.payload;
    default:
      return state;
  }
}

function filtersVisible(state = false, action) {
  switch (action.type) {
    case TOGGLE_FILTER_CONTROLS:
      return !state;
    default:
      return state;
  }
}

const selected = combineReducers({
  id,
  filtersVisible, // do this here, instead of in filters, so that a visible state change doesn't change filters and thus trigger tons of re-renders
  needsNewSnapshot,
  info,
  summary,
  snapshots,
  timespans,
  filters,
  provider,
  mediaSource,
  story,
  focalSets,
  permissions,
  attention,
  word,
  snapshotStoryCounts,
  platforms,
});

const rootReducer = (state, action) => {
  let modifiedState = state;
  if ((action.type === SELECT_TOPIC) && (state.id !== parseId(action.payload))) {
    // when the switch topics re-initialize the whole state tree, to make sure
    // we don't get any weird artifacts from the previuos topic
    // @see: http://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
    modifiedState = undefined;
  }
  return selected(modifiedState, action);
};

export default rootReducer;
