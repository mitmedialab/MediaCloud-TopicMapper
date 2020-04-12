import { combineReducers } from 'redux';
import topStories from './topStories';
import topMedia from './topMedia';
import topWords from './topWords';
import splitStoryCount from './splitStoryCount';
import storyTotals from './storyTotals';
import geocodedStoryTotals from './geocodedStoryTotals';
import englishStoryTotals from './englishStoryTotals';
import undateableStoryTotals from './undateableStoryTotals';
import themedStoryTotals from './themedStoryTotals';
import topEntitiesPeople from './topEntitiesPeople';
import topEntitiesOrgs from './topEntitiesOrgs';
import mapFiles from './mapFiles';
import word2vec from './word2vec';
import word2vecTimespans from './word2vecTimespans';
import attentionDrillDownStories from './attentionDrillDownStories';

const summaryReducer = combineReducers({
  topStories,
  topMedia,
  topWords,
  splitStoryCount,
  storyTotals,
  geocodedStoryTotals,
  englishStoryTotals,
  undateableStoryTotals,
  themedStoryTotals,
  topEntitiesPeople,
  topEntitiesOrgs,
  mapFiles,
  word2vec,
  word2vecTimespans,
  attentionDrillDownStories,
});

export default summaryReducer;
