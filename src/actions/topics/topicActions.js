import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const FETCH_PERSONAL_TOPIC_LIST = 'FETCH_PERSONAL_TOPIC_LIST';
export const fetchPersonalTopicsList = createAsyncAction(FETCH_PERSONAL_TOPIC_LIST, api.topicsPersonalList, linkId => linkId);

export const FETCH_PUBLIC_TOPICS_LIST = 'FETCH_PUBLIC_TOPICS_LIST';
export const fetchPublicTopicsList = createAsyncAction(FETCH_PUBLIC_TOPICS_LIST, api.topicsPublicList);

export const FETCH_FAVORITE_TOPICS_LIST = 'FETCH_FAVORITE_TOPICS_LIST';
export const fetchFavoriteTopicsList = createAsyncAction(FETCH_FAVORITE_TOPICS_LIST, api.topicsFavoriteList);

export const FETCH_ADMIN_TOPIC_LIST = 'FETCH_ADMIN_TOPIC_LIST';
export const fetchAdminTopicList = createAsyncAction(FETCH_ADMIN_TOPIC_LIST, api.topicsAdminList);

export const UPDATE_TOPIC_FILTER_PARSING_STATUS = 'UPDATE_TOPIC_FILTER_PARSING_STATUS';
export const updateTopicFilterParsingStatus = createAction(UPDATE_TOPIC_FILTER_PARSING_STATUS, status => status);

// pass in topicId
export const SELECT_TOPIC = 'SELECT_TOPIC';
export const selectTopic = createAction(SELECT_TOPIC, id => parseInt(id, 10));

// pass in topicId
export const FETCH_TOPIC_SNAPSHOTS_LIST = 'FETCH_TOPIC_SNAPSHOTS_LIST';
export const fetchTopicSnapshotsList = createAsyncAction(FETCH_TOPIC_SNAPSHOTS_LIST, api.topicSnapshotsList);

// pass in snapshotId
export const TOPIC_FILTER_BY_SNAPSHOT = 'TOPIC_FILTER_BY_SNAPSHOT';
export const filterBySnapshot = createAction(TOPIC_FILTER_BY_SNAPSHOT, id => id);

// pass in timespanId
export const TOPIC_FILTER_BY_TIMESPAN = 'TOPIC_FILTER_BY_TIMESPAN';
export const filterByTimespan = createAction(TOPIC_FILTER_BY_TIMESPAN, id => id);

// pass in focusId
export const TOPIC_FILTER_BY_FOCUS = 'TOPIC_FILTER_BY_FOCUS';
export const filterByFocus = createAction(TOPIC_FILTER_BY_FOCUS, id => id);
// pass in query str
export const TOPIC_FILTER_BY_QUERY = 'TOPIC_FILTER_BY_QUERY';
export const filterByQuery = createAction(TOPIC_FILTER_BY_QUERY, str => str);

// pass in topicId
export const FETCH_TOPIC_SUMMARY = 'FETCH_TOPIC_SUMMARY';
export const fetchTopicSummary = createAsyncAction(FETCH_TOPIC_SUMMARY, api.topicSummary);

// pass in topicId, snapshotId and focusId
export const FETCH_TOPIC_TIMESPANS_LIST = 'FETCH_TOPIC_TIMESPANS_LIST';
export const fetchTopicTimespansList = createAsyncAction(FETCH_TOPIC_TIMESPANS_LIST, api.topicTimespansList);

export const TOGGLE_TIMESPAN_CONTROLS = 'TOGGLE_TIMESPAN_CONTROLS';
export const toggleTimespanControls = createAction(TOGGLE_TIMESPAN_CONTROLS, isVisible => isVisible);

export const SET_TIMESPAN_VISIBLE_PERIOD = 'SET_TIMESPAN_VISIBLE_PERIOD';
export const setTimespanVisiblePeriod = createAction(SET_TIMESPAN_VISIBLE_PERIOD, period => period);

