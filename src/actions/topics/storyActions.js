import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const FETCH_TOPIC_STORY_COUNTS = 'FETCH_TOPIC_STORY_COUNTS';
export const FETCH_TOPIC_STORY_INFO = 'FETCH_TOPIC_STORY_INFO';

// pass in topic id and story id
export const fetchTopicStoryInfo = createAsyncAction(FETCH_TOPIC_STORY_INFO, api.topicStoryInfo);

// pass in topic id, filters
export const fetchTopicStoryCounts = createAsyncAction(FETCH_TOPIC_STORY_COUNTS, api.topicStoryCounts);
