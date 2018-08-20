import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import KeywordSearchPreview from './KeywordSearchPreview';
import { notEmptyString } from '../../../../../../lib/formValidators';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Configure Your {technique} Subtopic' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'This Subtopic is driven by a keyword search.  Any stories that match to boolean query you create will be included in the Subtopic for analysis together.' },
  errorNoKeywords: { id: 'focalTechnique.boolean.keywords.error', defaultMessage: 'You need to specify some keywords.' },
};


class EditKeywordSearchContainer extends React.Component {

  constructor(props) {
    // Track this in local React state because we don't need it anywhere else.
    // We can't read out of the form state becase we need to know when they click "search",
    // but that is updated live as they type.
    super(props);
    this.state = { keywords: null };
  }

  updateKeywords = () => {
    const { currentKeywords } = this.props;
    this.setState({ keywords: currentKeywords });
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        this.updateKeywords();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  render() {
    const { topicId, renderTextField, currentFocalTechnique, handleSubmit, onPreviousStep, finishStep } = this.props;
    const { formatMessage } = this.props.intl;
    let previewContent = null;
    let nextButtonDisabled = true;
    if ((this.state.keywords !== null) && (this.state.keywords !== undefined) && (this.state.keywords.length > 0)) {
      nextButtonDisabled = false;
      previewContent = (
        <div>
          <KeywordSearchPreview topicId={topicId} keywords={this.state.keywords} />
        </div>
      );
    }
    return (
      <Grid>
        <form className="focus-create-edit-keyword" name="focusCreateEditKeywordForm" onSubmit={handleSubmit(finishStep.bind(this))}>
          <Row>
            <Col lg={10}>
              <h2><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h2>
              <p>
                <FormattedMessage {...localMessages.about} />
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={8} xs={12}>
              <Field
                name="keywords"
                component={renderTextField}
                label={messages.searchByKeywords}
                helpertext={localMessages.errorNoKeywords}
                fullWidth
                onKeyDown={this.handleKeyDown}
              />
            </Col>
            <Col lg={2} xs={12}>
              <AppButton
                id="keyword-search-preview-button"
                label={formatMessage(messages.search)}
                style={{ marginTop: 33 }}
                onClick={this.updateKeywords}
              />
            </Col>
          </Row>
          { previewContent }
          <Row>
            <Col lg={8} xs={12}>
              <br />
              <AppButton color="secondary" variant="outlined" onClick={onPreviousStep} label={formatMessage(messages.previous)} />
              &nbsp; &nbsp;
              <AppButton disabled={nextButtonDisabled} type="submit" label={formatMessage(messages.next)} color="primary" />
            </Col>
          </Row>
        </form>
      </Grid>
    );
  }

}

EditKeywordSearchContainer.propTypes = {
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
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: (values) => {
    const customProps = {
      keywords: values.keywords,
    };
    ownProps.onNextStep(customProps);
  },
});

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.keywords)) {
    errors.keywords = true; // localMessages.errorNoKeywords;
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
          EditKeywordSearchContainer
        )
      )
    )
  );
