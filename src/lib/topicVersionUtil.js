import { snapshotIsUsable } from '../reducers/topics/selected/snapshots';
import { nullOrUndefined } from './formValidators';

export function getTopicVersionInfo(topicInfo) {
  // get latest version and status
  const snapshots = topicInfo.snapshots.list;

  const lastReadySnapshot = snapshots.filter(s => snapshotIsUsable(s)).sort((f1, f2) => {
    if (f1.snapshot_date < f2.snapshot_date) {
      return 1;
    }
    return -1;
  })[0];

  return ({
    versionList: snapshots,
    lastReadySnapshot,
  });
}

export function getCurrentVersionFromSnapshot(topicInfo, currentSnapshotId) {
  // get latest version and status
  const snapshots = topicInfo.snapshots.list;
  if (!currentSnapshotId || nullOrUndefined(currentSnapshotId) || snapshots.length === 0) return topicInfo.latestVersion;
  const currentVersion = snapshots.find(s => s.snapshots_id === parseInt(currentSnapshotId, 10)).note;

  return parseInt(currentVersion, 10);
}

// shouldn't need this because we calc the list length in python and put in the topic JSON object
export function getTotalVersions(topicInfo) {
  return topicInfo.snapshots.list.length;
}

export const isUrlSharingFocalSet = (focalSet) => (focalSet.name === 'URL Sharing');

export const hasAUrlSharingFocalSet = (focalSets) => {
  const urlSharingFocalSets = focalSets.map(fs => isUrlSharingFocalSet(fs));
  const hasOne = urlSharingFocalSets.reduce((combined, current) => combined || current, false);
  return hasOne;
};
