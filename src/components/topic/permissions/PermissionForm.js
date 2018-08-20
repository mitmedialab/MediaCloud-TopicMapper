import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import { notEmptyString } from '../../../lib/formValidators';
import AppButton from '../../common/AppButton';
import withIntlForm from '../../common/hocs/IntlForm';
import { DeleteButton } from '../../common/IconButton';
import { PERMISSION_TOPIC_READ, PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';

const localMessages = {
  emailFieldHint: { id: 'topic.permissions.email.hint', defaultMessage: 'Enter someone\'s email' },
  read: { id: 'topic.permissions.read', defaultMessage: 'Read' },
  write: { id: 'topic.permissions.write', defaultMessage: 'Write' },
  admin: { id: 'topic.permissions.admin', defaultMessage: 'Admin' },
  permission: { id: 'topic.permissions.permission', defaultMessage: 'Permisson' },
  addUser: { id: 'topic.permissions.addUser', defaultMessage: 'Add This User' },
  updateUser: { id: 'topic.permissions.updateUser', defaultMessage: 'Save' },
  email: { id: 'topic.permissions.email', defaultMessage: 'Email' },
  emailError: { id: 'topic.permissions.email.error', defaultMessage: 'You have to enter the email of a Media Cloud user.' },
  permissionError: { id: 'topic.permissions.permission.error', defaultMessage: 'Pick a permisson level.' },
  remove: { id: 'topic.permissions.remove', defaultMessage: 'Remove this user from this Topic' },
};

const PermissionForm = (props) => {
  const { handleSubmit, onSave, pristine, submitting, renderTextField, renderSelect, initialValues, showDeleteButton, onDelete } = props;
  const { formatMessage } = props.intl;
  const buttonLabel = (initialValues.email === null) ? formatMessage(localMessages.addUser) : formatMessage(localMessages.updateUser);
  let deleteButton = null;
  if (showDeleteButton === true) {
    deleteButton = <DeleteButton tooltip={formatMessage(localMessages.remove)} onClick={() => onDelete(initialValues.email)} />;
  }
  return (
    <form className="permission-form update-permission" name="topicPermissionForm" onSubmit={handleSubmit(onSave.bind(this))}>
      <Row>
        <Col lg={5} md={5} sm={12}>
          <Field
            name="email"
            component={renderTextField}
            fullWidth
            label={localMessages.email}
            hintText={localMessages.emailFieldHint}
          />
        </Col>
        <Col lg={3} md={3} sm={3} xs={12}>
          <Field name="permission" component={renderSelect} label={localMessages.permission}>
            <MenuItem key={PERMISSION_TOPIC_READ} value={PERMISSION_TOPIC_READ} primaryText={formatMessage(localMessages.read)}>{PERMISSION_TOPIC_READ}</MenuItem>
            <MenuItem key={PERMISSION_TOPIC_WRITE} value={PERMISSION_TOPIC_WRITE} primaryText={formatMessage(localMessages.write)}>{PERMISSION_TOPIC_WRITE}</MenuItem>
            <MenuItem key={PERMISSION_TOPIC_ADMIN} value={PERMISSION_TOPIC_ADMIN} primaryText={formatMessage(localMessages.admin)}>{PERMISSION_TOPIC_ADMIN}</MenuItem>
          </Field>
        </Col>
        <Col lg={2} md={2} sm={2} xs={12}>
          <AppButton
            style={{ marginTop: 30 }}
            type="submit"
            disabled={pristine || submitting}
            label={buttonLabel}
            color="primary"
          />
          {deleteButton}
        </Col>
      </Row>
    </form>
  );
};

PermissionForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  // from form helper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  // from parent
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  showDeleteButton: PropTypes.bool,
};

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.email)) {
    errors.email = localMessages.emailError;
  }
  if (!notEmptyString(values.permission)) {
    errors.permission = localMessages.permissionError;
  }
  return errors;
}

const reduxFormConfig = {
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        PermissionForm
      )
    )
  );
