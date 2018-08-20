import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import QueryTopEntitiesPeopleResultsContainer from './QueryTopEntitiesPeopleResultsContainer';
import QueryTopEntitiesOrgsResultsContainer from './QueryTopEntitiesOrgsResultsContainer';
import QueryAttentionOverTimeResultsContainer from './QueryAttentionOverTimeResultsContainer';
import QueryAttentionOverTimeDrillDownContainer from './drilldowns/QueryAttentionOverTimeDrillDownContainer';
import QueryWordComparisonResultsContainer from './QueryWordComparisonResultsContainer';
import WordInContextDrillDownContainer from './drilldowns/WordInContextDrillDownContainer';
import SelectedStoryDrillDownContainer from './drilldowns/SelectedStoryDrillDownContainer';
import QuerySampleStoriesResultsContainer from './QuerySampleStoriesResultsContainer';
import QueryTotalAttentionResultsContainer from './QueryTotalAttentionResultsContainer';
import QueryGeoResultsContainer from './QueryGeoResultsContainer';
import QueryWordsResultsContainer from './QueryWordsResultsContainer';
import QueryWordSpaceResultsContainer from './QueryWordSpaceResultsContainer';
import TabSelector from '../../common/TabSelector';
import ErrorBoundary from '../../common/ErrorBoundary';
import QueryThemesResultsContainer from './QueryThemesResultsContainer';
import { updateQuery } from '../../../actions/explorerActions';
import messages from '../../../resources/messages';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';

class QueryResultsContainer extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  render() {
    const { queries, isLoggedIn, lastSearchTime, handleQueryModificationRequested } = this.props;
    const { formatMessage } = this.props.intl;
    const attentionSection = (
      <Row>
        <Col lg={12} xs={12}>
          <QueryAttentionOverTimeResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
          />
        </Col>
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <Col lg={12} xs={12}>
            <QueryAttentionOverTimeDrillDownContainer
              lastSearchTime={lastSearchTime}
              queries={queries}
              isLoggedIn={isLoggedIn}
            />
          </Col>
        </Permissioned>
        <Col lg={12} xs={12}>
          <QueryTotalAttentionResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
          />
        </Col>
        <Col lg={12} xs={12}>
          <QueryThemesResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
          />
        </Col>
        <Col lg={12} xs={12}>
          <QuerySampleStoriesResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
          />
        </Col>
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <Col lg={12} xs={12}>
            <SelectedStoryDrillDownContainer
              lastSearchTime={lastSearchTime}
              queries={queries}
              isLoggedIn={isLoggedIn}
            />
          </Col>
        </Permissioned>
      </Row>
    );
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
        <Col lg={12} xs={12}>
          <QueryWordSpaceResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
            onQueryModificationRequested={handleQueryModificationRequested}
          />
        </Col>
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
    const peoplePlacesSection = (
      <Row>
        <Col lg={12} xs={12}>
          <QueryTopEntitiesPeopleResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
            onQueryModificationRequested={handleQueryModificationRequested}
          />
        </Col>
        <Col lg={12} xs={12}>
          <QueryTopEntitiesOrgsResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
            onQueryModificationRequested={handleQueryModificationRequested}
          />
        </Col>
        <Col lg={12} xs={12}>
          <QueryGeoResultsContainer
            lastSearchTime={lastSearchTime}
            queries={queries}
            isLoggedIn={isLoggedIn}
            onQueryModificationRequested={handleQueryModificationRequested}
          />
        </Col>
      </Row>
    );
    let viewContent = attentionSection;
    switch (this.state.selectedViewIndex) {
      case 0:
        viewContent = attentionSection;
        break;
      case 1:
        viewContent = languageSection;
        break;
      case 2:
        viewContent = peoplePlacesSection;
        break;
      default:
        break;
    }

  // const unDeletedQueries = queries.filter(q => q.deleted !== true);
    return (
      <div className="query-results-container">
        <Grid>
          <Row>
            <TabSelector
              tabLabels={[
                formatMessage(messages.attention),
                formatMessage(messages.language),
                formatMessage(messages.representation),
              ]}
              onViewSelected={index => this.setState({ selectedViewIndex: index })}
            />
          </Row>
        </Grid>
        <div className="tabbed-content-wrapper">
          <Grid>
            <Row>
              <ErrorBoundary>
                {viewContent}
              </ErrorBoundary>
            </Row>
          </Grid>
        </div>
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
