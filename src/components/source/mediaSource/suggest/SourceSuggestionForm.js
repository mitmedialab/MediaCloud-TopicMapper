import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../common/hocs/IntlForm';
import { emptyString, invalidUrl } from '../../../../lib/formValidators';

const localMessages = {
  nameLabel: { id: 'source.suggest.name.label', defaultMessage: 'Source Name' },
  urlLabel: { id: 'source.suggest.url.label', defaultMessage: 'Homepage (required)' },
  feedUrlLabel: { id: 'source.suggest.feedurl.label', defaultMessage: 'RSS feed URL' },
  feedUrlHint: { id: 'source.suggest.feedurl.hint', defaultMessage: 'if you know the url of an RSS feed, enter it here' },
  reasonLabel: { id: 'source.suggest.reasons.label', defaultMessage: 'Reasons' },
  reasonHint: { id: 'source.suggest.reasons.hint', defaultMessage: 'why do you want us to add this source' },
  addLabel: { id: 'source.suggest.collection.label', defaultMessage: 'Add to these Collection' },
  nameError: { id: 'source.suggest.name.error', defaultMessage: 'You have to enter a name for this source.' },
  urlError: { id: 'source.suggest.url.error', defaultMessage: 'Pick have to enter a url for this source.' },
  invalidUrl: { id: 'source.suggest.url.invalid', defaultMessage: 'That isn\'t a valid URL. Please enter just one full url here.' },
};

const SourceSuggestionForm = (props) => {
  const { renderTextField } = props;
  return (
    <div className="app-form">
      <Row>
        <Col md={3}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.nameLabel} />
          </span>
        </Col>
        <Col md={4}>
          <Field
            name="name"
            component={renderTextField}
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.urlLabel} />
          </span>
        </Col>
        <Col md={4}>
          <Field
            name="url"
            component={renderTextField}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.feedUrlLabel} />
          </span>
        </Col>
        <Col md={4}>
          <Field
            name="feedurl"
            component={renderTextField}
            label={localMessages.feedUrlHint}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.reasonLabel} />
          </span>
        </Col>
        <Col md={7}>
          <Field
            name="reason"
            component={renderTextField}
            label={localMessages.reasonHint}
            fullWidth
          />
        </Col>
      </Row>
    </div>
  );
};

SourceSuggestionForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.url)) {
    errors.url = localMessages.missingUrl;
  }
  if (invalidUrl(values.url)) {
    errors.url = localMessages.invalidUrl;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'suggestionForm',
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        SourceSuggestionForm
      )
    )
  );
