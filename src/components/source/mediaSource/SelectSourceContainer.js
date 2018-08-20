import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import { Helmet } from 'react-helmet';
import { getCurrentDate, oneMonthBefore } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { selectSource, fetchSourceDetails } from '../../../actions/sourceActions';
import SourceControlBar from '../controlbar/SourceControlBar';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { EditButton, ExploreButton } from '../../common/IconButton';
import SourceMgrHeaderContainer from '../SourceMgrHeaderContainer';

const localMessages = {
  editSource: { id: 'source.edit', defaultMessage: 'Modify this Source' },
  visitHomepage: { id: 'source.visit', defaultMessage: 'Visit {url}' },
  editFeeds: { id: 'source.feeds.edit', defaultMessage: 'Modify this Source\'s Feeds' },
  searchNow: { id: 'source.basicInfo.searchNow', defaultMessage: 'Search in Explorer' },
};

class SelectSourceContainer extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { sourceId, fetchData } = this.props;
    if ((nextProps.sourceId !== sourceId)) {
      fetchData(nextProps.sourceId);
    }
  }

  componentWillUnmount() {
    const { removeSourceId } = this.props;
    removeSourceId();
  }

  searchInExplorer = (evt) => {
    const { source } = this.props;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const explorerUrl = urlToExplorerQuery(source.name || source.url, '*', [source.id], [], startDate, endDate);
    evt.preventDefault();
    window.open(explorerUrl, '_blank');
  }

  render() {
    const { children, source } = this.props;
    const titleHandler = parentTitle => `${source.name} | ${parentTitle}`;
    return (
      <div className="source-container">
        <Helmet><title>{titleHandler()}</title></Helmet>
        <SourceMgrHeaderContainer />
        <SourceControlBar>
          <a href="search-in-explorer" onClick={this.searchInExplorer} >
            <ExploreButton color="primary" useBackgroundColor />
            <FormattedMessage {...localMessages.searchNow} />
          </a>
          <a href={source.url}>
            <ExploreButton />
            <FormattedMessage {...localMessages.visitHomepage} values={{ url: source.url }} />
          </a>
          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
            <Link to={`/sources/${source.media_id}/edit`} >
              <EditButton />
              <FormattedMessage {...localMessages.editSource} />
            </Link>
            <Link to={`/sources/${source.media_id}/feeds`} >
              <EditButton />
              <FormattedMessage {...localMessages.editFeeds} />
            </Link>
          </Permissioned>
        </SourceControlBar>
        <Grid className="details source-details">
          {children}
        </Grid>
      </div>
    );
  }

}

SelectSourceContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  removeSourceId: PropTypes.func.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,       // params from router
  sourceId: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  source: PropTypes.object,
};

SelectSourceContainer.contextTypes = {
  store: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  fetchStatus: state.sources.sources.selected.sourceDetails.fetchStatus,
  source: state.sources.sources.selected.sourceDetails,
});


const mapDispatchToProps = (dispatch, ownProps) => ({
  removeSourceId: () => {
    dispatch(selectSource(null));
  },
  fetchData: (sourceId) => {
    dispatch(selectSource(sourceId));
    dispatch(fetchSourceDetails(sourceId));
  },
  asyncFetch: () => {
    dispatch(selectSource(ownProps.params.sourceId));
    dispatch(fetchSourceDetails(ownProps.params.sourceId));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncFetch(
        SelectSourceContainer
      )
    )
  );
