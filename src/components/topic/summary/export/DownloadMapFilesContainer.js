import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../../FilteredAsyncDataContainer';
import { fetchTopicMapFiles } from '../../../../actions/topicActions';
import DownloadMapFiles from './DownloadMapFiles';

const DownloadMapFilesContainer = ({ filters, files }) => (
  <DownloadMapFiles filters={filters} files={files} />
);

DownloadMapFilesContainer.propTypes = {
  // from parent
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  files: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.summary.mapFiles.fetchStatus,
  files: state.topics.selected.summary.mapFiles.timespan_maps,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicMapFiles(props.topicId, props.filters));
};

export default
connect(mapStateToProps)(
  withFilteredAsyncData(fetchAsyncData)(
    DownloadMapFilesContainer
  )
);
