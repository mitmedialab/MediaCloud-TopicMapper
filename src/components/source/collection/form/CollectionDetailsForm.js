import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../common/hocs/IntlForm';

const localMessages = {
  nameLabel: { id: 'collection.add.name.label', defaultMessage: 'Name' },
  descriptionLabel: { id: 'collection.add.description.label', defaultMessage: 'Description' },
  staticLabel: { id: 'collection.add.static.label', defaultMessage: 'Static' },
  showOnMediaLabel: { id: 'collection.add.showOnMedia.label', defaultMessage: 'Public' },
  descriptionError: { id: 'collection.add.description.error', defaultMessage: 'You have to enter a description for this collection.' },
  nameError: { id: 'collection.add.name.error', defaultMessage: 'You have to enter a name for this collection.' },
};

const CollectionDetailsForm = (props) => {
  const { renderTextField, renderCheckbox, initialValues, updateFields } = props;
  return (
    <div className="collection-details-form">
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.nameLabel} />
          </span>
        </Col>
        <Col md={11}>
          <Field
            name="name"
            component={renderTextField}
            disabled={initialValues.disabled}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.descriptionLabel} />
          </span>
        </Col>
        <Col md={11}>
          <Field
            name="description"
            component={renderTextField}
            fullWidth
            disabled={initialValues.disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <Field
            name="static"
            component={renderCheckbox}
            fullWidth
            label={localMessages.staticLabel}
            helpertext={localMessages.staticLabel}
            onChange={updateFields}
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <Field
            name="showOnMedia"
            component={renderCheckbox}
            fullWidth
            label={localMessages.showOnMediaLabel}
            disabled={initialValues.disabled}
          />
        </Col>
      </Row>
    </div>
  );
};

CollectionDetailsForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func,
  initialValues: PropTypes.object,
  updateFields: PropTypes.func,
};

const reduxFormConfig = {
  form: 'collectionForm',
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        CollectionDetailsForm
      )
    )
  );
