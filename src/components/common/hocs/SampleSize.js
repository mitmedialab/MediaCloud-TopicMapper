import React from 'react';
import { connect } from 'react-redux';
import { VIEW_1K } from '../EditableWordCloudDataCard';

/**
 * Wrap any component that wants to display an EditableWordCloud. This manages the sampleSize parameter.
 * Your child should accept a `sampleSize` property, and call the supplied `onViewSampleSizeClick` when the sampled
 * size is changed. If your component is a `withFilteredAsyncData` one, it should make sure to include `sampleSize`
 * in it's `propsToRefetchOn`.
 */
const withSampleSize = (ChildComponent) => {
  class SampleSize extends React.Component {
    state = {
      sampleSize: VIEW_1K,
    };

    render() {
      const { sampleSize } = this.state; // must instantiate here and pass as props to child component - this.state.sampleSize doesn't work
      return (
        <div className="sample-size">
          <ChildComponent
            {...this.props}
            sampleSize={sampleSize}
            onViewSampleSizeClick={newSampleSize => this.setState({ sampleSize: newSampleSize })}
          />
        </div>
      );
    }
  }
  SampleSize.propTypes = {
  };
  return connect()(SampleSize);
};

export default withSampleSize;
