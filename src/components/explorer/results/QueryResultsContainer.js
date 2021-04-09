import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import QueryWordComparisonResultsContainer from './QueryWordComparisonResultsContainer';
import WordInContextDrillDownContainer from './drilldowns/WordInContextDrillDownContainer';
import QueryWordsResultsContainer from './QueryWordsResultsContainer';
import ErrorBoundary from '../../common/ErrorBoundary';
import { updateQuery } from '../../../actions/explorerActions';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';

class QueryResultsContainer extends React.Component {
  render() {
    const { queries, isLoggedIn, lastSearchTime, handleQueryModificationRequested } = this.props;

    const languageSection = (
      <Row>
        <Col lg={12} xs={12}>
          <QueryWordsResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
            onQueryModificationRequested={handleQueryModificationRequested}
          />
        </Col>
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <Col lg={12} xs={12}>
            <WordInContextDrillDownContainer
              lastSearchTime={lastSearchTime}
              queries={queries}
              isLoggedIn={isLoggedIn}
              onQueryModificationRequested={handleQueryModificationRequested}
            />
          </Col>
        </Permissioned>
        { (queries.length > 1) && (
          <Col lg={12} xs={12}>
            <QueryWordComparisonResultsContainer
              lastSearchTime={lastSearchTime}
              queries={queries}
              isLoggedIn={isLoggedIn}
              onQueryModificationRequested={handleQueryModificationRequested}
            />
          </Col>
        )}
      </Row>
    );

    const viewContent = languageSection;

    return (
      <div className="query-results-container">
        <Grid>
          <Row>
            <ErrorBoundary>
              {viewContent}
            </ErrorBoundary>
          </Row>
        </Grid>
      </div>
    );
  }
}

QueryResultsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  // from parent
  queries: PropTypes.array,
  lastSearchTime: PropTypes.number,
  // from state
  isLoggedIn: PropTypes.bool.isRequired,
  // from dipatch
  handleQueryModificationRequested: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  // call this to add a clause to every query when something is clicked on
  handleQueryModificationRequested: (queryClauseToAdd) => {
    ownProps.queries.map((qry) => {
      const updatedQry = {
        ...qry,
        q: `(${qry.q}) AND (${queryClauseToAdd})`,
      };
      return dispatch(updateQuery({ query: updatedQry, fieldName: 'q' }));
    });
    ownProps.onSearch();
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    QueryResultsContainer
  )
);
