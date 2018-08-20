import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { FormattedMessage, injectIntl } from 'react-intl';
import BackLinkingControlBar from '../../../BackLinkingControlBar';
import FocusForm1TechniqueContainer from './FocusForm1TechniqueContainer';
import FocusForm2ConfigureContainer from './FocusForm2ConfigureContainer';
import FocusForm3DescribeContainer from './FocusForm3DescribeContainer';
import FocusForm4ConfirmContainer from './FocusForm4ConfirmContainer';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';

const localMessages = {
  backToFociManager: { id: 'backToFociManager', defaultMessage: 'back to Subtopic Builder' },
  step0Name: { id: 'focus.create.step0Name', defaultMessage: 'Pick a Technique' },
  step1Name: { id: 'focus.create.step1Name', defaultMessage: 'Configure' },
  step2Name: { id: 'focus.create.step2Name', defaultMessage: 'Describe' },
  step3Name: { id: 'focus.create.step3Name', defaultMessage: 'Confirm' },
};

class FocusBuilderWizard extends React.Component {

  componentWillMount = () => {
    const { startStep, goToStep } = this.props;
    goToStep(startStep || 0);
  }

  shouldComponentUpdate = (nextProps) => {
    const { currentStep } = this.props;
    return currentStep !== nextProps.currentStep;
  }

  componentWillUnmount = () => {
    const { handleUnmount } = this.props;
    handleUnmount();
  }

  render() {
    const { topicId, currentStep, location, initialValues, onDone } = this.props;
    const steps = [
      FocusForm1TechniqueContainer,
      FocusForm2ConfigureContainer,
      FocusForm3DescribeContainer,
      FocusForm4ConfirmContainer,
    ];
    const CurrentStepComponent = steps[currentStep];
    const stepLabelStyle = { height: 45 };
    return (
      <div className="focus-builder-wizard">
        <BackLinkingControlBar message={localMessages.backToFociManager} linkTo={`/topics/${topicId}/snapshot/foci`} >
          <Stepper activeStep={currentStep}>
            <Step>
              <StepLabel style={stepLabelStyle}><FormattedMessage {...localMessages.step0Name} /></StepLabel>
            </Step>
            <Step>
              <StepLabel style={stepLabelStyle}><FormattedMessage {...localMessages.step1Name} /></StepLabel>
            </Step>
            <Step>
              <StepLabel style={stepLabelStyle}><FormattedMessage {...localMessages.step2Name} /></StepLabel>
            </Step>
            <Step>
              <StepLabel style={stepLabelStyle}><FormattedMessage {...localMessages.step3Name} /></StepLabel>
            </Step>
          </Stepper>
        </BackLinkingControlBar>
        <CurrentStepComponent topicId={topicId} location={location} initialValues={initialValues} onDone={onDone} />
      </div>
    );
  }

}

FocusBuilderWizard.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  startStep: PropTypes.number,
  location: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  // from state
  currentStep: PropTypes.number.isRequired,
  // from dispatch
  goToStep: PropTypes.func.isRequired,
  handleUnmount: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentStep: state.topics.selected.focalSets.create.workflow.currentStep,
});

const mapDispatchToProps = dispatch => ({
  goToStep: (step) => {
    dispatch(goToCreateFocusStep(step));
  },
  handleUnmount: () => {
    dispatch(goToCreateFocusStep(0)); // reset for next time
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      FocusBuilderWizard
    )
  );
