import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const GO_TO_CREATE_PLATFORM_STEP = 'GO_TO_CREATE_PLATFORM_STEP';
export const goToCreatePlatformStep = createAction(GO_TO_CREATE_PLATFORM_STEP, step => step);

export const RESET_PLATFORMS = 'RESET_PLATFORMS';
export const resetTopicPlatforms = createAction(RESET_PLATFORMS);

export const FETCH_PLATFORMS_IN_TOPIC = 'FETCH_PLATFORMS_IN_TOPIC';
export const fetchPlatformsInTopicList = createAsyncAction(FETCH_PLATFORMS_IN_TOPIC, api.platformsInTopic);

export const DELETE_PLATFORM = 'DELETE_PLATFORM';
export const deleteTopicPlatform = createAsyncAction(DELETE_PLATFORM, api.topicDeletePlatform);

export const TOPIC_CREATE_PLATFORM = 'TOPIC_CREATE_PLATFORM';
export const topicCreatePlatform = createAsyncAction(TOPIC_CREATE_PLATFORM, api.topicCreatePlatform, params => params);

export const TOPIC_UPDATE_PLATFORM = 'TOPIC_UPDATE_PLATFORM';
export const topicUpdatePlatform = createAsyncAction(TOPIC_UPDATE_PLATFORM, api.topicUpdatePlatform, params => params);

export const SELECT_PLATFORM = 'SELECT_PLATFORM';
export const selectPlatform = createAsyncAction(SELECT_PLATFORM, id => id);

export const UPLOAD_PLATFORM_GENERIC_CSV_FILE = 'UPLOAD_PLATFORM_GENERIC_CSV_FILE';
export const uploadPlatformGenericCsvFile = createAsyncAction(UPLOAD_PLATFORM_GENERIC_CSV_FILE, api.uploadPlatformGenericCsvFile);
