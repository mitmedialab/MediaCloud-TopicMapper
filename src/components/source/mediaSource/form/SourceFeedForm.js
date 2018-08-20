import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import withIntlForm from '../../../common/hocs/IntlForm';
import AppButton from '../../../common/AppButton';
import { emptyString, invalidUrl } from '../../../../lib/formValidators';
import messages from '../../../../resources/messages';

const localMessages = {
  typeSyndicated: { id: 'source.feed.add.type.syndicated', defaultMessage: 'Syndicated' },
  typeWebPage: { id: 'source.feed.add.type.webpage', defaultMessage: 'Web Page' },
  feedIsActive: { id: 'source.feed.add.active', defaultMessage: 'Feed is Active' },
  urlInvalid: { id: 'source.feed.url.invalid', defaultMessage: 'That isn\'t a valid feed URL. Please enter just the full url of one RSS or Atom feed.' },
};

const SourceFeedForm = (props) => {
  const { renderTextField, renderSelect, renderCheckbox, buttonLabel, handleSubmit, onSave, pristine, submitting } = props;
  const { formatMessage } = props.intl;
  return (
    <form className="app-form source-feed-form" name="sourceFeedForm" onSubmit={handleSubmit(onSave.bind(this))}>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...messages.feedName} />
          </span>
        </Col>
        <Col md={8}>
          <Field
            name="name"
            component={renderTextField}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...messages.feedUrl} />
          </span>
        </Col>
        <Col md={8}>
          <Field
            name="url"
            component={renderTextField}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...messages.feedType} />
          </span>
        </Col>
        <Col md={8}>
          <Field name="type" component={renderSelect} >
            <MenuItem key="syndicated" value="syndicated"><FormattedMessage {...localMessages.typeSyndicated} /></MenuItem>
            <MenuItem key="web_page" value="web_page"><FormattedMessage {...localMessages.typeWebPage} /></MenuItem>
          </Field>
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...messages.feedIsActive} />
          </span>
        </Col>
        <Col md={8}>
          <Field
            name="active"
            component={renderCheckbox}
            fullWidth
            label={formatMessage(messages.feedIsActive)}
            value
          />
        </Col>
      </Row>
      <AppButton
        type="submit"
        className="source-feed-updated"
        label={buttonLabel}
        primary
        disabled={pristine || submitting}
      />
    </form>
  );
};

SourceFeedForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.type)) {
    errors.type = messages.required;
  }
  if (emptyString(values.url)) {
    errors.url = messages.required;
  }
  if (invalidUrl(values.url)) {
    errors.url = localMessages.urlInvalid;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'sourceFeedForm',
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        SourceFeedForm
      )
    )
  );
