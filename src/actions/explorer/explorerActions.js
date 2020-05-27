import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/explorer';

export const SET_QUERY_WORD_COUNT_SAMPLE_SIZE = 'SET_QUERY_WORD_COUNT_SAMPLE_SIZE';
export const setQueryWordCountSampleSize = createAction(SET_QUERY_WORD_COUNT_SAMPLE_SIZE, sampleSize => sampleSize);


export const UPDATE_TIMESTAMP_FOR_QUERIES = 'UPDATE_TIMESTAMP_FOR_QUERIES';
export const updateTimestampForQueries = createAction(UPDATE_TIMESTAMP_FOR_QUERIES, queries => queries);

export const FETCH_WORD_SAMPLE_SENTENCES = 'FETCH_WORD_SAMPLE_SENTENCES';
export const fetchWordSampleSentences = createAsyncAction(FETCH_WORD_SAMPLE_SENTENCES, api.fetchWordSampleSentences);

export const RESET_WORD_SAMPLE_SENTENCES = 'RESET_WORD_SAMPLE_SENTENCES';
export const resetWordSampleSentences = createAction(RESET_WORD_SAMPLE_SENTENCES);


export const SAVE_PARSED_QUERIES = 'SAVE_PARSED_QUERIES';
export const saveParsedQueries = createAction(SAVE_PARSED_QUERIES, searchParams => searchParams);


export const FETCH_SAVED_SEARCHES = 'FETCH_SAVED_SEARCHES';
export const fetchSavedSearches = createAsyncAction(FETCH_SAVED_SEARCHES, api.fetchSavedSearches);

export const SELECT_QUERY = 'SELECT_QUERY';
export const selectQuery = createAction(SELECT_QUERY, query => query);

export const ADD_CUSTOM_QUERY = 'ADD_CUSTOM_QUERY';
export const addCustomQuery = createAction(ADD_CUSTOM_QUERY, query => query);

export const UPDATE_QUERY = 'UPDATE_QUERY';
export const updateQuery = createAction(UPDATE_QUERY, query => query);

export const UPDATE_QUERY_COLLECTION_LOOKUP_INFO = 'UPDATE_QUERY_COLLECTION_LOOKUP_INFO';
export const updateQueryCollectionLookupInfo = createAction(UPDATE_QUERY_COLLECTION_LOOKUP_INFO, query => query);

export const UPDATE_QUERY_SOURCE_LOOKUP_INFO = 'UPDATE_QUERY_SOURCE_LOOKUP_INFO';
export const updateQuerySourceLookupInfo = createAction(UPDATE_QUERY_SOURCE_LOOKUP_INFO, query => query);

export const UPDATE_QUERY_SEARCH_LOOKUP_INFO = 'UPDATE_QUERY_SEARCH_LOOKUP_INFO';
export const updateQuerySearchLookupInfo = createAction(UPDATE_QUERY_SEARCH_LOOKUP_INFO, query => query);


export const FETCH_TOP_ENTITIES_PEOPLE = 'FETCH_TOP_ENTITIES_PEOPLE';
export const FETCH_TOP_ENTITIES_ORGS = 'FETCH_TOP_ENTITIES_ORGS';
export const RESET_ENTITIES_PEOPLE = 'RESET_ENTITIES_PEOPLE';
export const RESET_ENTITIES_ORGS = 'RESET_ENTITIES_ORGS';

// pass in id, filters or q  - used by topics and explorer...
export const fetchTopEntitiesPeople = createAsyncAction(FETCH_TOP_ENTITIES_PEOPLE, api.fetchQueryTopEntitiesPeople, params => params);
export const fetchDemoTopEntitiesPeople = createAsyncAction(FETCH_TOP_ENTITIES_PEOPLE, api.fetchDemoQueryTopEntitiesPeople, params => params);

// pass in id, filters or q
export const fetchTopEntitiesOrgs = createAsyncAction(FETCH_TOP_ENTITIES_ORGS, api.fetchQueryTopEntitiesOrgs, params => params);
export const fetchDemoTopEntitiesOrgs = createAsyncAction(FETCH_TOP_ENTITIES_ORGS, api.fetchDemoQueryTopEntitiesOrgs, params => params);

export const resetEntitiesPeople = createAction(RESET_ENTITIES_PEOPLE);
export const resetEntitiesOrgs = createAction(RESET_ENTITIES_ORGS);

export const FETCH_QUERY_SPLIT_STORY_COUNT = 'FETCH_QUERY_SPLIT_STORY_COUNT';
export const fetchQuerySplitStoryCount = createAsyncAction(FETCH_QUERY_SPLIT_STORY_COUNT, api.fetchQuerySplitStoryCount, params => params);
export const fetchDemoQuerySplitStoryCount = createAsyncAction(FETCH_QUERY_SPLIT_STORY_COUNT, api.fetchDemoQuerySplitStoryCount, params => params);

