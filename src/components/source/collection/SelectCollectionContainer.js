import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { Grid } from 'react-flexbox-grid/lib';
import { Helmet } from 'react-helmet';
import { selectCollection, fetchCollectionDetails } from '../../../actions/sourceActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import SourceControlBar from '../controlbar/SourceControlBar';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { EditButton, ExploreButton } from '../../common/IconButton';
import SourceMgrHeaderContainer from '../SourceMgrHeaderContainer';
import { getCurrentDate, oneMonthBefore } from '../../../lib/dateUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';

const localMessages = {
  searchNow: { id: 'collection.details.searchNow', defaultMessage: 'Search in Explorer' },
  editCollection: { id: 'collection.edit', defaultMessage: 'Modify this Collection' },
  contentHistory: { id: 'collection.contentHistory', defaultMessage: 'Content History' },
  manageSources: { id: 'collection.manageSources', defaultMessage: 'Review Sources' },
};

class SelectCollectionContainer extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { collectionId, fetchData } = this.props;
    if ((nextProps.collectionId !== collectionId)) {
      fetchData(nextProps.collectionId);
    }
  }

  componentWillUnmount() {
    const { removeCollectionId } = this.props;
    removeCollectionId();
  }

  searchInExplorer = (evt) => {
    const { collection } = this.props;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const explorerUrl = urlToExplorerQuery(collection.label || collection.tag, '*', [], [collection.id], startDate, endDate);
    evt.preventDefault();
    window.open(explorerUrl, '_blank');
  }

  render() {
    const { children, collection } = this.props;
    const titleHandler = parentTitle => `${collection.label} | ${parentTitle}`;
    return (
      <div className="collection-container">
        <Helmet><title>{titleHandler()}</title></Helmet>
        <SourceMgrHeaderContainer />
        <SourceControlBar>
          <a href="search-in-explorer" onClick={this.searchInExplorer} >
            <ExploreButton color="primary" useBackgroundColor />
            <FormattedMessage {...localMessages.searchNow} />
          </a>
          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
            <Link to={`/collections/${collection.tags_id}/edit`} >
              <EditButton color="primary" useBackgroundColor />
              <FormattedMessage {...localMessages.editCollection} />
            </Link>
            <Link to={`/collections/${collection.tags_id}/manage-source-list`} >
              <ExploreButton color="primary" />
              <FormattedMessage {...localMessages.manageSources} />
            </Link>
            <Link to={`/collections/${collection.tags_id}/content-history`} >
              <ExploreButton color="primary" />
              <FormattedMessage {...localMessages.contentHistory} />
            </Link>
          </Permissioned>
        </SourceControlBar>
        <Grid className="details collection-details">
          {children}
        </Grid>
      </div>
    );
  }

}

SelectCollectionContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  removeCollectionId: PropTypes.func.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,       // params from router
  collectionId: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  collection: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  collectionId: parseInt(ownProps.params.collectionId, 10),
  fetchStatus: state.sources.collections.selected.collectionDetails.fetchStatus,
  collection: state.sources.collections.selected.collectionDetails.object,
});


const mapDispatchToProps = (dispatch, ownProps) => ({
  removeCollectionId: () => {
    dispatch(selectCollection(null));
  },
  fetchData: (collectionId) => {
    dispatch(selectCollection(collectionId));
    dispatch(fetchCollectionDetails(collectionId));
  },
  asyncFetch: () => {
    dispatch(selectCollection(ownProps.params.collectionId));
    dispatch(fetchCollectionDetails(ownProps.params.collectionId));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncFetch(
        SelectCollectionContainer
      )
    )
  );
