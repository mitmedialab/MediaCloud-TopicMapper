import { createAsyncAction } from '../lib/reduxHelpers';
import * as api from '../lib/serverApi/platforms';


export const FETCH_PLATFORM_COUNT = 'FETCH_PLATFORM_COUNT';
export const fetchPlatformCount = createAsyncAction(FETCH_PLATFORM_COUNT, api.platformCount);

export const FETCH_PLATFORM_SAMPLE = 'FETCH_PLATFORM_SAMPLE';
export const fetchPlatformSample = createAsyncAction(FETCH_PLATFORM_SAMPLE, api.platformSample);

export const FETCH_PLATFORM_COUNT_OVER_TIME = 'FETCH_PLATFORM_COUNT_OVER_TIME';
export const fetchPlatformCountOverTime = createAsyncAction(FETCH_PLATFORM_COUNT_OVER_TIME, api.platformCountOverTime);

export const FETCH_PLATFORM_WORDS = 'FETCH_PLATFORM_WORDS';
export const fetchPlatformWords = createAsyncAction(FETCH_PLATFORM_WORDS, api.platformWords);
