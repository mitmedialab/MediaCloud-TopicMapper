import { resolve } from 'redux-simple-promise';
import { FETCH_TOPIC_SUMMARY, UPDATE_TOPIC_SEED_QUERY, UPDATE_TOPIC_SETTINGS, SET_TOPIC_FAVORITE,
  TOPIC_START_SPIDER, TOPIC_GENERATE_SNAPSHOT, TOPIC_CREATE_SNAPSHOT } from '../../../actions/topicActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';
import { snapshotIsUsable, TOPIC_SNAPSHOT_STATE_COMPLETED, TOPIC_SNAPSHOT_STATE_RUNNING } from './snapshots';

const addVersionNumberToJobs = (snapshots, jobStates) => {
  let newJobStates;
  if (snapshots) {
    newJobStates = jobStates.map((j) => {
      const associatedSnapshot = snapshots.find(s => s.snapshots_id === j.snapshots_id);
      const versionNumber = associatedSnapshot ? associatedSnapshot.note : null;
      return { ...j, versionNumber };
    });
  } else {
    newJobStates = jobStates;
  }
  return newJobStates;
};

// this is important to handle the fact that some older topics don't have any snapshots
// but do have jobs
export const addLatestStateToTopic = (t) => {
  let latestState; // this acts as a psuedo-snapshot
  // if no jobs, use original topic state
  if (!t.job_states || t.job_states.length === 0) {
    latestState = {
      state: t.state,
      message: null,
      job_states_id: null,
    };
  } else {
    // if jobs, determine the latest
    const mostRecentJobState = t.job_states[0];
    // handle case where job is done but still importing
    const associatedSnapshot = t.snapshots ? t.snapshots.list.find(s => s.snapshots_id === mostRecentJobState.snapshots_id) : null;
    let stateToUse;
    if (associatedSnapshot && (associatedSnapshot.state === TOPIC_SNAPSHOT_STATE_COMPLETED)) {
      stateToUse = snapshotIsUsable(associatedSnapshot) ? TOPIC_SNAPSHOT_STATE_COMPLETED : TOPIC_SNAPSHOT_STATE_RUNNING;
    } else {
      stateToUse = mostRecentJobState.state;
    }
    latestState = {
      state: stateToUse,
      message: mostRecentJobState.message,
      job_states_id: mostRecentJobState.job_states_id,
    };
  }
  return {
    ...t,
    latestState,
    job_states: t.snapshots ? addVersionNumberToJobs(t.snapshots.list, t.job_states) : [],
  };
};

const info = createAsyncReducer({
  action: FETCH_TOPIC_SUMMARY,
  handleSuccess: payload => ({ ...addLatestStateToTopic(payload) }),
  // whenever we change somethign we return whole topic from the server and need update all this stuff
  [resolve(UPDATE_TOPIC_SEED_QUERY)]: payload => ({ ...addLatestStateToTopic(payload) }),
  [resolve(UPDATE_TOPIC_SETTINGS)]: payload => ({ ...addLatestStateToTopic(payload) }),
  [resolve(TOPIC_START_SPIDER)]: payload => ({ ...addLatestStateToTopic(payload) }),
  [resolve(TOPIC_GENERATE_SNAPSHOT)]: payload => ({ ...addLatestStateToTopic(payload) }),
  [resolve(TOPIC_CREATE_SNAPSHOT)]: payload => ({ ...addLatestStateToTopic(payload) }),
  [resolve(SET_TOPIC_FAVORITE)]: payload => ({ ...addLatestStateToTopic(payload) }),
});

export default info;
