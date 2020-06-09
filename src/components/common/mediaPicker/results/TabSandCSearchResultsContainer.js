import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row } from 'react-flexbox-grid/lib';
import CollectionSearchResultsContainer from './CollectionSearchResultsContainer';
import SourceSearchResultsContainer from './SourceSearchResultsContainer';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import LoadingSpinner from '../../LoadingSpinner';
import TabSelector from '../../TabSelector';

const localMessages = {
  collections: { id: 'system.mediaPicker.collections', defaultMessage: 'Search Collections' },
  sources: { id: 'system.mediaPicker.sources', defaultMessage: 'Search Sources' },
};

const VIEW_COLLECTIONS = 1;
const VIEW_SOURCES = 0;

class TabSandCSearchResultsContainer extends React.Component {
  state = {
    selectedViewIndex: VIEW_SOURCES,
  };

  render() {
    const { queryResults, onToggleSelected, handleMediaConcurrency, updateMediaQuerySelection, fetchStatus, whichTagSet, selectedMediaQueryKeyword, viewOnly } = this.props;
    const { formatMessage } = this.props.intl;
    const tabs = (
      <div className="media-picker-results-container">
        <Grid>
          <Row>
            <TabSelector
              tabLabels={[
                formatMessage(localMessages.sources),
                formatMessage(localMessages.collections),
              ]}
              onViewSelected={index => this.setState({ selectedViewIndex: index })}
            />
          </Row>
        </Grid>
      </div>
    );
    let tabContent = null;
    if (fetchStatus === FETCH_ONGOING) {
      // we have to do this here to show a loading spinner when first searching (and featured collections are showing)
      tabContent = <LoadingSpinner />;
    } else if ((this.state.selectedViewIndex === VIEW_COLLECTIONS)
      && (queryResults && (queryResults.collections || queryResults.collections))) {
      tabContent = (
        <div className="media-picker-tabbed-content-wrapper">
          <CollectionSearchResultsContainer
            fetchStatus={fetchStatus}
            onToggleSelected={onToggleSelected}
            whichTagSet={whichTagSet}
            initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword, tags: {} } }}
            hintTextMsg={localMessages.hintText}
            handleMediaConcurrency={handleMediaConcurrency}
            viewOnly={viewOnly}
          />
        </div>
      );
    } else if ((this.state.selectedViewIndex === VIEW_SOURCES)
      && (queryResults && (queryResults.sources))) {
      tabContent = (
        <div className="media-picker-tabbed-content-wrapper">
          <SourceSearchResultsContainer
            initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword, tags: {} } }} // empty
            onToggleSelected={onToggleSelected}
            handleMediaConcurrency={handleMediaConcurrency}
            updateMediaQuerySelection={updateMediaQuerySelection}
            viewOnly={viewOnly}
          />
        </div>
      );
    } else {
      tabContent = <FormattedMessage {...localMessages.noResults} />;
    }
    return (
      <div>
        {tabs}
        {tabContent}
      </div>
    );
  }
}


TabSandCSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  handleMediaConcurrency: PropTypes.func.isRequired,
  updateMediaQuerySelection: PropTypes.func.isRequired,
  whichTagSet: PropTypes.array,
  hintTextMsg: PropTypes.object,
  onSearch: PropTypes.func.isRequired,
  // from state
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  queryResults: PropTypes.object,
  initItems: PropTypes.object,
  fetchStatus: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]).isRequired,
  viewOnly: PropTypes.bool,
};

export default
injectIntl(
  connect()(
    TabSandCSearchResultsContainer
  )
);
