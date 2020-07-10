import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/system';


export const SELECT_MEDIAPICKER_QUERY_ARGS = 'SELECT_MEDIAPICKER_QUERY_ARGS';
export const selectMediaPickerQueryArgs = createAction(SELECT_MEDIAPICKER_QUERY_ARGS, args => args);
export const RESET_MEDIAPICKER_QUERY_ARGS = 'RESET_MEDIAPICKER_QUERY_ARGS';
export const resetMediaPickerQueryArgs = createAction(RESET_MEDIAPICKER_QUERY_ARGS, args => args);

export const FETCH_FEATURED_COLLECTIONS_FOR_QUERY = 'FETCH_FEATURED_COLLECTIONS_FOR_QUERY';
export const fetchMediaPickerFeaturedCollections = createAsyncAction(FETCH_FEATURED_COLLECTIONS_FOR_QUERY, api.fetchMediaPickerFeaturedCollections);

export const FETCH_MEDIAPICKER_COLLECTION_SEARCH = 'FETCH_MEDIAPICKER_COLLECTION_SEARCH';
export const fetchMediaPickerCollections = createAsyncAction(FETCH_MEDIAPICKER_COLLECTION_SEARCH, api.fetchMediaPickerCollections, params => params);
export const RESET_MEDIAPICKER_COLLECTION_SEARCH = 'RESET_MEDIAPICKER_COLLECTION_SEARCH';
export const resetMediaPickerCollections = createAction(RESET_MEDIAPICKER_COLLECTION_SEARCH, params => params);

export const FETCH_MEDIAPICKER_SOURCE_SEARCH = 'FETCH_MEDIAPICKER_SOURCE_SEARCH';
export const fetchMediaPickerSources = createAsyncAction(FETCH_MEDIAPICKER_SOURCE_SEARCH, api.fetchMediaPickerSources, params => params);
export const RESET_MEDIAPICKER_SOURCE_SEARCH = 'RESET_MEDIAPICKER_SOURCE_SEARCH';
export const resetMediaPickerSources = createAction(RESET_MEDIAPICKER_SOURCE_SEARCH, params => params);

export const MEDIA_PICKER_INITIALIZE_ALREADY_SELECTED_MEDIA = 'MEDIA_PICKER_INITIALIZE_ALREADY_SELECTED_MEDIA';
export const initializePreviouslySelectedMedia = createAction(MEDIA_PICKER_INITIALIZE_ALREADY_SELECTED_MEDIA, media => media);

export const MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST = 'MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST';
export const toggleMedia = createAction(MEDIA_PICKER_TOGGLE_MEDIA_IN_LIST, media => media);

export const MEDIA_PICKER_SELECT_MEDIA = 'MEDIA_PICKER_SELECT_MEDIA';
export const selectMedia = createAction(MEDIA_PICKER_SELECT_MEDIA, media => media);

export const MEDIA_PICKER_SELECT_MEDIA_CUSTOM_COLL = 'MEDIA_PICKER_SELECT_MEDIA_CUSTOM_COLL';
export const selectMediaCustomColl = createAction(MEDIA_PICKER_SELECT_MEDIA_CUSTOM_COLL, media => media);

export const MEDIA_PICKER_UNSELECT_MEDIA = 'MEDIA_PICKER_UNSELECT_MEDIA';
export const unselectMedia = createAction(MEDIA_PICKER_UNSELECT_MEDIA, media => media);

export const MEDIA_PICKER_CLEAR_SELECTED_MEDIA = 'MEDIA_PICKER_CLEAR_SELECTED_MEDIA';
export const clearSelectedMedia = createAction(MEDIA_PICKER_CLEAR_SELECTED_MEDIA, media => media);

// noop
export const RESET_MEDIAPICKER_FEATURED_COLLECTION_SEARCH = 'RESET_MEDIAPICKER_FEATURED_COLLECTION_SEARCH';
