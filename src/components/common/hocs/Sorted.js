import React from 'react';
import { connect } from 'react-redux';

/**
 */
const withSorting = (ChildComponent) => {
  class Sorted extends React.Component {
    state = {
      sort: null,
    };

    render() {
      const { sort } = this.state; // must instantiate here and pass as props to child component - this.state.sampleSize doesn't work
      return (
        <div className="sorted">
          <ChildComponent
            {...this.props}
            sort={sort}
            onChangeSort={newSort => this.setState({ sort: newSort })}
          />
        </div>
      );
    }
  }
  Sorted.propTypes = {
  };
  return connect()(Sorted);
};

export default withSorting;
