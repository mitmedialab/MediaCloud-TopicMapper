import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import TabSandCSearchResultsContainer from './TabSandCSearchResultsContainer';

const localMessages = {
  title: { id: 'system.mediaPicker.collections.title', defaultMessage: 'Collections matching "{name}"' },
  hintText: { id: 'system.mediaPicker.collections.hint', defaultMessage: 'Search collections by name' },
  noResults: { id: 'system.mediaPicker.collections.noResults', defaultMessage: 'No results. Try searching for issues like online news, health, blogs, conservative to see if we have collections made up of those types of sources.' },
};


class AllMediaSearchResultsContainer extends React.Component {
  updateMediaQuery(values) {
    const { updateMediaQuerySelection, selectedMediaQueryType } = this.props;
    const updatedQueryObj = Object.assign({}, values, { type: selectedMediaQueryType });
    updateMediaQuerySelection(updatedQueryObj);
  }

  render() {
    const { selectedMediaQueryType, selectedMediaQueryKeyword, whichTagSet, collectionResults, sourceResults, onToggleSelected, fetchStatus } = this.props;
    const queryResults = {
      collections: collectionResults.list,
      sources: sourceResults.list,
    };
    return (
      <div>
        <TabSandCSearchResultsContainer
          fetchStatus={fetchStatus}
          onToggleSelected={onToggleSelected}
          selectedMediaQueryType={selectedMediaQueryType}
          queryResults={queryResults}
          whichTagSet={whichTagSet}
          initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword } }}
          onSearch={val => this.updateMediaQuery(val)}
          hintTextMsg={localMessages.hintText}
        />
      </div>
    );
  }
}

AllMediaSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  whichTagSet: PropTypes.array,
  // from state
  updateMediaQuerySelection: PropTypes.func,
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  collectionResults: PropTypes.object,
  sourceResults: PropTypes.object,
  fetchStatus: PropTypes.string,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.collectionQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  collectionResults: state.system.mediaPicker.collectionQueryResults,
  sourceResults: state.system.mediaPicker.sourceQueryResults,
});

export default
injectIntl(
  connect(mapStateToProps)(
    AllMediaSearchResultsContainer
  )
);
