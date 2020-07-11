import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import { getCurrentDate, oneMonthBefore } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { selectSource, fetchSourceDetails } from '../../../actions/sourceActions';
import SourceControlBar from '../controlbar/SourceControlBar';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { EditButton, ExploreButton } from '../../common/IconButton';
import SourceMgrHeaderContainer from '../SourceMgrHeaderContainer';
import PageTitle from '../../common/PageTitle';

const localMessages = {
  title: { id: 'source.title', defaultMessage: '{name} | Source Summary | Media Cloud' },
  editSource: { id: 'source.edit', defaultMessage: 'Modify this Source' },
  visitHomepage: { id: 'source.visit', defaultMessage: 'Visit {url}' },
  editFeeds: { id: 'source.feeds.edit', defaultMessage: 'Modify this Source\'s Feeds' },
  searchNow: { id: 'source.basicInfo.searchNow', defaultMessage: 'Search in Explorer' },
};

class SelectSourceContainer extends React.Component {
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
    return (
      <div className="source-container">
        <PageTitle value={source.name} />
        <SourceMgrHeaderContainer />
        <SourceControlBar>
          <a href="search-in-explorer" onClick={this.searchInExplorer}>
            <ExploreButton useBackgroundColor />
            <FormattedMessage {...localMessages.searchNow} />
          </a>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            <ExploreButton />
            <FormattedMessage {...localMessages.visitHomepage} values={{ url: source.url }} />
          </a>
          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
            <Link to={`/sources/${source.media_id}/edit`}>
              <EditButton />
              <FormattedMessage {...localMessages.editSource} />
            </Link>
            <Link to={`/sources/${source.media_id}/feeds`}>
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
  removeSourceId: PropTypes.func.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  sourceId: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  source: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  fetchStatus: state.sources.sources.selected.sourceDetails.fetchStatus,
  source: state.sources.sources.selected.sourceDetails,
});


const mapDispatchToProps = dispatch => ({
  removeSourceId: () => {
    dispatch(selectSource(null));
  },
});

const fetchAsyncData = (dispatch, { sourceId }) => {
  dispatch(selectSource(sourceId));
  dispatch(fetchSourceDetails(sourceId));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['sourceId'])(
      SelectSourceContainer
    )
  )
);
