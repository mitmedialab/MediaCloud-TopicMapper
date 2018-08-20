import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const FETCH_TOPIC_STORY_COUNTS = 'FETCH_TOPIC_STORY_COUNTS';
export const FETCH_TOPIC_STORY_INFO = 'FETCH_TOPIC_STORY_INFO';
export const FETCH_STORY_WORDS = 'FETCH_STORY_WORDS';
export const FETCH_STORY_INLINKS = 'FETCH_STORY_INLINKS';
export const FETCH_STORY_OUTLINKS = 'FETCH_STORY_OUTLINKS';
export const SORT_TOPIC_TOP_STORIES = 'SORT_TOPIC_TOP_STORIES';
export const FETCH_TOPIC_INFLUENTIAL_STORIES = 'FETCH_TOPIC_INFLUENTIAL_STORIES';
export const SORT_TOPIC_INFLUENTIAL_STORIES = 'SORT_TOPIC_INFLUENTIAL_STORIES';
export const FETCH_TOPIC_TOP_STORIES = 'FETCH_TOPIC_TOP_STORIES';
export const FETCH_TOPIC_ENGLISH_STORY_COUNTS = 'FETCH_TOPIC_ENGLISH_STORY_COUNTS';
export const FETCH_TOPIC_UNDATEABLE_STORY_COUNTS = 'FETCH_TOPIC_UNDATEABLE_STORY_COUNTS';

// pass in topic id and story id
export const fetchTopicStoryInfo = createAsyncAction(FETCH_TOPIC_STORY_INFO, api.topicStoryInfo);


// pass in topic id and story id
export const fetchStoryWords = createAsyncAction(FETCH_STORY_WORDS, api.storyWords);

// pass in topic id, story id, and filters
export const fetchStoryInlinks = createAsyncAction(FETCH_STORY_INLINKS, api.storyInlinks);

// pass in topic id, story id, and filters
export const fetchStoryOutlinks = createAsyncAction(FETCH_STORY_OUTLINKS, api.storyOutlinks);

// pass in topic id, filters
export const fetchTopicStoryCounts = createAsyncAction(FETCH_TOPIC_STORY_COUNTS, api.topicStoryCounts);

// pass in sort
export const sortTopicTopStories = createAction(SORT_TOPIC_TOP_STORIES, sort => sort);

// pass in topicId, snapshotId, timespanId, sort, limit
export const fetchTopicTopStories = createAsyncAction(FETCH_TOPIC_TOP_STORIES, api.topicTopStories);

// pass in topicId, snapshotId, timespanId, sort, limit, linkId
export const fetchTopicInfluentialStories = createAsyncAction(FETCH_TOPIC_INFLUENTIAL_STORIES, api.topicTopStories);

// pass in sort
export const sortTopicInfluentialStories = createAction(SORT_TOPIC_INFLUENTIAL_STORIES, sort => sort);

// pass in topic id, filters
export const fetchTopicEnglishStoryCounts = createAsyncAction(FETCH_TOPIC_ENGLISH_STORY_COUNTS, api.topicEnglishStoryCounts);

// pass in topic id, filters
export const fetchTopicUndateableStoryCounts = createAsyncAction(FETCH_TOPIC_UNDATEABLE_STORY_COUNTS, api.topicUndateableStoryCounts);
