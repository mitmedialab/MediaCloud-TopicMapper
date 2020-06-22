import { combineReducers } from 'redux';
import selectMediaQuery from './selectMediaQuery';
import collectionQueryResults from './collectionQueryResults';
import sourceQueryResults from './sourceQueryResults';
import featured from './featured';
import selectMedia from './selectMedia';
import favoritedCollections from './favoritedCollections';
import favoritedSources from './favoritedSources';
import metadataSelections from './metadataSelections/metadata';

/* all reducers here have to add in a selected = true/false handling */
const media = combineReducers({
  selectMediaQuery,
  collectionQueryResults,
  sourceQueryResults,
  featured,
  selectMedia,
  favoritedCollections,
  favoritedSources,
  metadataSelections,
});

export default media;
