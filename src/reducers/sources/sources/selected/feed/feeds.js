import { createAsyncReducer } from '../../../../../lib/reduxHelpers';
import { FETCH_SOURCE_FEEDS } from '../../../../../actions/sourceActions';
import { postgresDateToMoment } from '../../../../../lib/dateUtil';

const feeds = createAsyncReducer({
  initialState: {
    count: 0,
    list: [],
  },
  action: FETCH_SOURCE_FEEDS,
  handleSuccess: payload => ({
    count: payload.count,
    list: payload.results.map(feed => ({
      ...feed,
      lastDownloadMoment: feed.last_attempted_download_time ? postgresDateToMoment(feed.last_attempted_download_time) : null,
      lastNewStoryMoment: feed.last_new_story_time ? postgresDateToMoment(feed.last_new_story_time) : null,
      lastSuccessfulDownloadMoment: feed.last_successful_download_time ? postgresDateToMoment(feed.last_successful_download_time) : null,
    })),
  }),
});
export default feeds;
