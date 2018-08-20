import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import MediaTypeCoveragePreviewContainer from './MediaTypeCoveragePreviewContainer';
import MediaTypeStoryCountsPreviewContainer from './MediaTypeStoryCountsPreviewContainer';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Preview Subtopics by Media type' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'This will create a set of subtopics as filtered by media types.' },
};

const EditMediaTypeContainer = (props) => {
  const { topicId, onPreviousStep, handleSubmit, finishStep, formData, initialValues } = props;
  const { formatMessage } = props.intl;
  let mediaTypeSelected = initialValues.mediaType;
  if (formData && formData.values.mediaType) {
    mediaTypeSelected = formData.values.mediaType;
  }
  return (
    <Grid>
      <form className="focus-create-media-type" name="focusCreateEditMediaTypeForm" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={8} md={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.about} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <MediaTypeCoveragePreviewContainer topicId={topicId} mediaTypeSelected={mediaTypeSelected} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <MediaTypeStoryCountsPreviewContainer topicId={topicId} mediaTypeSelected={mediaTypeSelected} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={12}>
            <br />
            <AppButton color="secondary" variant="outlined" onClick={onPreviousStep} label={formatMessage(messages.previous)} />
            &nbsp; &nbsp;
            <AppButton type="submit" label={formatMessage(messages.next)} color="primary" />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};


EditMediaTypeContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onPreviousStep: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: () => {
    ownProps.onNextStep({});
  },
});

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false,  // so the wizard works
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        connect(mapStateToProps, mapDispatchToProps)(
          EditMediaTypeContainer
        )
      )
    )
  );
