import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import SearchPreview from './SearchPreview';
import OpenWebMediaFieldArray from '../../../../../common/form/OpenWebMediaFieldArray';
import MediaPickerDialog from '../../../../../common/mediaPicker/MediaPickerDialog';
import { notEmptyString } from '../../../../../../lib/formValidators';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Configure Your Media Sources Subtopic' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'This Subtopic is driven by a {type} search.  Any stories that match to boolean query you create will be included in the Subtopic for analysis together.' },
  errorNoKeywords: { id: 'focalTechnique.boolean.keywords.error', defaultMessage: 'You need to specify some {values}.' },
  intro: { id: 'focus.create.edit.intro', defaultMessage: 'Choose Media' },
};

class EditSearchContainer extends React.Component {
  constructor(props) {
    // Track this in local React state because we don't need it anywhere else.
    // We can't read out of the form state becase we need to know when they click "search",
    // but that is updated live as they type.
    super(props);
    this.state = { values: null, enableSearch: false };
  }

  updateSearchValues = () => {
    const { currentSearchValues } = this.props;
    this.setState({ values: { media: currentSearchValues.media, keywords: currentSearchValues.keywords } });
  }

  updateAndMediaChange = (values) => {
    const { handleMediaChange } = this.props;
    this.setState({ enableSearch: true });
    handleMediaChange(values);
  }

  enableSearch = () => {
    this.setState({ enableSearch: true });
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        this.updateSearchValues();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  render() {
    const { topicId, initialValues, currentFocalTechnique, handleSubmit, onPreviousStep, finishStep, renderTextField } = this.props;
    const { formatMessage } = this.props.intl;
    let previewContent = null;
    let nextButtonDisabled = true;
    if (this.state.values) {
      nextButtonDisabled = false;
      previewContent = (
        <div>
          <SearchPreview topicId={topicId} searchValues={this.state.values} />
        </div>
      );
    }
    return (
      <Grid>
        <form className="focus-create-edit-keyword" name="snap" onSubmit={handleSubmit(finishStep.bind(this))}>
          <Row>
            <Col lg={10}>
              <h2><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h2>
              <p>
                <FormattedMessage {...localMessages.about} values={{ type: 'media' }} />
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <Field
                name="keywords"
                component={renderTextField}
                label={messages.searchByKeywords}
                fullWidth
                onChange={this.enableSearch}
                onKeyDown={this.handleKeyDown}
              />
            </Col>
            <Col lg={8}>
              <OpenWebMediaFieldArray
                className="query-field"
                form="snapshotFocus"
                fieldName="media"
                enableReinitialize
                keepDirtyOnReinitialize
                destroyOnUnmount={false}
                allowRemoval={false}
                title={localMessages.title}
                intro={localMessages.intro}
              />
              <MediaPickerDialog
                initMedia={initialValues.media || []}
                onConfirmSelection={selections => this.updateAndMediaChange(selections)}
              />
            </Col>
            <Col lg={4} xs={12}>
              <AppButton
                id="keyword-search-preview-button"
                label={formatMessage(messages.search)}
                onClick={this.updateSearchValues}
                disabled={!this.state.enableSearch}
              />
            </Col>
          </Row>
          { previewContent }
          <Row>
            <Col lg={8} xs={12}>
              <br />
              <AppButton color="secondary" variant="outlined" onClick={onPreviousStep} label={formatMessage(messages.previous)} />
              &nbsp; &nbsp;
              <AppButton disabled={nextButtonDisabled} type="submit" label={formatMessage(messages.next)} primary />
            </Col>
          </Row>
        </form>
      </Grid>
    );
  }
}

EditSearchContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onPreviousStep: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired,
  handleMediaChange: PropTypes.func.isRequired,
  // from state
  formData: PropTypes.object,
  currentSearchValues: PropTypes.object,
  currentFocalTechnique: PropTypes.string,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentSearchValues: formSelector(state, 'media', 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: (values) => {
    const customProps = {
      searchValues: values.searchValues,
    };
    ownProps.onNextStep(customProps);
  },
  handleMediaChange: (values) => {
    ownProps.change('media', values);
  },
});

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.searchValues)) {
    errors.searchValues = true; // localMessages.errorNoKeywords;
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
      connect(mapStateToProps, mapDispatchToProps)(
        EditSearchContainer
      )
    )
  )
);
