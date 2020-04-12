import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../common/hocs/IntlForm';
import AppButton from '../../../common/AppButton';
import SourceDetailsForm from './SourceDetailsForm';
import SourceMetadataForm from './SourceMetadataForm';
import PickCollectionsForm from './PickCollectionsForm';
import { emptyString } from '../../../../lib/formValidators';
import { fetchSourceWithNameExists } from '../../../../actions/sourceActions';

const localMessages = {
  mainTitle: { id: 'source.maintitle', defaultMessage: 'Create New Source' },
  addButton: { id: 'source.add.saveAll', defaultMessage: 'Save New Source' },
  feedback: { id: 'source.add.feedback', defaultMessage: 'We saved your new source' },
  nameInUseError: { id: 'source.add.duplicateName', defaultMessage: 'Sorry this name is already taken' },
};

const SourceForm = (props) => {
  const { initialValues, buttonLabel, pristine, submitting, handleSubmit, onSave } = props;
  // need to init initialValues a bit on the way in to make lower-level logic work right
  const cleanedInitialValues = initialValues ? { ...initialValues } : {};
  if (cleanedInitialValues.disabled === undefined) {
    cleanedInitialValues.disabled = false;
  }
  return (
    <form className="app-form source-form" name="sourceForm" onSubmit={handleSubmit(onSave.bind(this))}>
      <SourceDetailsForm initialValues={cleanedInitialValues} />
      <SourceMetadataForm initialValues={cleanedInitialValues} />
      <PickCollectionsForm initialValues={cleanedInitialValues} form="sourceForm" />
      <Row>
        <Col lg={12}>
          <AppButton
            type="submit"
            style={{ marginTop: 30 }}
            label={buttonLabel}
            disabled={pristine || submitting}
            primary
          />
        </Col>
      </Row>
    </form>
  );
};

SourceForm.propTypes = {
  // from parent
  onSave: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  collections: PropTypes.array,
  // from form healper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.name)) {
    errors.name = localMessages.nameError;
  }
  if (emptyString(values.url)) {
    errors.url = localMessages.urlError;
  }
  return errors;
}

const asyncValidate = (values, dispatch) => {
  if (values.name) { // only check if the user entered a name
    // verify media source name is unique (should we check URL too?)
    return dispatch(fetchSourceWithNameExists({ searchStr: values.name, id: values.id }))
      .then((results) => {
        if (results.nameInUse === true) {
          const error = { name: localMessages.nameInUseError };
          throw error;
        }
      });
  }
  return Promise.resolve();
};

const reduxFormConfig = {
  form: 'sourceForm',
  validate,
  asyncValidate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      SourceForm
    ),
  ),
);
