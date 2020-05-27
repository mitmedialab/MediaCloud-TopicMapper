import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topicProvider';

export const FETCH_TOPIC_PROVIDER_WORDS = 'FETCH_TOPIC_PROVIDER_WORDS';
export const fetchTopicProviderWords = createAsyncAction(FETCH_TOPIC_PROVIDER_WORDS, api.topicProviderWords);

export const FETCH_TOPIC_PROVIDER_STORIES = 'FETCH_TOPIC_PROVIDER_STORY_LIST';
export const fetchTopicProviderStories = createAsyncAction(FETCH_TOPIC_PROVIDER_STORIES, api.topicProviderStories);

export const FETCH_TOPIC_PROVIDER_COUNT_OVER_TIME = 'FETCH_TOPIC_PROVIDER_COUNT_OVER_TIME';
export const fetchTopicProviderCountOverTime = createAsyncAction(FETCH_TOPIC_PROVIDER_COUNT_OVER_TIME, api.topicProviderCountOverTime);

export const FETCH_TOPIC_PROVIDER_COUNT = 'FETCH_TOPIC_PROVIDER_COUNT';
export const fetchTopicProviderCount = createAsyncAction(FETCH_TOPIC_PROVIDER_COUNT, api.topicProviderCount);

export const FETCH_TOPIC_PROVIDER_TAG_USE = 'FETCH_TOPIC_PROVIDER_TAG_USE';
export const fetchTopicProviderTagUse = createAsyncAction(FETCH_TOPIC_PROVIDER_TAG_USE, api.topicProviderTagUse);

export const FETCH_TOPIC_PROVIDER_MEDIA = 'FETCH_TOPIC_PROVIDER_MEDIA';
export const fetchTopicProviderMedia = createAsyncAction(FETCH_TOPIC_PROVIDER_MEDIA, api.topicProviderMedia);
