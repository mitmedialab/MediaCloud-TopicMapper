import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchRecentNews } from '../../../actions/systemActions';
import composeAsyncContainer from '../../common/AsyncContainer';
import RecentNewsMenu from './RecentNewsMenu';

const MAX_ITEMS = 8;

const RecentNewsMenuContainer = (props) => {
  const { recentNews } = props;
  const latestRelease = recentNews[0];
  const newsItems = latestRelease.notes;
  const changeDate = moment(latestRelease.date, 'YYYY-MM-DD').fromNow();
  return (
    <RecentNewsMenu
      newsItems={newsItems.slice(0, MAX_ITEMS)}
      subTitle={changeDate}
    />
  );
};

RecentNewsMenuContainer.propTypes = {
  // from parent
  // from state
  recentNews: PropTypes.array,
  // from compositional chain
};

const mapStateToProps = state => ({
  fetchStatus: state.system.recentNews.fetchStatus,
  recentNews: state.system.recentNews.releases,
});

const mapDispatchToProps = dispatch => ({
  asyncFetch: () => {
    dispatch(fetchRecentNews());
  },
});

export default
  connect(mapStateToProps, mapDispatchToProps)(
    composeAsyncContainer(
      RecentNewsMenuContainer
    )
  );
