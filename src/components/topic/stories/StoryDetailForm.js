import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import MenuItem from '@material-ui/core/MenuItem';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import { emptyString } from '../../../lib/formValidators';
import messages from '../../../resources/messages';

const localMessages = {
  mainTitle: { id: 'story.maintitle', defaultMessage: 'Update Story' },
  nameError: { id: 'story.nameError', defaultMessage: 'Save New Source' },
  urlError: { id: 'story.urlError', defaultMessage: 'We saved your new source' },
};

const StoryDetailForm = (props) => {
  const { initialValues, buttonLabel, pristine, submitting, handleSubmit, onSave, renderTextField, renderCheckbox, renderSelect, language } = props;
  const { formatMessage } = props.intl;
  // need to init initialValues a bit on the way in to make lower-level logic work right
  const cleanedInitialValues = initialValues ? { ...initialValues } : {};
  if (cleanedInitialValues.disabled === undefined) {
    cleanedInitialValues.disabled = false;
  }
  return (
    <form className="app-form story-form" name="storyDetailForm" onSubmit={handleSubmit(onSave.bind(this))}>
      <Row>
        <Col lg={12}>
          <Field
            name="title"
            component={renderTextField}
            fullWidth
            label={formatMessage(messages.storyTitle)}
            hintText={formatMessage(messages.storyTitle)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="description"
            component={renderTextField}
            fullWidth
            label={formatMessage(messages.storyDescription)}
            hintText={formatMessage(messages.storyDescription)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="url"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(messages.storyUrl)}
            hintText={formatMessage(messages.storyUrl)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="language"
            component={renderSelect}
            type="inline"
            fullWidth
            label={formatMessage(messages.language)}
            hintText={formatMessage(messages.language)}
          >
            {language.map(t => <MenuItem key={t} value={t} primaryText={t} />)}
          </Field>
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="publish_date"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(messages.storyDate)}
            hintText={formatMessage(messages.storyDate)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="custom_date"
            component={renderCheckbox}
            type="inline"
            fullWidth
            label={formatMessage(messages.storyCustomDate)}
            hintText={formatMessage(messages.storyCustomDate)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="undateable"
            component={renderCheckbox}
            type="inline"
            fullWidth
            label={formatMessage(messages.storyUndateable)}
            hintText={formatMessage(messages.storyUndateable)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <AppButton
            style={{ marginTop: 30 }}
            type="submit"
            label={buttonLabel}
            disabled={pristine || submitting}
            color="primary"
          />
        </Col>
      </Row>
    </form>
  );
};

StoryDetailForm.propTypes = {
  // from parent
  onSave: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  language: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
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

const reduxFormConfig = {
  form: 'storyDetailForm',
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        StoryDetailForm
      ),
    ),
  );
