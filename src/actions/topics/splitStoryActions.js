import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

// pass in topicId, focalSetId, filters
export const FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS = 'FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS';
export const fetchTopicFocalSetSplitStoryCounts = createAsyncAction(FETCH_TOPIC_FOCAL_SET_SPLIT_STORY_COUNTS, api.topicFocalSetSplitStoryCounts);

export const RESET_TOPIC_ATTENTION_DRILL_DOWN = 'RESET_TOPIC_ATTENTION_DRILL_DOWN';
export const resetTopicTopStoriesDrillDown = createAction(RESET_TOPIC_ATTENTION_DRILL_DOWN);

export const SET_TOPIC_ATTENTION_DRILL_DOWN = 'SET_TOPIC_ATTENTION_DRILL_DOWN';
export const setTopicTopStoriesDrillDown = createAction(SET_TOPIC_ATTENTION_DRILL_DOWN);
