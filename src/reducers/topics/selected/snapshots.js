import { resolve } from 'redux-simple-promise';
import { TOPIC_FILTER_BY_SNAPSHOT, FETCH_TOPIC_SUMMARY }
  from '../../../actions/topicActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';
import { snapshotDateToMoment } from '../../../lib/dateUtil';
import { parseId } from '../../../lib/numberUtil';

export const TOPIC_SNAPSHOT_STATE_QUEUED = 'queued';
export const TOPIC_SNAPSHOT_STATE_RUNNING = 'running';
export const TOPIC_SNAPSHOT_STATE_COMPLETED = 'completed';
export const TOPIC_SNAPSHOT_STATE_ERROR = 'error';
// catch an error state that is happening but we don't know why yet!
export const TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED = 'created but not queued';

export const snapshotIsUsable = s => (s.state === TOPIC_SNAPSHOT_STATE_COMPLETED) && (s.searchable === true);

const snapshotsByDateDesc = list => list.sort((f1, f2) => {
  if (f1.snapshot_date < f2.snapshot_date) {
    return 1;
  }
  return -1;
});

const jobsByDateDesc = list => list.sort((f1, f2) => {
  if (f1.last_updated < f2.last_updated) {
    return 1;
  }
  return -1;
});

export function latestUsableSnapshot(snapshots) {
  const usableSnapshots = snapshotsByDateDesc(snapshots).filter(s => snapshotIsUsable(s));
  if (usableSnapshots.length > 0) {
    return usableSnapshots[0];
  }
  return null;
}

function getSnapshotFromListById(list, id) {
  const result = list.find(element => element.snapshots_id === id);
  return (result === undefined) ? null : result;
}

function cleanUpSnapshotList(rawList, jobList) {
  return snapshotsByDateDesc(rawList).map((s, idx) => ({
    ...s,
    job_states: jobList.filter(job => s.snapshots_id === job.snapshots_id),
    snapshotDate: snapshotDateToMoment(s.snapshot_date),
    isUsable: snapshotIsUsable(s),
    isLatest: idx === 0,
  }));
}

export const latestSnapshotByDate = (list) => {
  const orderedList = snapshotsByDateDesc(list);
  if (orderedList && orderedList.length > 0) {
    return orderedList[0];
  }
  return null;
};

const latestJobByDate = (list) => {
  const orderedList = jobsByDateDesc(list);
  if (orderedList && orderedList.length > 0) {
    return orderedList[0];
  }
  return null;
};

function isLatestVersionRunning(snapshotList, jobList) {
  if (snapshotList.length === 0) {
    return false;
  }
  const latestSnapshot = snapshotList[0];
  // check Job statuses also
  const latestJob = latestJobByDate(jobList);
  if (latestJob === null) {
    return false;
  }
  return (latestSnapshot.state === TOPIC_SNAPSHOT_STATE_RUNNING
  || latestJob.state === TOPIC_SNAPSHOT_STATE_RUNNING
  || latestSnapshot.state === TOPIC_SNAPSHOT_STATE_QUEUED
  || latestJob.state === TOPIC_SNAPSHOT_STATE_QUEUED
  || (((latestJob.state === TOPIC_SNAPSHOT_STATE_COMPLETED) || (latestSnapshot.state === TOPIC_SNAPSHOT_STATE_COMPLETED)) && (latestSnapshot.searchable === 0)));
}

const usingLatestSnapshot = (list, selectedId) => {
  const latest = latestSnapshotByDate(list);
  if (latest) {
    return selectedId === latest.snapshots_id;
  }
  return false;
};

const latestSnaphostIsUsable = (list) => {
  const latest = latestSnapshotByDate(list);
  if (latest) {
    return snapshotIsUsable(latest);
  }
  return false;
};

const snapshots = createAsyncReducer({
  initialState: {
    list: [],
    latest: null,
    usingLatest: false,
    latestUsableSnapshot: null,
    latestVersionRunning: false,
    selectedId: null,
    selected: null,
  },
  [resolve(FETCH_TOPIC_SUMMARY)]: (payload, state) => ({ // topic summary includes list of snapshots
    list: cleanUpSnapshotList(payload.snapshots.list, payload.job_states),
    latest: latestSnapshotByDate(payload.snapshots.list),
    usingLatest: usingLatestSnapshot(payload.snapshots.list, state.selectedId),
    latestIsUsable: latestSnaphostIsUsable(payload.snapshots.list),
    latestUsableSnapshot: latestUsableSnapshot(payload.snapshots.list),
    latestVersionRunning: isLatestVersionRunning(payload.snapshots.list, payload.job_states),
  }),
  [TOPIC_FILTER_BY_SNAPSHOT]: (payload, state) => ({
    selectedId: parseId(payload),
    usingLatest: usingLatestSnapshot(state.list, parseId(payload)),
    selected: getSnapshotFromListById(state.list, parseId(payload)),
  }),
});

export default snapshots;
