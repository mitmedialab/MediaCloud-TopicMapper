import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector, Field } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import TopCountriesCoveragePreviewContainer from './TopCountriesCoveragePreviewContainer';
import TopCountriesStoryCountsPreviewContainer from './TopCountriesStoryCountsPreviewContainer';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Preview Subtopics by Top Countries' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'This will create a set of subtopics as filtered by the set of top countries you have selected.' },
  numberLabel: { id: 'focus.create.edit.number', defaultMessage: '# Top Countries' },
};

const EditTopCountriesContainer = (props) => {
  const { topicId, onPreviousStep, handleSubmit, finishStep, formData, renderSelect, initialValues } = props;
  const { formatMessage } = props.intl;
  let numCountries = initialValues.numberSelected;
  if (formData && formData.values.numberSelected) {
    numCountries = formData.values.numberSelected;
  }
  return (
    <Grid>
      <form className="focus-create-top-countries" name="focusCreateEditTopCountriesForm" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={8} md={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.about} /></p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Field
              name="numberSelected"
              component={renderSelect}
              label={formatMessage(localMessages.numberLabel)}
              value={5}
            >
              <MenuItem value={5}><FormattedMessage {...messages.top5} /></MenuItem>
              <MenuItem value={10}><FormattedMessage {...messages.top10} /></MenuItem>
              <MenuItem value={15}><FormattedMessage {...messages.top15} /></MenuItem>
              <MenuItem value={20}><FormattedMessage {...messages.top20} /></MenuItem>
              <MenuItem value={25}><FormattedMessage {...messages.top25} /></MenuItem>
            </Field>
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <TopCountriesCoveragePreviewContainer topicId={topicId} numCountries={numCountries} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <TopCountriesStoryCountsPreviewContainer topicId={topicId} numCountries={numCountries} />
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


EditTopCountriesContainer.propTypes = {
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
          EditTopCountriesContainer
        )
      )
    )
  );
