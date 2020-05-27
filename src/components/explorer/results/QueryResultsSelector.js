import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import TabSelector from '../../common/TabSelector';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { queryChangedEnoughToUpdate /* , ensureSafeResults */, ensureSafeTabIndex, ensureSafeSortedQueries,
  formatQueryForServer, formatDemoQueryForServer } from '../../../lib/explorerUtil';


function withQueryResults(resetResults, fetchResults, fetchDemoResults, extraPropertiesForServer) {
  const innerWithQueryResults = (ChildComponent) => {
    class QueryResultsSelector extends React.Component {
      state = {
        selectedQueryTabIndex: null,
        selectedQueryUid: null,
      };

      UNSAFE_componentWillMount = () => {
        // make sure that the tabIndex and UID are set before rendering the first time
        if (this.state.selectedQueryTabIndex === null) {
          this.getUidFromTabSelection(0);
        }
      }

      shouldComponentUpdate(nextProps) {
        const { results, queries, shouldUpdate } = this.props;
        // ask the child if internal repainting is needed
        const defaultShouldUpdate = queryChangedEnoughToUpdate(queries, nextProps.queries, results, nextProps.results);
        const tabIndexNotValid = (nextProps.queries.length - 1) < this.state.selectedQueryTabIndex;
        if (tabIndexNotValid) {
          this.setState({ selectedQueryTabIndex: nextProps.queries.length - 1 });
        }
        const childShouldUpdate = (shouldUpdate && shouldUpdate(nextProps));
        return childShouldUpdate || defaultShouldUpdate;
      }

      getUidFromTabSelection(idx) {
        const { queries } = this.props;
        const selectedQuery = queries.sort((a, b) => a.sortPosition - b.sortPosition)[idx];
        this.setState({ selectedQueryTabIndex: idx, selectedQueryUid: selectedQuery.uid });
        this.forceUpdate();
      }

      render() {
        const { queries /* , results */ } = this.props;
        // remove deleted stuff and sort queries and results correctly before sending down to child
        const sortedSafeQueries = ensureSafeSortedQueries(queries);
        // const safeResults = ensureSafeResults(sortedSafeQueries, results);
        const safeIndex = ensureSafeTabIndex(sortedSafeQueries, this.state.selectedQueryTabIndex);
        const tabSelector = <TabSelector onViewSelected={idx => this.getUidFromTabSelection(idx)} tabLabels={sortedSafeQueries} />;
        return (
          <div className="query-results-selector">
            <ChildComponent
              {...this.props}
              safeSortedQueries={sortedSafeQueries}
              selectedTabIndex={safeIndex}
              selectedQueryUid={this.state.selectedQueryUid}
              selectedQuery={sortedSafeQueries[safeIndex]}

              tabSelector={tabSelector}
            />
          </div>
        );
      }
    }

    QueryResultsSelector.propTypes = {
      intl: PropTypes.object.isRequired,
      location: PropTypes.object,
      // from store
      isLoggedIn: PropTypes.bool.isRequired,
      fetchStatus: PropTypes.string.isRequired,
      results: PropTypes.object,
      queries: PropTypes.array,
      lastSearchTime: PropTypes.number,
      // from children
      shouldUpdate: PropTypes.func,
      internalItemSelected: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.number,
      ]),
    };

    const fetchAsyncQueryResultsData = (dispatch, props) => {
      const { isLoggedIn, queries } = props;
      // this should trigger when the user clicks the Search button or changes the URL
      // for n queries, run the dispatch with each parsed query
      if (Array.isArray(resetResults)) {
        resetResults.map(reset => dispatch(reset()));
      } else {
        dispatch(resetResults()); // necessary if a query deletion has occurred
      }
      if (isLoggedIn) {
        queries.map((q) => {
          let infoToQuery = formatQueryForServer(q);
          if (extraPropertiesForServer) {
            const extraDataforServer = extraPropertiesForServer.reduce((map, item) => ({ ...map, [item]: props[item] }), {});
            infoToQuery = { ...infoToQuery, ...extraDataforServer };
          }
          return dispatch(fetchResults(infoToQuery));
        });
      } else if (queries) { // else assume DEMO mode, but assume the queries have been loaded
        queries.map((q, index) => {
          let demoInfo = formatDemoQueryForServer(q, index);
          if (extraPropertiesForServer) {
            const extraDataforServer = extraPropertiesForServer.reduce((map, item) => ({ ...map, [item]: props[item] }), {});
            demoInfo = { ...demoInfo, ...extraDataforServer };
          }
          return dispatch(fetchDemoResults(demoInfo));
        });
      }
    };

    // don't force the child to use an async fetcher if it doesn't need one
    let fetcher = () => null;
    if (resetResults && fetchResults && fetchDemoResults) {
      fetcher = fetchAsyncQueryResultsData;
    }

    let propertiesToWatch = ['lastSearchTime'];
    if (extraPropertiesForServer) {
      propertiesToWatch = [...propertiesToWatch, ...extraPropertiesForServer];
    }

    return injectIntl(
      withAsyncData(fetcher, propertiesToWatch)(
        QueryResultsSelector
      )
    );
  };

  return innerWithQueryResults;
}

export default withQueryResults;
