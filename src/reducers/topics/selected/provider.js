import { combineReducers } from 'redux';
import { FETCH_TOPIC_PROVIDER_WORDS, FETCH_TOPIC_PROVIDER_STORIES, FETCH_TOPIC_PROVIDER_COUNT_OVER_TIME,
  FETCH_TOPIC_PROVIDER_COUNT, FETCH_TOPIC_PROVIDER_TAG_USE, FETCH_TOPIC_PROVIDER_MEDIA } from '../../../actions/topicActions';
import { createIndexedAsyncReducer } from '../../../lib/reduxHelpers';
import { cleanDateCounts } from '../../../lib/dateUtil';

const providerReducer = combineReducers({

  words: createIndexedAsyncReducer({ action: FETCH_TOPIC_PROVIDER_WORDS }),

  stories: createIndexedAsyncReducer({ action: FETCH_TOPIC_PROVIDER_STORIES }),

  countOverTime: createIndexedAsyncReducer({
    action: FETCH_TOPIC_PROVIDER_COUNT_OVER_TIME,
    handleSuccess: payload => ({
      total: payload.total_story_count,
      // clean up the dates to be in a format our charting library can handle
      counts: cleanDateCounts(payload.counts),
    }),
  }),

  count: createIndexedAsyncReducer({ action: FETCH_TOPIC_PROVIDER_COUNT }),

  tagUse: createIndexedAsyncReducer({ action: FETCH_TOPIC_PROVIDER_TAG_USE }),

  media: createIndexedAsyncReducer({ action: FETCH_TOPIC_PROVIDER_MEDIA }),

});

export default providerReducer;
