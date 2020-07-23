import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import AppButton from '../../../../common/AppButton';
import FocusDescriptionForm, { NEW_FOCAL_SET_PLACEHOLDER_ID } from './FocusDescriptionForm';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2020,
  FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE } from '../../../../../lib/focalTechniques';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';
import messages from '../../../../../resources/messages';
import FocalSetForm from './FocalSetForm';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.setup3.title', defaultMessage: 'Step 3: Describe Your Subtopic' },
  retweetIntro: { id: 'focus.create.setup3.retweetIntro', defaultMessage: 'This will create a set with one subtopic for each of the partisan quintiles.  For example, any story from a media source in the "center left" group will be put into the "center left" subtopic in this set.  Name thet set and we will create the subtopics within it.  Give it a name that makes these subtopics easy to identify later.' },
  topCountriesIntro: { id: 'focus.create.setup3.title', defaultMessage: 'This will create a subtopic containing the stories mentioning the top most tagged countries' },
  nytThemeIntro: { id: 'focus.create.setup3.nytTheme.title', defaultMessage: 'This will create a subtopic containing the stories tagged by New York Times Themes' },
  mediaTypeIntro: { id: 'focus.create.setup3.mediaType.title', defaultMessage: 'This will create a subtopic containing the stories tagged by media type' },
  mediaSearchIntro: { id: 'focus.create.setup3.mediaSearch.title', defaultMessage: 'This will create a subtopic containing the stories tagged by media id' },
  duplicateName: { id: 'focus.create.setup3.duplicateName', defaultMessage: 'Duplicate Name' },
};

const FocusForm3DescribeContainer = (props) => {
  const { topicId, handleSubmit, finishStep, goToStep, initialValues, focalSetDefinitions, formData } = props;
  const { formatMessage } = props.intl;
  let introContent;
  // figure out a which focal set to default to
  if (focalSetDefinitions.length === 0) {
    initialValues.focalSetId = NEW_FOCAL_SET_PLACEHOLDER_ID;
  } else {
    initialValues.focalSetId = focalSetDefinitions[0].focal_set_definitions_id;
  }
  const includeDefsInitialValues = initialValues;
  includeDefsInitialValues.focalSetDefinitions = focalSetDefinitions;
  let content;
  switch (formData.focalTechnique) {
    case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
      content = (
        <FocusDescriptionForm
          topicId={topicId}
          initialValues={initialValues}
          focalSetDefinitions={focalSetDefinitions}
          focalTechnique={formData.focalTechnique}
          currentFocalSetDefinitionId={formData.focalSetDefinitionId}
          keywords={formData.keywords}
        />
      );
      break;
    // both 2016 and 2020 use the same container
    case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016:
    case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2020:
      introContent = (
        <p><FormattedMessage {...localMessages.retweetIntro} /></p>
      );
      content = (
        <Row>
          <Col lg={10}>
            <FocalSetForm
              initialValues={includeDefsInitialValues}
              introContent={introContent}
              focalTechnique={formData.focalTechnique}
              fullWidth
            />
          </Col>
        </Row>
      );
      break;
    case FOCAL_TECHNIQUE_TOP_COUNTRIES:
      introContent = (
        <p><FormattedMessage {...localMessages.topCountriesIntro} /></p>
      );
      content = (
        <Row>
          <Col lg={10}>
            <FocalSetForm
              initialValues={includeDefsInitialValues}
              introContent={introContent}
              focalTechnique={formData.focalTechnique}
              fullWidth
            />
          </Col>
        </Row>
      );
      break;
    case FOCAL_TECHNIQUE_NYT_THEME:
      introContent = (
        <p><FormattedMessage {...localMessages.nytThemeIntro} /></p>
      );
      content = (
        <Row>
          <Col lg={10}>
            <FocalSetForm
              initialValues={includeDefsInitialValues}
              introContent={introContent}
              focalTechnique={formData.focalTechnique}
              fullWidth
            />
          </Col>
        </Row>
      );
      break;
    case FOCAL_TECHNIQUE_MEDIA_TYPE:
      introContent = (
        <p><FormattedMessage {...localMessages.mediaTypeIntro} /></p>
      );
      content = (
        <Row>
          <Col lg={10}>
            <FocalSetForm
              initialValues={includeDefsInitialValues}
              introContent={introContent}
              focalTechnique={formData.focalTechnique}
              fullWidth
            />
          </Col>
        </Row>
      );
      break;
    default:
      content = <FormattedMessage {...messages.unimplemented} />;
  }
  return (
    <Grid>
      <form className="focus-create-details" name="snapshotFocus" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={10}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
          </Col>
        </Row>
        {content}
        <Row>
          <Col lg={12}>
            <AppButton variant="outlined" color="secondary" label={formatMessage(messages.previous)} onClick={() => goToStep(1)} />
            &nbsp; &nbsp;
            <AppButton type="submit" label={formatMessage(messages.next)} primary />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

FocusForm3DescribeContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // form composition
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  focalSetDefinitions: PropTypes.array.isRequired,
  formData: PropTypes.object,
  // from dispatch
  goToStep: PropTypes.func.isRequired,
  finishStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  focalSetDefinitions: state.topics.selected.focalSets.definitions.list,
  fetchStatus: state.topics.selected.focalSets.definitions.fetchStatus,
  formData: formSelector(state, 'focalTechnique', 'focalSetDefinitionId', 'keywords'),
});

const mapDispatchToProps = dispatch => ({
  goToStep: (step) => {
    dispatch(goToCreateFocusStep(step));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps,
    ...dispatchProps,
    ...ownProps,
    finishStep: () => {
      dispatchProps.goToStep(3);
    } };
}

function validate(values, props) {
  const errors = {};
  // TODO: figure out if we need to do more validation here, because in theory the
  // subforms components have already done it
  if (props.initialValues.focalSetDefinitions) {
    const nameAlreadyExists = props.initialValues.focalSetDefinitions.filter(fc => fc.name === values.focalSetName);
    if (nameAlreadyExists.length > 0) {
      // return dispatch(addNotice({ level: LEVEL_ERROR, message: ownProps.intl.formatMessage(localMessages.duplicateName) }));
      errors.focalSetName = localMessages.duplicateName;
      errors.focalSetName = { _error: localMessages.duplicateName };
      errors.focusName = localMessages.duplicateName;
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
        FocusForm3DescribeContainer
      )
    )
  )
);
