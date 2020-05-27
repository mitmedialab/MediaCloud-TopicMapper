import { resolve } from 'redux-simple-promise';
import { FETCH_TOPIC_SUMMARY, UPDATE_TOPIC_SEED_QUERY, UPDATE_TOPIC_SETTINGS, SET_TOPIC_FAVORITE,
  TOPIC_START_SPIDER, TOPIC_CREATE_SNAPSHOT } from '../../../actions/topicActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';
import { snapshotIsUsable, latestSnapshotByDate, TOPIC_SNAPSHOT_STATE_COMPLETED, TOPIC_SNAPSHOT_STATE_RUNNING } from './snapshots';
import { PLATFORM_OPEN_WEB, MEDIA_CLOUD_SOURCE } from '../../../lib/platformTypes';

/**
 * We repurpose the snapshot.notes field to hold the version number of each snapshot.
 * @param snapshots List of snapshots in the topic.
 * @param jobStates List of jobs assoacited with the topic, which may or may not be associaged with a snapshot.
 * @return New list of job states, with a `versionNumber` property added to them
 */
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

/**
 * Compare two lists of platforms (ie. topic_seed_queries) to see if there are any differences. This is needed to see
 * if there are any changes (between the latest snapshot and the topic) that require a new version to be run.
 * @param currentPlatforms List of topic_seed_queries on the latest snapshot
 * @param newPlatforms List of topic_seed_queries for the next topic
 * @return boolean true if there are differences between the platform lists
 */
function checkForAnyPlatformChanges(currentPlatforms, newPlatforms) {
  // if different amount of platforms
  const differentAmount = currentPlatforms.length !== newPlatforms.length;
  if (differentAmount) {
    return true;
  }
  // new platform doesn't exist in current
  const newOneThere = newPlatforms.filter(newPlatform => currentPlatforms.filter(
    currentPlatform => (currentPlatform.platform === newPlatform.platform) && (currentPlatform.source === newPlatform.source)
  ).length === 0).length > 0;
  if (newOneThere) {
    return true;
  }
  // current platform doesn't exist in new
  const oldOneGone = currentPlatforms.filter(currentPlatform => newPlatforms.filter(
    newPlatform => (currentPlatform.platform === newPlatform.platform) && (currentPlatform.source === newPlatform.source)
  ).length === 0).length > 0;
  if (oldOneGone) {
    return true;
  }
  // queries different in any of same platforms?
  const oldOnesInNew = currentPlatforms.filter(currentPlatform => newPlatforms.filter(newPlatform => (currentPlatform.platform === newPlatform.platform) && (currentPlatform.source === newPlatform.source)));
  const numberOfQueriesThatChanged = oldOnesInNew.map(currentPlatform => {
    const matchingNewPlatform = newPlatforms.filter(newPlatform => (currentPlatform.platform === newPlatform.platform) && (currentPlatform.source === newPlatform.source))[0];
    // need to handle mediacloud query uniquely, because it is a synthetic platform (real data is stored at topic level)
    if ((currentPlatform.platform === PLATFORM_OPEN_WEB) && (currentPlatform.source === MEDIA_CLOUD_SOURCE)) {
      const currentCollections = currentPlatform.channel.filter(c => c.tags_id).map(c => c.tags_id).sort();
      const newCollections = matchingNewPlatform.channel.filter(c => c.tags_id).map(c => c.tags_id).sort();
      const collectionsDiffer = JSON.stringify(currentCollections) !== JSON.stringify(newCollections);
      const currentMedia = currentPlatform.channel.filter(c => c.media_id).map(c => c.media_id).sort();
      const newMedia = matchingNewPlatform.channel.filter(c => c.media_id).map(c => c.media_id).sort();
      const mediaDiffer = JSON.stringify(currentMedia) !== JSON.stringify(newMedia);
      const queriesDiffer = currentPlatform.query !== matchingNewPlatform.query;
      return (collectionsDiffer || queriesDiffer || mediaDiffer) ? 1 : 0;
    }
    // since we can't update topic seed queries, we can just check if the IDs are different here
    return (currentPlatform.topic_seed_queries_id !== matchingNewPlatform.topic_seed_queries_id) ? 1 : 0;
  }).reduce((a, b) => a + b, 0) > 0;
  if (numberOfQueriesThatChanged > 0) {
    return true;
  }
  return false;
}

