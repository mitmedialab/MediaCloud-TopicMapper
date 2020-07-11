import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/explorer';

export const SET_QUERY_WORD_COUNT_SAMPLE_SIZE = 'SET_QUERY_WORD_COUNT_SAMPLE_SIZE';
export const setQueryWordCountSampleSize = createAction(SET_QUERY_WORD_COUNT_SAMPLE_SIZE, sampleSize => sampleSize);

export const UPDATE_TIMESTAMP_FOR_QUERIES = 'UPDATE_TIMESTAMP_FOR_QUERIES';
export const updateTimestampForQueries = createAction(UPDATE_TIMESTAMP_FOR_QUERIES, queries => queries);

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

export const SELECT_WORD = 'SELECT_WORD';
export const selectWord = createAction(SELECT_WORD, word => word);

export const RESET_SELECTED_WORD = 'RESET_SELECTED_WORD';
export const resetSelectedWord = createAction(RESET_SELECTED_WORD);

export const RESET_QUERY_PER_DATE_SAMPLE_STORIES = 'RESET_QUERY_PER_DATE_SAMPLE_STORIES';
export const resetQueriesPerDateSampleStories = createAction(RESET_QUERY_PER_DATE_SAMPLE_STORIES);

export const RESET_QUERY_PER_DATE_TOP_WORDS = 'RESET_QUERY_PER_DATE_TOP_WORDS';
export const resetQueriesPerDateTopWords = createAction(RESET_QUERY_PER_DATE_TOP_WORDS);


export const FETCH_QUERY_SOURCES = 'FETCH_QUERY_SOURCES';
export const fetchQuerySourcesByIds = createAsyncAction(FETCH_QUERY_SOURCES, api.fetchQuerySourcesByIds, props => props);

export const FETCH_QUERY_COLLECTIONS = 'FETCH_QUERY_COLLECTIONS';
export const fetchQueryCollectionsByIds = createAsyncAction(FETCH_QUERY_COLLECTIONS, api.fetchQueryCollectionsByIds, props => props);

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

export const RESET_SELECTED = 'RESET_SELECTED';
export const resetSelected = createAction(RESET_SELECTED);

export const SWAP_SORT_QUERIES = 'SWAP_SORT_QUERIES';
export const swapSortQueries = createAction(SWAP_SORT_QUERIES, props => props);

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
