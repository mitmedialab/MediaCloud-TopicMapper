import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

// pass in topicId, snapshotId, timespanId
export const FETCH_TOPIC_SPLIT_STORY_COUNT = 'FETCH_TOPIC_SPLIT_STORY_COUNT';
export const fetchTopicSplitStoryCounts = createAsyncAction(FETCH_TOPIC_SPLIT_STORY_COUNT, api.topicSplitStoryCounts);

// pass in topicId, focalSetId, filters
export const FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS = 'FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS';
export const fetchTopicFocalSetSplitStoryCounts = createAsyncAction(FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS, api.topicFocalSetSplitStoryCounts);

export const FETCH_TOPIC_TOP_STORIES_ON_DATES = 'FETCH_TOPIC_TOP_STORIES_ON_DATES';
export const fetchTopicTopStoriesOnDates = createAsyncAction(FETCH_TOPIC_TOP_STORIES_ON_DATES, api.topicTopStoriesOnDates);

export const RESET_TOPIC_ATTENTION_DRILL_DOWN = 'RESET_TOPIC_ATTENTION_DRILL_DOWN';
export const resetTopicTopStoriesDrillDown = createAction(RESET_TOPIC_ATTENTION_DRILL_DOWN);

export const SET_TOPIC_ATTENTION_DRILL_DOWN = 'SET_TOPIC_ATTENTION_DRILL_DOWN';
export const setTopicTopStoriesDrillDown = createAction(SET_TOPIC_ATTENTION_DRILL_DOWN);
