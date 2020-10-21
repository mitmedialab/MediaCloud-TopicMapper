import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PlatformFormContainer from './PlatformFormContainer';
import { goToCreatePlatformStep } from '../../../../actions/topicActions';
import { PLATFORM_OPEN_WEB } from '../../../../lib/platformTypes';

const Platform1ConfigureContainer = ({ topicId, topicInfo, initialValues, handleNextStep, selectedPlatform, location, hidePreview }) => {
  let initValues = { ...initialValues, ...selectedPlatform };
  if (selectedPlatform.platform === PLATFORM_OPEN_WEB) {
    initValues = { ...initialValues, media: selectedPlatform.channel ? selectedPlatform.channel : (initialValues.media.concat(initialValues.media_tags)) };
  }

  return (
    <PlatformFormContainer
      topicId={topicId}
      topicInfo={topicInfo}
      // onPreviousStep={handlePreviousStep}
      onNextStep={handleNextStep}
      location={location}
      initialValues={initValues}
      hidePreview={hidePreview}
    />
  );
};

Platform1ConfigureContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  topicInfo: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  hidePreview: PropTypes.bool,
  // form context
  intl: PropTypes.object.isRequired,
  // from dipatch
  handleNextStep: PropTypes.func.isRequired,
  // from state:
  selectedPlatform: PropTypes.object,
  location: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  selectedPlatform: state.topics.selected.platforms.selected,
  topicInfo: state.topics.selected.info,
  params: ownProps.params,
});

const mapDispatchToProps = dispatch => ({
  handleNextStep: () => {
    dispatch(goToCreatePlatformStep(1));
  },
});

export default
connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(
    Platform1ConfigureContainer
  )
);
