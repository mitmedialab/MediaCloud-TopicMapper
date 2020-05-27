import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import MediaTable from './MediaTable';
import { isUrlSharingFocalSet } from '../../lib/topicVersionUtil';

/**
 * Simple wrapper around MediaTable to pull in some stuff from state (so the components that use
 * MediaTable don't need to pass it in). This just passses along all the other props so maintenance
 * cost is low.
 */
const MediaTableContainer = (props) => (
  <MediaTable {...props} />
);

MediaTableContainer.propTypes = {
  // from state
  showTweetCounts: PropTypes.bool.isRequired,
  topicId: PropTypes.number.isRequired,
  usingUrlSharingSubtopic: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  // show tweet counts if the user has a crimson hexagon id on the topic (to deptecate?)
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
  // only show the author count, and hide inlinks/outlinks, if the user is in a "url sharing" focus
  usingUrlSharingSubtopic: (state.topics.selected.filters.focusId !== null) && isUrlSharingFocalSet(state.topics.selected.timespans.selected.focal_set),
});

export default (
  connect(mapStateToProps)(
    MediaTableContainer
  )
);
