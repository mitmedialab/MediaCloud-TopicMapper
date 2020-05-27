import { combineReducers } from 'redux';
import retweetCoverage from './retweetCoverage';
import retweetStoryCounts from './retweetStoryCounts';
import topCountriesCoverage from './topCountriesCoverage';
import topCountriesStoryCounts from './topCountriesStoryCounts';
import nytThemeCoverage from './nytThemeCoverage';
import nytThemeStoryCounts from './nytThemeStoryCounts';
import mediaTypeCoverage from './mediaTypeCoverage';
import mediaTypeStoryCounts from './mediaTypeStoryCounts';
import workflow from './workflow';
import mediaTypes from './mediaTypes';

const createFocusReducer = combineReducers({
  retweetCoverage,
  retweetStoryCounts,
  topCountriesCoverage,
  topCountriesStoryCounts,
  nytThemeCoverage,
  nytThemeStoryCounts,
  mediaTypeCoverage,
  mediaTypeStoryCounts,
  workflow,
  mediaTypes,
});

export default createFocusReducer;