export const TOGGLE_FILTER_CONTROLS = 'TOGGLE_FILTER_CONTROLS';
export const toggleFilterControls = createAction(TOGGLE_FILTER_CONTROLS, isVisible => isVisible);

// pass in topicId and favorite bool
export const SET_TOPIC_FAVORITE = 'SET_TOPIC_FAVORITE';
export const setTopicFavorite = createAsyncAction(SET_TOPIC_FAVORITE, api.topicSetFavorite);

// pass in search string
export const FETCH_TOPIC_SEARCH_RESULTS = 'FETCH_TOPIC_SEARCH_RESULTS';
export const fetchTopicSearchResults = createAsyncAction(FETCH_TOPIC_SEARCH_RESULTS, api.fetchTopicSearchResults, searchStr => searchStr);

export const FETCH_TOPIC_WITH_NAME_EXISTS = 'FETCH_TOPIC_WITH_NAME_EXISTS';
export const fetchTopicWithNameExists = createAsyncAction(FETCH_TOPIC_WITH_NAME_EXISTS, api.fetchTopicWithNameExists, searchStr => searchStr);

// pass in a boolean
export const SET_TOPIC_NEEDS_NEW_SNAPSHOT = 'SET_TOPIC_NEEDS_NEW_SNAPSHOT';
export const setTopicNeedsNewSnapshot = createAction(SET_TOPIC_NEEDS_NEW_SNAPSHOT, needsNewSnapshot => needsNewSnapshot);

export const FETCH_USER_QUEUED_RUNNING_TOPICS = 'FETCH_USER_QUEUED_RUNNING_TOPICS';
export const fetchUserQueuedAndRunningTopics = createAsyncAction(FETCH_USER_QUEUED_RUNNING_TOPICS, api.userQueuedAndRunningTopics);

// pass in topic id
export const FETCH_TOPIC_WORD2VEC = 'FETCH_TOPIC_WORD2VEC';
export const fetchTopicWord2Vec = createAsyncAction(FETCH_TOPIC_WORD2VEC, api.topicWord2Vec, id => id);

// pass in topicId, snapshotId, focusId, q
export const FETCH_TOPIC_WORD2VEC_TIMESPANS = 'FETCH_TOPIC_WORD2VEC_TIMESPANS';
export const fetchTopicWord2VecTimespans = createAsyncAction(FETCH_TOPIC_WORD2VEC_TIMESPANS, api.topicWord2VecTimespans);

export const FETCH_TOPIC_SNAPSHOT_STORY_COUNTS = 'FETCH_TOPIC_SNAPSHOT_STORY_COUNTS';
export const fetchSnapshotStoryCounts = createAsyncAction(FETCH_TOPIC_SNAPSHOT_STORY_COUNTS, api.topicSnapshotStoryCounts, id => id);

export const UPDATE_TOPIC_SETTINGS = 'UPDATE_TOPIC_SETTINGS';
export const updateTopicSettings = createAsyncAction(UPDATE_TOPIC_SETTINGS, api.updateTopicSettings);

export const UPDATE_TOPIC_SEED_QUERY = 'UPDATE_TOPIC_SEED_QUERY';
export const updateTopicSeedQuery = createAsyncAction(UPDATE_TOPIC_SEED_QUERY, api.topicUpdateSeedQuery);

export const TOPIC_START_SPIDER = 'TOPIC_START_SPIDER';
export const topicSnapshotSpider = createAsyncAction(TOPIC_START_SPIDER, api.topicSnapshotSpider);

export const TOPIC_GENERATE_SNAPSHOT = 'TOPIC_GENERATE_SNAPSHOT';
export const topicSnapshotGenerate = createAsyncAction(TOPIC_GENERATE_SNAPSHOT, api.topicSnapshotGenerate);

export const TOPIC_CREATE_SNAPSHOT = 'TOPIC_CREATE_SNAPSHOT';
export const topicSnapshotCreate = createAsyncAction(TOPIC_GENERATE_SNAPSHOT, api.topicSnapshotCreate);
