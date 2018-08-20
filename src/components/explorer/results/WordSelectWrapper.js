import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const LEFT = 0;
const RIGHT = 1;

class WordSelectWrapper extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { selectComparativeWords, leftQuery, rightQuery } = this.props;
    if (nextProps.leftQuery !== leftQuery ||
      nextProps.rightQuery !== rightQuery) {
      selectComparativeWords(nextProps.leftQuery, LEFT);
      selectComparativeWords(nextProps.rightQuery, RIGHT);
    }
  }
  selectThisQuery = (targetIndex, value) => {
    // get value and which menu (left or right) and then run comparison
    // get query out of queries at queries[targetIndex] and pass "q" to fetch
    // store choice of Select
    const { selectComparativeWords, queries } = this.props;
    let queryObj = {};
    queryObj = queries[value];
    if (targetIndex === LEFT) {
      selectComparativeWords(queryObj, LEFT);
    } else {
      selectComparativeWords(queryObj, RIGHT);
    }
  }
  render() {
    const { queries, leftQuery, rightQuery } = this.props;
    const menuItems = queries.map((q, idx) =>
      <MenuItem key={idx} value={idx}>{q.label}</MenuItem>
    );
    let content = null;
    if (leftQuery !== null) {
      content = (
        <Row>
          <Col lg={3}>
            <Select
              label="Left Column"
              value={leftQuery.index || queries[0].index}
              onChange={(...args) => this.selectThisQuery(LEFT, args[2])}
              fullWidth
            >
              {menuItems}
            </Select>
          </Col>
          <Col>
            <Select
              label="Right Column"
              value={rightQuery ? rightQuery.index : queries[1].index}
              onChange={(...args) => this.selectThisQuery(RIGHT, args[2])}
            >
              {menuItems}
            </Select>
          </Col>
        </Row>
      );
    }
    return content;
  }

}

WordSelectWrapper.propTypes = {
  // from parent
  queries: PropTypes.array,
  selectComparativeWords: PropTypes.func,
  leftQuery: PropTypes.object,
  rightQuery: PropTypes.object,
};

export default WordSelectWrapper;
