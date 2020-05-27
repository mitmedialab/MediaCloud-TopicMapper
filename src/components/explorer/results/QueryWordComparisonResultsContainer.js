import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withQueryResults from './QueryResultsSelector';
import { selectComparativeWordField, updateQuery } from '../../../actions/explorerActions';
import { getUidIndex } from '../../../lib/explorerUtil';
import { getBrandDarkColor } from '../../../styles/colors';
import ComparativeOrderedWordCloud from '../../vis/ComparativeOrderedWordCloud';
import OrderedWordCloud from '../../vis/OrderedWordCloud';
import WordSelectWrapper, { LEFT, RIGHT } from './WordSelectWrapper';

const localMessages = {
  title: { id: 'explorer.comparativeWords.title', defaultMessage: 'Compare Top Words' },
  intro: { id: 'explorer.comparativeWords.intro', defaultMessage: ' These words are the most used in each query. They are sized according to total count across all words in ...' },
  centerTitle: { id: 'explorer.comparativeWords.center', defaultMessage: 'Word used in both' },
  sideTitle: { id: 'explorer.comparativeWords.right', defaultMessage: 'Words unique to {name} in the top 100 words in the sampled stories' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } word count comparison CSV' },
};

class QueryWordComparisonResultsContainer extends React.Component {
  state = {
    leftQuery: undefined,
    rightQuery: undefined,
  };

  UNSAFE_componentWillMount() {
    const { queries } = this.props;
    this.setDefaultQueries(queries);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { queries } = this.props;
    if (nextProps.queries !== queries) {
      this.setDefaultQueries(nextProps.queries);
    }
  }

  setDefaultQueries(queries) {
    this.setState({
      leftQuery: queries[0],
      rightQuery: queries[1],
    });
  }

  handleQuerySelectionChange = (queryObj, target) => {
    if (target === LEFT) {
      this.setState({ leftQuery: queryObj });
    } else if (target === RIGHT) {
      this.setState({ rightQuery: queryObj });
    }
  }

  render() {
    const { queries, results, handleWordCloudClick } = this.props;
    if (results && results.length > 0 && !this.state.rightQuery) {
      return (
        <Grid>
          <Row>
            <Col lg={8}>
              <h2><FormattedMessage {...localMessages.title} /></h2>
              <OrderedWordCloud
                words={results[0].results}
                // alreadyNormalized
                width={700}
              />
            </Col>
          </Row>
        </Grid>
      );
    }
    if (results && results.length > 1) {
      let wordSelectorContent;
      // only show selector if more than two queries
      if (queries.length > 2) {
        wordSelectorContent = (
          <WordSelectWrapper
            queries={queries}
            onQuerySelectionChange={this.handleQuerySelectionChange}
            leftQuery={this.state.leftQuery}
            rightQuery={this.state.rightQuery}
          />
        );
      }
      return (
        <div className="comparison-summary">
          <Grid>
            <Row>
              <Col lg={12}>
                <h2><FormattedMessage {...localMessages.title} /></h2>
                {wordSelectorContent}
                <ComparativeOrderedWordCloud
                  leftWords={results[getUidIndex(this.state.leftQuery.uid, results)].results}
                  rightWords={results[getUidIndex(this.state.rightQuery.uid, results)].results}
                  leftTextColor={this.state.leftQuery.color}
                  rightTextColor={this.state.rightQuery.color}
                  textColor={getBrandDarkColor()}
                  onWordClick={handleWordCloudClick}
                  leftTitleMsg={<FormattedMessage {...localMessages.sideTitle} values={{ name: this.state.leftQuery.label }} />}
                  centerTitleMsg={<FormattedMessage {...localMessages.centerTitle} />}
                  rightTitleMsg={<FormattedMessage {...localMessages.sideTitle} values={{ name: this.state.rightQuery.label }} />}
                />
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
    return <div>Error</div>;
  }
}

QueryWordComparisonResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  results: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  handleWordCloudClick: PropTypes.func.isRequired,
  selectComparativeWords: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectComparativeWords: (query, target) => {
    dispatch(selectComparativeWordField({ query, target }));
  },
  updateCurrentQuery: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
    }
  },
  handleWordCloudClick: (word) => {
    ownProps.onQueryModificationRequested(word.term);
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withQueryResults()(
      QueryWordComparisonResultsContainer
    )
  )
);
