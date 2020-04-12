import { createAction } from 'redux-actions';
import { createAsyncAction } from '../lib/reduxHelpers';
import * as api from '../lib/serverApi/stories';

// pass in story id
export const FETCH_STORY_INFO = 'FETCH_STORY_INFO';
export const fetchStoryInfo = createAsyncAction(FETCH_STORY_INFO, api.storyDetails, params => params);

// pass in story id
export const FETCH_STORY_ENTITIES = 'FETCH_STORY_ENTITIES';
export const fetchStoryEntities = createAsyncAction(FETCH_STORY_ENTITIES, api.storyEntities);

// pass in story id
export const FETCH_STORY_NYT_THEMES = 'FETCH_STORY_NYT_THEMES';
export const fetchStoryNytThemes = createAsyncAction(FETCH_STORY_NYT_THEMES, api.storyNytThemes);

export const SELECT_STORY = 'SELECT_STORY';
// pass in stories id
export const selectStory = createAction(SELECT_STORY);
export const RESET_STORY = 'RESET_STORY';

export const resetStory = createAction(RESET_STORY);

export const FETCH_STORY = 'FETCH_STORY';
// pass in topic id, story id, and filters
export const fetchStory = createAsyncAction(FETCH_STORY, api.story);

export const FETCH_STORY_WORDS = 'FETCH_STORY_WORDS';
// pass in topic id and story id
export const fetchStoryWords = createAsyncAction(FETCH_STORY_WORDS, api.storyWords);

export const UPDATE_STORY = 'UPDATE_STORY';
// pass in topic id and story id
export const updateStory = createAsyncAction(UPDATE_STORY, api.storyUpdate, params => params);

export const FETCH_STORY_REDDIT_ATTENTION = 'FETCH_STORY_REDDIT_ATTENTION';
export const fetchStoryRedditAttention = createAsyncAction(FETCH_STORY_REDDIT_ATTENTION, api.storyRedditAttention);

export const FETCH_STORY_IMAGES = 'FETCH_STORY_IMAGES';
export const fetchStoryImages = createAsyncAction(FETCH_STORY_IMAGES, api.storyImages);

export const FETCH_STORY_QUOTES = 'FETCH_STORY_QUOTES';
export const fetchStoryQuotes = createAsyncAction(FETCH_STORY_QUOTES, api.storyQuotes);
