import PropTypes from 'prop-types';
import React from 'react';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import EditSearchContainer from './search/EditSearchContainer';
import EditPartisanshipContainer from './partisanship/EditPartisanshipContainer';
import EditTopCountriesContainer from './topCountries/EditTopCountriesContainer';
import EditNytThemeContainer from './nyttheme/EditNytThemeContainer';
import EditMediaTypeContainer from './mediaType/EditMediaTypeContainer';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016, FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2019, FOCAL_TECHNIQUE_PARTISANSHIP_TO_YEAR,
  FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE } from '../../../../../lib/focalTechniques';
import messages from '../../../../../resources/messages';

const formSelector = formValueSelector('snapshotFocus');

const FocusForm2ConfigureContainer = (props) => {
  const { topicId, initialValues, handleNextStep, currentFocalTechnique, handlePreviousStep, location } = props;
  let content = null;
  switch (currentFocalTechnique) {
    case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
      content = (
        <EditSearchContainer
          topicId={topicId}
          initialValues={initialValues}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          location={location}
        />
      );
      break;
    // both 2016 and 2019 use the same container
    case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016:
    case FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2019:
      content = (
        <EditPartisanshipContainer
          topicId={topicId}
          year={FOCAL_TECHNIQUE_PARTISANSHIP_TO_YEAR[currentFocalTechnique]}
          analysisType={currentFocalTechnique}
          initialValues={initialValues}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          location={location}
        />
      );
      break;
    case FOCAL_TECHNIQUE_TOP_COUNTRIES:
      content = (
        <EditTopCountriesContainer
          topicId={topicId}
          initialValues={initialValues}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          location={location}
        />
      );
      break;
    case FOCAL_TECHNIQUE_NYT_THEME:
      content = (
        <EditNytThemeContainer
          topicId={topicId}
          initialValues={initialValues}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          location={location}
        />
      );
      break;
    case FOCAL_TECHNIQUE_MEDIA_TYPE:
      content = (
        <EditMediaTypeContainer
          topicId={topicId}
          initialValues={initialValues}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          location={location}
        />
      );
      break;
    default:
      content = <FormattedMessage {...messages.unimplemented} />;
  }
  return (
    <div>
      { content }
    </div>
  );
};

FocusForm2ConfigureContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // form context
  intl: PropTypes.object.isRequired,
  // from dipatch
  handlePreviousStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  // from state:
  currentFocalTechnique: PropTypes.string.isRequired,
  location: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
  params: ownProps.params,
});

const mapDispatchToProps = dispatch => ({
  handlePreviousStep: () => {
    dispatch(goToCreateFocusStep(0));
  },
  handleNextStep: () => {
    dispatch(goToCreateFocusStep(2));
  },
});

export default
connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(
    FocusForm2ConfigureContainer
  )
);