export const FETCH_QUERY_SAMPLE_STORIES = 'FETCH_QUERY_SAMPLE_STORIES';
export const fetchQuerySampleStories = createAsyncAction(FETCH_QUERY_SAMPLE_STORIES, api.fetchQuerySampleStories, params => params);
export const fetchDemoQuerySampleStories = createAsyncAction(FETCH_QUERY_SAMPLE_STORIES, api.fetchDemoQuerySampleStories, params => params);

export const FETCH_QUERY_PER_DATE_SAMPLE_STORIES = 'FETCH_QUERY_PER_DATE_SAMPLE_STORIES';
export const fetchQueryPerDateSampleStories = createAsyncAction(FETCH_QUERY_PER_DATE_SAMPLE_STORIES, api.fetchQueryPerDateSampleStories, params => params);
export const fetchDemoQueryPerDateSampleStories = createAsyncAction(FETCH_QUERY_PER_DATE_SAMPLE_STORIES, api.fetchDemoQueryPerDateSampleStories, params => params);


export const FETCH_QUERY_TOP_WORDS = 'FETCH_QUERY_TOP_WORDS';
export const fetchQueryTopWords = createAsyncAction(FETCH_QUERY_TOP_WORDS, api.fetchQueryTopWords, params => params);
export const fetchDemoQueryTopWords = createAsyncAction(FETCH_QUERY_TOP_WORDS, api.fetchDemoQueryTopWords, params => params);

export const SELECT_WORD = 'SELECT_WORD';
export const selectWord = createAction(SELECT_WORD, word => word);

export const RESET_SELECTED_WORD = 'RESET_SELECTED_WORD';
export const resetSelectedWord = createAction(RESET_SELECTED_WORD);

export const FETCH_QUERY_PER_DATE_TOP_WORDS = 'FETCH_QUERY_PER_DATE_TOP_WORDS';
export const fetchQueryPerDateTopWords = createAsyncAction(FETCH_QUERY_PER_DATE_TOP_WORDS, api.fetchQueryPerDateTopWords, params => params);
export const fetchDemoQueryPerDateTopWords = createAsyncAction(FETCH_QUERY_PER_DATE_TOP_WORDS, api.fetchQueryPerDateTopWords, params => params);

export const RESET_QUERY_PER_DATE_SAMPLE_STORIES = 'RESET_QUERY_PER_DATE_SAMPLE_STORIES';
export const resetQueriesPerDateSampleStories = createAction(RESET_QUERY_PER_DATE_SAMPLE_STORIES);

export const RESET_QUERY_PER_DATE_TOP_WORDS = 'RESET_QUERY_PER_DATE_TOP_WORDS';
export const resetQueriesPerDateTopWords = createAction(RESET_QUERY_PER_DATE_TOP_WORDS);

export const FETCH_QUERY_TOP_WORDS_COMPARISON = 'FETCH_QUERY_TOP_WORDS_COMPARISON';
export const fetchQueryTopWordsComparison = createAsyncAction(FETCH_QUERY_TOP_WORDS_COMPARISON, api.fetchQueryTopWordsComparison, params => params);
export const fetchDemoQueryTopWordsComparison = createAsyncAction(FETCH_QUERY_TOP_WORDS_COMPARISON, api.fetchDemoQueryTopWordsComparison, params => params);

export const SELECT_COMPARATIVE_WORD_FIELD = 'SELECT_COMPARATIVE_WORD_FIELD';
export const selectComparativeWordField = createAction(SELECT_COMPARATIVE_WORD_FIELD, params => params);


export const FETCH_QUERY_GEO = 'FETCH_QUERY_GEO';
export const fetchQueryGeo = createAsyncAction(FETCH_QUERY_GEO, api.fetchQueryGeo, params => params);
export const fetchDemoQueryGeo = createAsyncAction(FETCH_QUERY_GEO, api.fetchDemoQueryGeo, params => params);

export const FETCH_QUERY_SOURCES = 'FETCH_QUERY_SOURCES';
export const fetchQuerySourcesByIds = createAsyncAction(FETCH_QUERY_SOURCES, api.fetchQuerySourcesByIds, props => props);
export const demoQuerySourcesByIds = createAsyncAction(FETCH_QUERY_SOURCES, api.demoQuerySourcesByIds, props => props);

export const FETCH_QUERY_COLLECTIONS = 'FETCH_QUERY_COLLECTIONS';
export const fetchQueryCollectionsByIds = createAsyncAction(FETCH_QUERY_COLLECTIONS, api.fetchQueryCollectionsByIds, props => props);
export const demoQueryCollectionsByIds = createAsyncAction(FETCH_QUERY_COLLECTIONS, api.demoQueryCollectionsByIds, props => props);

