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
  typeSyndicatedDesc: { id: 'source.feed.add.type.syndicatedDesc', defaultMessage: ' - The RSS or Atom feed will be checked every day and any new stories will be downloaded.' },
  typeWebPage: { id: 'source.feed.add.type.webpage', defaultMessage: 'Web Page' },
  typeWebPageDesc: { id: 'source.feed.add.type.webpageDesc', defaultMessage: '  - The URL will be downloaded once a week. Each download will be treated as a new story.' },
  typePodcast: { id: 'source.feed.add.type.podcast', defaultMessage: 'Podcast' },
  typePodcastDesc: { id: 'source.feed.add.type.podcastDesc', defaultMessage: '  - The RSS or Atom feed will be checked every day for new "enclosures" (attached media files). Any new items will be downloaded and converted to a standard audio file for transcription. Transcribed text will be saved as new stories.' },
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
        <Col md={5} className="feedTypes">
          <Field
            name="type"
            component={renderSelect}
            renderValue={(value) => {
              if (value === 'syndicated') {
                return <FormattedMessage {...localMessages.typeSyndicated} />;
              }
              if (value === 'web_page') {
                return <FormattedMessage {...localMessages.typeWebPage} />;
              }
              return <FormattedMessage {...localMessages.typePodcast} />;
            }}
          >
            <MenuItem key="syndicated" value="syndicated">
              <Col md={1}><FormattedMessage {...localMessages.typeSyndicated} />&nbsp;</Col>&nbsp;
              <Col md={8}><p style={{ whiteSpace: 'normal', width: 800 }}><FormattedMessage {...localMessages.typeSyndicatedDesc} /></p></Col>
            </MenuItem>
            <MenuItem key="web_page" value="web_page">
              <Col md={1}><FormattedMessage {...localMessages.typeWebPage} />&nbsp;</Col>&nbsp;
              <Col md={8}><p style={{ whiteSpace: 'normal', width: 800 }}><FormattedMessage {...localMessages.typeWebPageDesc} /></p></Col>
            </MenuItem>
            <MenuItem key="podcast" value="podcast">
              <Col md={1}><FormattedMessage {...localMessages.typePodcast} />&nbsp;</Col>&nbsp;
              <Col md={8}><p style={{ whiteSpace: 'normal', width: 800 }}><FormattedMessage {...localMessages.typePodcastDesc} /></p></Col>
            </MenuItem>
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
