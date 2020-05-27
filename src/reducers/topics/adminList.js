import { FETCH_ADMIN_TOPIC_LIST } from '../../actions/topicActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { addUsefulDetailsToTopicsList } from './personalList';

export const topicMessageSaysTooBig = msg => msg && (msg.includes('exceeds topic max') || msg.includes('solr_seed_query returned more than'));

const adminList = createAsyncReducer({
  initialState: {
    topics: [],
  },
  action: FETCH_ADMIN_TOPIC_LIST,
  handleSuccess: payload => ({
    topics: addUsefulDetailsToTopicsList(payload)
      .map((t) => {
        // mark the ones that are "exceeded stories" - these are noise
        const updatedTopic = { ...t };
        if (t.latestState === 'error') {
          if (topicMessageSaysTooBig(t.latestState.message)) {
            updatedTopic.latestState.state = 'error (too big)';
          }
          const mostRecentJobStatus = t.job_status[0];
          updatedTopic.inErrorSince = mostRecentJobStatus && mostRecentJobStatus.last_updated ? mostRecentJobStatus.last_updated : t.latestState.state;
        }
        return updatedTopic;
      })
      .sort((a, b) => b - a),
  }),
});

export default adminList;
