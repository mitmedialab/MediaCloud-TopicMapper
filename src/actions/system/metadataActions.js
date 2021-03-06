import { createAction } from 'redux-actions';

import * as api from '../../lib/serverApi/system';

import { createAsyncAction } from '../../lib/reduxHelpers';

export const FETCH_METADATA_VALUES_FOR_COUNTRY = 'FETCH_METADATA_VALUES_FOR_COUNTRY';
export const fetchMetadataValuesForCountry = createAsyncAction(FETCH_METADATA_VALUES_FOR_COUNTRY, api.mediaMetadataValues);

export const FETCH_METADATA_VALUES_FOR_STATE = 'FETCH_METADATA_VALUES_FOR_STATE';
export const fetchMetadataValuesForState = createAsyncAction(FETCH_METADATA_VALUES_FOR_STATE, api.mediaMetadataValues);

export const FETCH_METADATA_VALUES_FOR_PRIMARY_LANGUAGE = 'FETCH_METADATA_VALUES_FOR_PRIMARY_LANGUAGE';
export const fetchMetadataValuesForPrimaryLanguage = createAsyncAction(FETCH_METADATA_VALUES_FOR_PRIMARY_LANGUAGE, api.mediaMetadataValues);

export const FETCH_METADATA_VALUES_FOR_COUNTRY_OF_FOCUS = 'FETCH_METADATA_VALUES_FOR_COUNTRY_OF_FOCUS';
export const fetchMetadataValuesForCountryOfFocus = createAsyncAction(FETCH_METADATA_VALUES_FOR_COUNTRY_OF_FOCUS, api.mediaMetadataValues);

export const FETCH_METADATA_VALUES_FOR_MEDIA_TYPE = 'FETCH_METADATA_VALUES_FOR_MEDIA_TYPE';
export const fetchMetadataValuesForMediaType = createAsyncAction(FETCH_METADATA_VALUES_FOR_MEDIA_TYPE, api.mediaMetadataValues);

export const SEARCH_METADATA_VALUES = 'SEARCH_METADATA_VALUES';
export const searchMetadataValues = createAsyncAction(SEARCH_METADATA_VALUES, api.mediaMetadataSearch);

export const SELECT_METADATA_QUERY_ARGS = 'SELECT_METADATA_QUERY_ARGS';
export const selectMetadataQueryArgs = createAction(SELECT_METADATA_QUERY_ARGS, args => args);

export const RESET_METADATA_SHORTLIST = 'RESET_METADATA_SHORTLIST';
export const resetMetadataShortlist = createAction(RESET_METADATA_SHORTLIST, params => params);