/**
 * Check to see if the topic and the latest snapshot configuration have any differences. Specifically this checkes things
 * that aren't captured in platforms or subtopics.
 * @param t the whole topic, with all meta data on it
 * @param latestSnapshot The latest snapshot
 * @return boolean true if there are differences in start/end date or spidering iterations
 */
const checkForDateSpideringChanges = (t, latestSnapshot) => {
  if (latestSnapshot && latestSnapshot.seed_queries) { // new topics have no snpashots, & older snapshots don't have seed_queries on them
    const spideringChanged = t.max_iterations !== latestSnapshot.seed_queries.topic.max_iterations;
    const datesChanged = (t.start_date !== latestSnapshot.seed_queries.topic.start_date) || (t.end_date !== latestSnapshot.seed_queries.topic.end_date);
    return spideringChanged || datesChanged;
  }
  return false;
};

/**
 * Add a bunch of calculated fields to the topic so they are available for UI logic. It is smart to centralize this in
 * the reducer so we just don't need to worry at the UI level.
 * @param t the whole topic
 * @return the topic, with a bunch of stuff added
 */
export const addUsefulDetailsToTopic = (t) => {
  // 1. figure out latest state and jobs associated with the topic
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
  // brand new topics don't yet have a snapshot, or maybe the first one failed
  const latestSnapshot = (t.snapshots) ? latestSnapshotByDate(t.snapshots.list) : null;
  // 2. figure out if there are any new platforms
  // 3. figure out if topic dates or spidering config have changed
  let platformsHaveChanged = false;
  let datesOrSpideringHaveChanged = false;
  if (latestSnapshot || (t.snapshots && (t.snapshots.list.length === 0))) {
    // have to carefully handle the case of a new topic that has no previous snapshots
    platformsHaveChanged = checkForAnyPlatformChanges(t.topic_seed_queries,
      (t.snapshots && (t.snapshots.list.length > 0)) ? latestSnapshot.platform_seed_queries : []);
    datesOrSpideringHaveChanged = checkForDateSpideringChanges(t, latestSnapshot);
  }
  // return augmented state
  return {
    ...t,
    solr_seed_query: t.solr_seed_query === 'null' ? '' : t.solr_seed_query,
    latestState,
    platformsHaveChanged,
    datesOrSpideringHaveChanged,
    job_states: t.snapshots ? addVersionNumberToJobs(t.snapshots.list, t.job_states) : [],
  };
};

/**
 * Anytime the topic summary gets sent back from the server, make sure we update it here.
 */
const info = createAsyncReducer({
  action: FETCH_TOPIC_SUMMARY,
  handleSuccess: payload => ({ ...addUsefulDetailsToTopic(payload) }),
  // whenever we change somethign we return whole topic from the server and need update all this stuff
  [resolve(UPDATE_TOPIC_SEED_QUERY)]: payload => ({ ...addUsefulDetailsToTopic(payload) }),
  [resolve(UPDATE_TOPIC_SETTINGS)]: payload => ({ ...addUsefulDetailsToTopic(payload) }),
  [resolve(TOPIC_START_SPIDER)]: payload => ({ ...addUsefulDetailsToTopic(payload) }),
  [resolve(TOPIC_CREATE_SNAPSHOT)]: payload => ({ ...addUsefulDetailsToTopic(payload) }),
  [resolve(SET_TOPIC_FAVORITE)]: payload => ({ ...addUsefulDetailsToTopic(payload) }),
});

export default info;
