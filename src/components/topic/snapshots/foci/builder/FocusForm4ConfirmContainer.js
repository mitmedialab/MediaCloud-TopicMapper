import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import KeywordSearchSummary from './keywordSearch/KeywordSearchSummary';
import RetweetPartisanshipSummary from './retweetPartisanship/RetweetPartisanshipSummary';
import TopCountriesSummary from './topCountries/TopCountriesSummary';
import NytThemeSummary from './nyttheme/NytThemeSummary';
import MediaTypeSummary from './mediaType/MediaTypeSummary';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP, FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE } from '../../../../../lib/focalTechniques';
import AppButton from '../../../../common/AppButton';
import messages from '../../../../../resources/messages';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';

const localMessages = {
  title: { id: 'focus.create.confirm.title', defaultMessage: 'Step 4: Confirm Your Subtopic Changes' },
  focalTechnique: { id: 'focus.create.confirm.focalTechnique', defaultMessage: '<b>Technique</b>: {name}' },
  addAnotherFocus: { id: 'focus.create.generateSnapshot', defaultMessage: 'Save and Add More' },
  focalSetSaved: { id: 'focalSet.saved', defaultMessage: 'We saved your new Set.' },
  focalSetNotSaved: { id: 'focus.notSaved', defaultMessage: 'Sorry, we couldn\'t save your new Set' },
  focusSaved: { id: 'focus.create.saved', defaultMessage: 'We saved your new Subtopic.' },
  focusNotSaved: { id: 'focus.create.notSaved', defaultMessage: 'That didn\'t work! Make sure you have a unique Subtopic name?' },
};

const FocusForm4ConfirmContainer = (props) => {
  const { topicId, formValues, initialValues, handlePreviousStep, handleSubmit, finishStep, submitting } = props;
  const { formatMessage } = props.intl;
  let content = null;
  switch (formValues.focalTechnique) {
    case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
      content = (
        <KeywordSearchSummary topicId={topicId} formValues={formValues} initialValues={initialValues} />
      );
      break;
    case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP:
      content = (
        <RetweetPartisanshipSummary topicId={topicId} formValues={formValues} initialValues={initialValues} />
      );
      break;
    case FOCAL_TECHNIQUE_TOP_COUNTRIES:
      content = (
        <TopCountriesSummary topicId={topicId} formValues={formValues} initialValues={initialValues} />
      );
      break;
    case FOCAL_TECHNIQUE_NYT_THEME:
      content = (
        <NytThemeSummary topicId={topicId} formValues={formValues} initialValues={initialValues} />
      );
      break;
    case FOCAL_TECHNIQUE_MEDIA_TYPE:
      content = (
        <MediaTypeSummary topicId={topicId} formValues={formValues} initialValues={initialValues} />
      );
      break;
    default:
      content = <FormattedMessage {...messages.unimplemented} />;
  }
  return (
    <form className="focus-confirm" name="snapshotFocusConfirm" onSubmit={handleSubmit(finishStep.bind(this))}>
      <Grid>
        <Row>
          <Col lg={12}>
            <h2><FormattedMessage {...localMessages.title} values={{ name: formValues.focusName }} /></h2>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <h3><FormattedHTMLMessage {...localMessages.focalTechnique} values={{ name: formValues.focalTechnique }} /></h3>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            {content}
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <br /><br />
            <AppButton variant="outlined" color="secondary" label={formatMessage(messages.previous)} onClick={handlePreviousStep} />
            &nbsp; &nbsp;
            <AppButton
              disabled={submitting}
              primary
              label={formatMessage(localMessages.addAnotherFocus)}
              type="submit"
            />
          </Col>
        </Row>
      </Grid>
    </form>
  );
};

FocusForm4ConfirmContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  // from state
  formValues: PropTypes.object.isRequired,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formValues: state.form.snapshotFocus.values,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handlePreviousStep: () => {
    dispatch(goToCreateFocusStep(2));
  },
  saveFocus: (topicId, values) => ownProps.onDone(topicId, values),
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    finishStep: values => dispatchProps.saveFocus(ownProps.topicId, values),
  });
}

function validate(values, ownProps) {
  const errors = {};
  // TODO: figure out if we need to do more validation here, because in theory the
  // subforms components have already done it
  if (ownProps.initialValues.focalSetDefinitions) {
    const nameAlreadyExists = ownProps.initialValues.focalSetDefinitions.filter(fc => fc.name === values.focalSetName);
    if (nameAlreadyExists.length > 0) {
      // return dispatch(addNotice({ level: LEVEL_ERROR, message: ownProps.intl.formatMessage(localMessages.duplicateName) }));
      errors.focusSetName = 'duplicateName';
    }
  }
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps, mergeProps)(
        FocusForm4ConfirmContainer
      )
    )
  )
);
