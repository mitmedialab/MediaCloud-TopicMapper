import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { fetchPermissionsList, updatePermissions } from '../../../actions/topicActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import BackLinkingControlBar from '../BackLinkingControlBar';
import { updateFeedback } from '../../../actions/appActions';
import { PERMISSION_TOPIC_READ, PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';
import withIntlForm from '../../common/hocs/IntlForm';
import messages from '../../../resources/messages';
import AppButton from '../../common/AppButton';
import { DeleteButton } from '../../common/IconButton';
import { invalidEmail } from '../../../lib/formValidators';
import Permissioned from '../../common/Permissioned';

const localMessages = {
  title: { id: 'topic.permissions.title', defaultMessage: 'Topic Permissions' },
  intro: { id: 'topic.permissions.intro', defaultMessage: 'You can control who is allowed to see, and who is allowed to edit, this Topic. Enter another user\'s email in the field below, set whether they can read or edit the topic, and then click add. Read permission allows the given user to view all data within the topic. Write permission grants read permission and also allows the user to perform all operations on the topic -- including spidering, snapshotting, and merging — other editing permissions. Admin permission grants write permission and also allows all the user to edit the permissions for the topic.' },
  read: { id: 'topic.permissions.read', defaultMessage: 'Read' },
  write: { id: 'topic.permissions.write', defaultMessage: 'Write' },
  admin: { id: 'topic.permissions.admin', defaultMessage: 'Admin' },
  existingTitle: { id: 'topic.permissions.existing.title', defaultMessage: 'Current Permissions' },
  existingIntro: { id: 'topic.permissions.existing.intro', defaultMessage: 'Here is a list of the current users and what they are allowed to do.' },
  addTitle: { id: 'topic.permissions.add', defaultMessage: 'Add Someone to this Topic' },
  emailError: { id: 'topic.permissions.email.error', defaultMessage: 'You have to enter the email of a Media Cloud user.' },
  failedToSave: { id: 'topic.permissions.email.failedSave', defaultMessage: 'We couldn\'t save those permissions. ' },
  saved: { id: 'topic.permissions.email.saveWorked', defaultMessage: 'Saved the new permissions.' },
  emailFieldHint: { id: 'topic.permissions.email.hint', defaultMessage: 'Enter someone\'s email' },
  unknownEmail: { id: 'topic.permissions.email.unknown', defaultMessage: 'Unknown email {email}.' },
};

// render a list of permissions and the option to add one more
const PermissionsList = ({ renderTextField, renderSelect, intl: { formatMessage }, fields, meta: { error, submitFailed } }) => (
  <div className="topic-permissions-list">
    {submitFailed && error && <span>{error}</span>}
    {fields.map((permission, index) => (
      <div className="topic-permission-item" key={`permission${index}`}>
        <Row>
          <Col lg={5}>
            <Field
              name={`${permission}.email`}
              component={renderTextField}
              fullWidth
              placeholder={formatMessage(localMessages.emailFieldHint)}
            />
          </Col>
          <Col lg={2}>
            <Field fullWidth name={`${permission}.permission`} component={renderSelect} label={localMessages.permission}>
              <MenuItem key={PERMISSION_TOPIC_READ} value={PERMISSION_TOPIC_READ}><FormattedMessage {...localMessages.read} /></MenuItem>
              <MenuItem key={PERMISSION_TOPIC_WRITE} value={PERMISSION_TOPIC_WRITE}><FormattedMessage {...localMessages.write} /></MenuItem>
              <MenuItem key={PERMISSION_TOPIC_ADMIN} value={PERMISSION_TOPIC_ADMIN}><FormattedMessage {...localMessages.admin} /></MenuItem>
            </Field>
          </Col>
          <Col lg={1}>
            <DeleteButton onClick={() => fields.remove(index)} />
          </Col>
        </Row>
      </div>
    ))}
    <AppButton label="add" onClick={() => fields.push({ permission: PERMISSION_TOPIC_READ })}>
      <FormattedMessage {...localMessages.addTitle} />
    </AppButton>
  </div>
);
PermissionsList.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  // from hoc
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};
const HocPermissionsList = injectIntl(withIntlForm(PermissionsList));


const TopicPermissionsContainer = (props) => {
  const { handleUpdate, topicId, handleSubmit, pristine, submitting } = props;
  return (
    <>
      <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topicId}/summary`} />
      <Grid>
        <Row>
          <Col lg={10}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>
          <form
            name="updateTopicPermissions"
            onSubmit={handleSubmit(values => handleUpdate(topicId, values.permissions))}
          >
            <Row>
              <Col lg={12}>
                <FieldArray name="permissions" component={HocPermissionsList} />
              </Col>
            </Row>
            <Row>
              <Col lg={2}>
                <AppButton
                  type="submit"
                  disabled={pristine || submitting}
                  label={messages.save}
                  primary
                />
              </Col>
            </Row>
          </form>
        </Permissioned>
      </Grid>
    </>
  );
};

TopicPermissionsContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleUpdate: PropTypes.func.isRequired,
  // from state
  topicId: PropTypes.number,
  // from form helper
  initialValues: PropTypes.object,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.permissions.fetchStatus,
  initialValues: { permissions: state.topics.selected.permissions.list },
});

const UKNOWN_EMAIL_ERROR_REGEX = /Unknown email '(.*)'/;

const mapDispatchToProps = (dispatch, ownProps) => ({
  // save and then update the list of existing permissions
  handleUpdate: (topicId, permissions) => dispatch(updatePermissions(topicId, permissions))
    .then((response) => {
      if (response.success === 0) {
        let extraDetail;
        if (UKNOWN_EMAIL_ERROR_REGEX.test(response.results)) {
          [extraDetail] = response.results.match(UKNOWN_EMAIL_ERROR_REGEX);
        }
        dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.failedToSave) + extraDetail }));
      } else {
        dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.saved) }));
        dispatch(fetchPermissionsList(topicId));
      }
    }),
});

function validate(values) {
  const errors = {};
  const permissionArrayErrors = [];
  if (values.permissions) {
    values.permissions.forEach((permission, index) => {
      const permissionErrors = {};
      if (invalidEmail(permission.email)) {
        permissionErrors.email = localMessages.emailError;
      }
      permissionArrayErrors[index] = permissionErrors;
    });
    errors.permissions = permissionArrayErrors;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'updateTopicPermissions',
  validate,
  destroyOnUnmount: false,
  enableReinitialize: true,
};

const fetchAsyncData = (dispatch, { topicId }) => dispatch(fetchPermissionsList(topicId));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['topicId'])(
      reduxForm(reduxFormConfig)(
        TopicPermissionsContainer
      )
    )
  )
);
