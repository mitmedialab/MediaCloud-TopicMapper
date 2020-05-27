import { combineReducers } from 'redux';
import selected from './selected';
import queries from './queries/queriesHandler';
import lastSearchTime from './lastSearchTime';
import storySplitCount from './storySplitCount';
import topWordsComparison from './topWordsComparison';
import topEntitiesPeople from './topEntitiesPeople';
import topEntitiesOrgs from './topEntitiesOrgs';
import topWords from './topWords';
import stories from './stories';
import geo from './geo';
import savedSearches from './savedSearches';
import storiesPerDateRange from './storiesPerDateRange';
import topWordsPerDateRange from './topWordsPerDateRange';
import sampleSentencesByWord from './sampleSentencesByWord';
import topThemes from './topThemes';

const rootReducer = combineReducers({
  selected,
  queries,
  lastSearchTime,
  storySplitCount,
  topWords,
  topWordsComparison,
  stories,
  geo,
  topEntitiesPeople,
  topEntitiesOrgs,
  topThemes,
  savedSearches,
  storiesPerDateRange,
  topWordsPerDateRange,
  sampleSentencesByWord,
});

export default rootReducer;
