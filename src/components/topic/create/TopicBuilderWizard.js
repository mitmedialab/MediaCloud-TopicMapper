import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { FormattedMessage, injectIntl } from 'react-intl';
import BackLinkingControlBar from '../BackLinkingControlBar';
import TopicCreate1ConfigureContainer from './TopicCreate1ConfigureContainer';
import TopicCreate2PreviewContainer from './TopicCreate2PreviewContainer';
import TopicCreate3ConfirmContainer from './TopicCreate3ConfirmContainer';
import { goToCreateTopicStep } from '../../../actions/topicActions';

const localMessages = {
  backToTopicManager: { id: 'backToTopicManager', defaultMessage: 'back to Home' },
  step0Name: { id: 'topic.create.step0Name', defaultMessage: 'Configure' },
  step1Name: { id: 'topic.create.step1Name', defaultMessage: 'Preview' },
  step2Name: { id: 'topic.create.step3Name', defaultMessage: 'Confirm' },
};

class TopicBuilderWizard extends React.Component {

  componentWillMount = () => {
    const { startStep, goToStep } = this.props;
    goToStep(startStep || 0);
  }

  componentWillReceiveProps(nextProps) {
    const { location, goToStep } = this.props;
    if (nextProps.location.pathname !== location.pathname) {
      const url = nextProps.location.pathname;
      const lastPathPart = url.slice(url.lastIndexOf('/') + 1, url.length);
      const stepNumber = parseInt(lastPathPart, 10);
      goToStep(stepNumber);
    }
  }
  componentWillUnmount = () => {
    const { handleUnmount } = this.props;
    handleUnmount();
  }

  render() {
    const { currentStep, location, initialValues } = this.props;
    const steps = [
      TopicCreate1ConfigureContainer,
      TopicCreate2PreviewContainer,
      TopicCreate3ConfirmContainer,
    ];
    const CurrentStepComponent = steps[currentStep];
    const stepLabelStyle = { height: 45 };
    return (
      <div className="topic-builder-wizard">
        <BackLinkingControlBar message={localMessages.backToTopicManager} linkTo={'/home'} >
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
          </Stepper>
        </BackLinkingControlBar>
        <CurrentStepComponent location={location} initialValues={initialValues} />
      </div>
    );
  }

}

TopicBuilderWizard.propTypes = {
  // from parent
  formData: PropTypes.object,
  initialValues: PropTypes.object,
  startStep: PropTypes.number,
  location: PropTypes.object,
  // from state
  currentStep: PropTypes.number.isRequired,
  // from dispatch
  goToStep: PropTypes.func.isRequired,
  handleUnmount: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentStep: state.topics.create.preview.workflow.currentStep,
});

const mapDispatchToProps = dispatch => ({
  goToStep: (step) => {
    dispatch(push(`/topics/create/${step}`));
    dispatch(goToCreateTopicStep(step));
  },
  handleUnmount: () => {
    dispatch(goToCreateTopicStep(0));
  },
});

const reduxFormConfig = {
  form: 'topicForm',
  destroyOnUnmount: false,  // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
};

export default
  injectIntl(
    reduxForm(reduxFormConfig)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(
          TopicBuilderWizard
        )
      )
    )
  );
