import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import FocalTechniqueSelector from './FocalTechniqueSelector';
import AppButton from '../../../../common/AppButton';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';
import messages from '../../../../../resources/messages';

const localMessages = {
  title: { id: 'focus.create.setup.title', defaultMessage: 'Step 1: Pick a Technique' },
  about: { id: 'focus.create.setup.about',
    defaultMessage: 'Creating a Subtopic lets you identify sub-conversations within this Topic that you can compare to one-another. For example, in a Topic about an election, you could have a topic for coverage about each candidate.' },
};

const formSelector = formValueSelector('snapshotFocus');

const FocusForm1TechniqueContainer = (props) => {
  const { handleSubmit, finishStep, submitting, currentFocalTechnique } = props;
  const { formatMessage } = props.intl;
  return (
    <Grid>
      <form className="focus-create-setup" name="snapshotFocus" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={10} md={10} sm={10}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p>
              <FormattedMessage {...localMessages.about} />
            </p>
          </Col>
        </Row>
        <FocalTechniqueSelector />
        <Row>
          <Col lg={12} md={12} sm={12}>
            <AppButton
              disabled={(currentFocalTechnique === undefined) || submitting}
              type="submit"
              label={formatMessage(messages.next)}
              primary
            >
              {formatMessage(messages.next)}
            </AppButton>
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

FocusForm1TechniqueContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  // form composition
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  // from state
  currentFocalTechnique: PropTypes.string,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  // pull the focal set id out of the form so we know when to show the focal set create sub form
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = dispatch => ({
  goToStep: (step) => {
    dispatch(goToCreateFocusStep(step));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    finishStep: () => {
      dispatchProps.goToStep(1);
    },
  });
}

function validate() {
  const errors = {};
  // TODO: figure out if we need to do more validation here, because in theory the
  // subforms components have already done it
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  validate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps, mergeProps)(
        FocusForm1TechniqueContainer
      )
    )
  )
);