export const FETCH_QUERY_SEARCHES = 'FETCH_QUERY_SEARCHES';
export const fetchQuerySearchesByIds = createAsyncAction(FETCH_QUERY_SEARCHES, api.fetchQuerySearchesByIds, props => props);

export const SAVE_USER_SEARCH = 'SAVE_USER_SEARCH';
export const saveUserSearch = createAsyncAction(SAVE_USER_SEARCH, api.saveUserSearch, props => props);

export const LOAD_USER_SEARCHES = 'LOAD_USER_SEARCHES';
export const loadUserSearches = createAsyncAction(LOAD_USER_SEARCHES, api.loadUserSearches, props => props);

export const DELETE_USER_SEARCH = 'DELETE_USER_SEARCH';
export const deleteUserSearch = createAsyncAction(DELETE_USER_SEARCH, api.deleteUserSearch, props => props);

export const MARK_AS_DELETED_QUERY = 'MARK_AS_DELETED_QUERY';
export const markAsDeletedQuery = createAction(MARK_AS_DELETED_QUERY);

export const REMOVE_NEW_STATUS = 'REMOVE_NEW_STATUS';
export const removeNewStatusFromQueries = createAction(REMOVE_NEW_STATUS, params => params);

export const REMOVE_DELETED_QUERIES = 'REMOVE_DELETED_QUERIES';
export const removeDeletedQueries = createAction(REMOVE_DELETED_QUERIES);

export const RESET_QUERIES = 'RESET_QUERIES';
export const resetQueries = createAction(RESET_QUERIES);

export const RESET_SELECTED = 'RESET_SELECTED';
export const resetSelected = createAction(RESET_SELECTED);

export const RESET_STORY_SPLIT_COUNTS = 'RESET_STORY_SPLIT_COUNTS';
export const resetSentenceCounts = createAction(RESET_STORY_SPLIT_COUNTS);

export const RESET_QUERY_TOP_WORDS = 'RESET_QUERY_TOP_WORDS';
export const resetTopWords = createAction(RESET_QUERY_TOP_WORDS);

export const SWAP_SORT_QUERIES = 'SWAP_SORT_QUERIES';
export const swapSortQueries = createAction(SWAP_SORT_QUERIES, props => props);

export const RESET_QUERY_TOP_WORDS_COMPARISON = 'RESET_QUERY_TOP_WORDS_COMPARISON';
export const resetTopWordsComparison = createAction(RESET_QUERY_TOP_WORDS_COMPARISON);

export const RESET_SAMPLE_STORIES = 'RESET_SAMPLE_STORIES';
export const resetSampleStories = createAction(RESET_SAMPLE_STORIES);

export const RESET_STORY_COUNTS = 'RESET_STORY_COUNTS';
export const resetStoryCounts = createAction(RESET_STORY_COUNTS);

export const RESET_GEO = 'RESET_GEO';
export const resetGeo = createAction(RESET_GEO);

export const RESET_THEMES = 'RESET_THEMES';
export const FETCH_TOP_THEMES = 'FETCH_TOP_THEMES';
export const resetThemes = createAction(RESET_THEMES);
export const fetchTopThemes = createAsyncAction(FETCH_TOP_THEMES, api.fetchQueryTopThemes, params => params);
export const fetchDemoTopThemes = createAsyncAction(FETCH_TOP_THEMES, api.fetchDemoQueryTopThemes, params => params);

export const SELECT_DATA_POINT = 'SELECT_DATA_POINT';
export const setSentenceDataPoint = createAction(SELECT_DATA_POINT, params => params);

export const RESET_SELECTED_DATA_POINT = 'RESET_SELECTED_DATA_POINT';
export const resetSentenceDataPoint = createAction(RESET_SELECTED_DATA_POINT);

export const COPY_AND_REPLACE_QUERY_FIELD = 'COPY_AND_REPLACE_QUERY_FIELD';
export const copyAndReplaceQueryField = createAction(COPY_AND_REPLACE_QUERY_FIELD, params => params);

export const SELECT_EXPLORER_TIME_AGGREGATE = 'SELECT_EXPLORER_TIME_AGGREGATE';
export const selectExplorerTimeAggregate = createAction(SELECT_EXPLORER_TIME_AGGREGATE, timeperiod => timeperiod);

export const COUNT_SOURCE_COLLECITON_USAGE = 'COUNT_SOURCE_COLLECITON_USAGE';
export const countSourceCollectionUsage = createAction(COUNT_SOURCE_COLLECITON_USAGE, api.countSourceCollectionUsage, params => params);
