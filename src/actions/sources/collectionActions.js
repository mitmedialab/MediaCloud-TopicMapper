import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/sources';

export const FETCH_COLLECTION_SOURCES_BY_IDS = 'FETCH_COLLECTION_SOURCES_BY_IDS';
export const fetchCollectionSourcesByIds = createAsyncAction(FETCH_COLLECTION_SOURCES_BY_IDS, api.collectionsByIds, props => props);

export const RESET_COLLECTIONS_BY_IDS = 'RESET_COLLECTIONS_BY_IDS';
export const resetCollectionsByIds = createAction(RESET_COLLECTIONS_BY_IDS);

export const SELECT_COLLECTION = 'SELECT_COLLECTION';
export const selectCollection = createAction(SELECT_COLLECTION, id => id);

export const FETCH_COLLECTION_LIST = 'FETCH_COLLECTION_LIST';
export const fetchCollectionList = createAsyncAction(FETCH_COLLECTION_LIST, api.collectionList, id => id);

export const FETCH_COLLECTION_DETAILS = 'FETCH_COLLECTION_DETAILS';
export const fetchCollectionDetails = createAsyncAction(FETCH_COLLECTION_DETAILS, api.collectionDetails, id => id);

export const FETCH_COLLECTION_TO_COPY = 'FETCH_COLLECTION_TO_COPY';
export const fetchCollectionToCopy = createAsyncAction(FETCH_COLLECTION_TO_COPY, api.collectionDetails, id => id);

export const FETCH_COLLECTION_SOURCE_REPRESENTATION = 'FETCH_COLLECTION_SOURCE_REPRESENTATION';
export const fetchCollectionSourceRepresentation = createAsyncAction(FETCH_COLLECTION_SOURCE_REPRESENTATION, api.collectionSourceRepresentation, id => id);

export const FETCH_COLLECTION_SOURCE_SPLIT_STORY_HISTORICAL_COUNTS = 'FETCH_COLLECTION_SOURCE_SPLIT_STORY_HISTORICAL_COUNTS';
export const fetchCollectionSourceSplitStoryHistoricalCounts = createAsyncAction(FETCH_COLLECTION_SOURCE_SPLIT_STORY_HISTORICAL_COUNTS, api.collectionSourceSplitStoryHistoricalCounts, id => id);

export const FETCH_COLLECTION_SOURCE_LIST = 'FETCH_COLLECTION_SOURCE_LIST';
export const fetchCollectionSourceList = createAsyncAction(FETCH_COLLECTION_SOURCE_LIST, api.collectionSourceList);

export const SET_COLLECTION_SOURCE_HISTORY_TIME_PERIOD = 'SET_COLLECTION_SOURCE_HISTORY_TIME_PERIOD';
export const setCollectionSourceHistoryTimePeriod = createAction(SET_COLLECTION_SOURCE_HISTORY_TIME_PERIOD, timePeriod => timePeriod);

export const CREATE_NEW_COLLECTION = 'CREATE_NEW_COLLECTION';
export const createCollection = createAsyncAction(CREATE_NEW_COLLECTION, api.createCollection, props => props);

export const UPDATE_COLLECTION = 'UPDATE_COLLECTION';
export const updateCollection = createAsyncAction(UPDATE_COLLECTION, api.updateCollection, props => props);

export const FETCH_SIMILAR_COLLECTIONS = 'FETCH_SIMILAR_COLLECTIONS';
export const fetchSimilarCollections = createAsyncAction(FETCH_SIMILAR_COLLECTIONS, api.similarCollections, id => id);

export const FETCH_FEATURED_COLLECTIONS_LIST = 'FETCH_FEATURED_COLLECTIONS_LIST';
export const fetchFeaturedCollectionList = createAsyncAction(FETCH_FEATURED_COLLECTIONS_LIST, api.featuredCollectionList);

export const UPLOAD_SOURCE_LIST_FROM_TEMPLATE = 'UPLOAD_SOURCE_LIST_FROM_TEMPLATE';
export const uploadSourceListFromTemplate = createAsyncAction(UPLOAD_SOURCE_LIST_FROM_TEMPLATE, api.collectionUploadSourceListFromTemplate, props => props);

export const CREATE_SOURCES_FROM_URLS = 'CREATE_SOURCES_FROM_URLS';
export const createSourcesByUrl = createAsyncAction(CREATE_SOURCES_FROM_URLS, api.createSourcesByUrl, urls => urls);

export const REMOVE_SOURCES_FROM_COLLECTION = 'REMOVE_SOURCES_FROM_COLLECTION';
export const removeSourcesFromCollection = createAsyncAction(REMOVE_SOURCES_FROM_COLLECTION, api.removeSourcesFromCollection, props => props);

export const FETCH_COLLECTION_NAME_EXISTS = 'FETCH_COLLECTION_NAME_EXISTS';
export const fetchCollectionWithNameExists = createAsyncAction(FETCH_COLLECTION_NAME_EXISTS, api.fetchCollectionWithNameExists, id => id);

export const FETCH_GEO_COLLECTIONS_BY_COUNTRY = 'FETCH_GEO_COLLECTIONS_BY_COUNTRY';
export const fetchGeoCollectionsByCountry = createAsyncAction(FETCH_GEO_COLLECTIONS_BY_COUNTRY, api.fetchGeoCollectionsByCountry);
