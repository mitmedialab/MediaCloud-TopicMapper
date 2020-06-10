import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { connect } from 'react-redux';
import AppButton from '../../AppButton';
import CollectionResultsTable from './CollectionResultsTable';
import MediaPickerSearchForm from '../MediaPickerSearchForm';
import { selectMediaPickerQueryArgs, fetchMediaPickerCollections, resetMediaPickerCollections } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import LoadingSpinner from '../../LoadingSpinner';
import { notEmptyString } from '../../../../lib/formValidators';
import { TAG_SET_MC_ID } from '../../../../lib/tagUtil';
import messages from '../../../../resources/messages';

const NO_MORE_RESULTS = -1;

const localMessages = {
  title: { id: 'system.mediaPicker.collections.title', defaultMessage: '{numResults} Collections matching "{name}"' },
  hintText: { id: 'system.mediaPicker.collections.hint', defaultMessage: 'Search for collections by name' },
  noResults: { id: 'system.mediaPicker.collections.noResults', defaultMessage: 'No results. Try searching for issues like online news, health, blogs, conservative to see if we have collections made up of those types of sources.' },
};


class CollectionSearchResultsContainer extends React.Component {
  UNSAFE_componentWillMount() {
    this.correlateSelection(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMedia !== this.props.selectedMedia
      // if the results have changed from a keyword entry, we need to update the UI
      || (nextProps.collectionResults && nextProps.collectionResults.lastFetchSuccess !== this.props.collectionResults.lastFetchSuccess)) {
      this.correlateSelection(nextProps);
    }
  }

  correlateSelection(whichProps) {
    const whichList = whichProps.collectionResults.list;

    // if selected media has changed, update current results
    if (whichProps.selectedMedia && whichProps.selectedMedia.length > 0
      // we can't be sure we have received results yet
      && whichList && whichList.length > 0) {
      // sync up selectedMedia and push to result sets.
      whichList.map((m) => {
        const mediaIndex = whichProps.selectedMedia.findIndex(q => q.id === m.id);
        if (mediaIndex < 0) {
          this.props.handleMediaConcurrency(m, false);
        } else if (mediaIndex >= 0) {
          this.props.handleMediaConcurrency(m, true);
        }
        return m;
      });
    }
    return 0;
  }

  render() {
    const { selectedMediaQueryKeyword, selectedMediaQueryType, initCollections, collectionResults, updateMediaQuerySelection, onToggleSelected, fetchStatus, hintTextMsg, viewOnly, pageThroughCollections, links } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    let getMoreResultsContent = null;
    if (fetchStatus === FETCH_ONGOING) {
      // we have to do this here to show a loading spinner when first searching (and featured collections are showing)
      content = <LoadingSpinner />;
    } else if (collectionResults.list && selectedMediaQueryKeyword) {
      content = (
        <CollectionResultsTable
          title={formatMessage(localMessages.title, { name: selectedMediaQueryKeyword, numResults: collectionResults.list.length })}
          collections={collectionResults.list}
          onToggleSelected={onToggleSelected}
          viewOnly={viewOnly}
        />
      );
      getMoreResultsContent = (links.next > NO_MORE_RESULTS && (
        <Row>
          <Col lg={12}>
            <AppButton
              className="select-media-cancel-button"
              label={formatMessage(messages.getMoreResults)}
              onClick={val => pageThroughCollections(val)}
              type="submit"
            />
          </Col>
        </Row>
      ));
    } else if (initCollections) {
      content = initCollections;
    } else {
      content = <FormattedMessage {...localMessages.noResults} />;
    }
    return (
      <div>
        <MediaPickerSearchForm
          initValues={{ mediaKeyword: selectedMediaQueryKeyword }}
          onSearch={val => updateMediaQuerySelection({ ...val, type: selectedMediaQueryType })}
          hintText={formatMessage(hintTextMsg || localMessages.hintText)}
        />
        {getMoreResultsContent}
        {content}
        {getMoreResultsContent}
      </div>
    );
  }
}


CollectionSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  handleMediaConcurrency: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  selectedMedia: PropTypes.array,
  whichTagSet: PropTypes.array,
  hintTextMsg: PropTypes.object,
  // from hoc
  previousButton: PropTypes.node,
  nextButton: PropTypes.node,
  links: PropTypes.object,
  // from state
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  collectionResults: PropTypes.object,
  initCollections: PropTypes.object,
  updateMediaQuerySelection: PropTypes.func.isRequired,
  viewOnly: PropTypes.bool,
  pageThroughCollections: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.collectionQueryResults.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  collectionResults: state.system.mediaPicker.collectionQueryResults,
  links: state.system.mediaPicker.collectionQueryResults.linkId,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateMediaQuerySelection: (values) => {
    if (values && notEmptyString(values.mediaKeyword)) {
      dispatch(resetMediaPickerCollections());
      dispatch(selectMediaPickerQueryArgs(values));
      dispatch(fetchMediaPickerCollections({ media_keyword: (values.mediaKeyword || '*'), which_set: ownProps.whichTagSet || TAG_SET_MC_ID, type: values.type, linkId: values.linkId }));
    }
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps,
    ...dispatchProps,
    ...ownProps,
    pageThroughCollections: () => {
      if (stateProps.links !== undefined) {
        dispatchProps.updateMediaQuerySelection({ mediaKeyword: stateProps.selectedMediaQueryKeyword, which_set: ownProps.whichTagSet || TAG_SET_MC_ID, type: stateProps.selectedMediaQueryType, linkId: stateProps.links.next });
      } else {
        dispatchProps.updateMediaQuerySelection({ mediaKeyword: stateProps.selectedMediaQueryKeyword, which_set: ownProps.whichTagSet || TAG_SET_MC_ID, type: stateProps.selectedMediaQueryType, linkId: 0 });
      }
    },
  };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    CollectionSearchResultsContainer
  )
);
