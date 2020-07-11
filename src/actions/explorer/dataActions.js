import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/explorer';

export const FETCH_WORD_SAMPLE_SENTENCES = 'FETCH_WORD_SAMPLE_SENTENCES';
export const fetchWordSampleSentences = createAsyncAction(FETCH_WORD_SAMPLE_SENTENCES, api.fetchWordSampleSentences);

export const FETCH_TOP_ENTITIES_PEOPLE = 'FETCH_TOP_ENTITIES_PEOPLE';
export const fetchTopEntitiesPeople = createAsyncAction(FETCH_TOP_ENTITIES_PEOPLE, api.fetchQueryTopEntitiesPeople, params => params);

export const FETCH_TOP_ENTITIES_ORGS = 'FETCH_TOP_ENTITIES_ORGS';
export const fetchTopEntitiesOrgs = createAsyncAction(FETCH_TOP_ENTITIES_ORGS, api.fetchQueryTopEntitiesOrgs, params => params);

export const FETCH_QUERY_SPLIT_STORY_COUNT = 'FETCH_QUERY_SPLIT_STORY_COUNT';
export const fetchQuerySplitStoryCount = createAsyncAction(FETCH_QUERY_SPLIT_STORY_COUNT, api.fetchQuerySplitStoryCount, params => params);

export const FETCH_QUERY_SAMPLE_STORIES = 'FETCH_QUERY_SAMPLE_STORIES';
export const fetchQuerySampleStories = createAsyncAction(FETCH_QUERY_SAMPLE_STORIES, api.fetchQuerySampleStories, params => params);

export const FETCH_QUERY_PER_DATE_SAMPLE_STORIES = 'FETCH_QUERY_PER_DATE_SAMPLE_STORIES';
export const fetchQueryPerDateSampleStories = createAsyncAction(FETCH_QUERY_PER_DATE_SAMPLE_STORIES, api.fetchQueryPerDateSampleStories, params => params);

export const FETCH_QUERY_TOP_WORDS = 'FETCH_QUERY_TOP_WORDS';
export const fetchQueryTopWords = createAsyncAction(FETCH_QUERY_TOP_WORDS, api.fetchQueryTopWords, params => params);

export const FETCH_QUERY_PER_DATE_TOP_WORDS = 'FETCH_QUERY_PER_DATE_TOP_WORDS';
export const fetchQueryPerDateTopWords = createAsyncAction(FETCH_QUERY_PER_DATE_TOP_WORDS, api.fetchQueryPerDateTopWords, params => params);

export const FETCH_QUERY_TOP_WORDS_COMPARISON = 'FETCH_QUERY_TOP_WORDS_COMPARISON';
export const fetchQueryTopWordsComparison = createAsyncAction(FETCH_QUERY_TOP_WORDS_COMPARISON, api.fetchQueryTopWordsComparison, params => params);

export const SELECT_COMPARATIVE_WORD_FIELD = 'SELECT_COMPARATIVE_WORD_FIELD';
export const selectComparativeWordField = createAction(SELECT_COMPARATIVE_WORD_FIELD, params => params);

export const FETCH_QUERY_GEO = 'FETCH_QUERY_GEO';
export const fetchQueryGeo = createAsyncAction(FETCH_QUERY_GEO, api.fetchQueryGeo, params => params);

export const FETCH_TOP_THEMES = 'FETCH_TOP_THEMES';
export const fetchTopThemes = createAsyncAction(FETCH_TOP_THEMES, api.fetchQueryTopThemes, params => params);
