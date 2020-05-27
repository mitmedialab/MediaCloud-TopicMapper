import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../../FilteredAsyncDataContainer';
import { fetchTopicTimespanFiles } from '../../../../actions/topicActions';
import DownloadTimespanFiles from './DownloadTimespanFiles';
import { isUrlSharingFocalSet } from '../../../../lib/topicVersionUtil';

const DownloadTimespanFilesContainer = ({ filters, files, usingUrlSharingSubtopic }) => (
  <DownloadTimespanFiles filters={filters} files={files} usingUrlSharingSubtopic={usingUrlSharingSubtopic} />
);

DownloadTimespanFilesContainer.propTypes = {
  // from parent
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  files: PropTypes.array,
  usingUrlSharingSubtopic: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.summary.timespanFiles.fetchStatus,
  files: state.topics.selected.summary.timespanFiles.timespan_files,
  usingUrlSharingSubtopic: (state.topics.selected.filters.focusId !== null) && isUrlSharingFocalSet(state.topics.selected.timespans.selected.focal_set),
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicTimespanFiles(props.topicId, props.filters));
};

export default
connect(mapStateToProps)(
  withFilteredAsyncData(fetchAsyncData)(
    DownloadTimespanFilesContainer
  )
);
