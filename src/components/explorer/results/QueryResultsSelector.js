import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import TabSelector from '../../common/TabSelector';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { queryChangedEnoughToUpdate /* , ensureSafeResults */, ensureSafeTabIndex, ensureSafeSortedQueries,
  formatQueryForServer } from '../../../lib/explorerUtil';


function withQueryResults(fetchResults, extraPropertiesForServer) {
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
      const { queries } = props;
      // this should trigger when the user clicks the Search button or changes the URL
      // for n queries, run the dispatch with each parsed query
      queries.map((q) => {
        let infoToQuery = formatQueryForServer(q);
        if (extraPropertiesForServer) {
          const extraDataforServer = extraPropertiesForServer.reduce((map, item) => ({ ...map, [item]: props[item] }), {});
          infoToQuery = { ...infoToQuery, ...extraDataforServer };
        }
        return dispatch(fetchResults(infoToQuery));
      });
    };

    // don't force the child to use an async fetcher if it doesn't need one
    let fetcher = () => null;
    if (fetchResults) {
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
