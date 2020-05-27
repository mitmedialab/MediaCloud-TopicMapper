import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import messages from '../../../../../resources/messages';
import MediaPickerDialog from '../../../../common/mediaPicker/MediaPickerDialog';
import QueryHelpDialog from '../../../../common/help/QueryHelpDialog';
import OpenWebMediaFieldArray from '../../../../common/form/OpenWebMediaFieldArray';

const EditOpenWebForm = ({ initialValues, renderSolrTextField, intl, onFormChange }) => (
  <>
    <Row>
      <Col lg={6}>
        <label htmlFor="query"><FormattedMessage {...messages.query} /></label>
        <Row>
          <Col lg={12}>
            <div>
              <Field
                className="query-field"
                name="query"
                component={renderSolrTextField}
                multiline
                rows={2}
                rowsMax={4}
                fullWidth
              />
              <small>
                <b><QueryHelpDialog trigger={intl.formatMessage(messages.queryHelpLink)} /></b>
              </small>
            </div>
          </Col>
        </Row>
      </Col>
      <Col lg={6}>
        <div className="media-field-wrapper">
          <label htmlFor="media"><FormattedMessage {...messages.topicSourceCollectionsProp} /></label>
          <OpenWebMediaFieldArray
            formatMessage={intl.formatMessage}
            className="query-field"
            form="platform"
            enableReinitialize
            keepDirtyOnReinitialize
            destroyOnUnmount={false}
            fieldName="media"
            initialValues={initialValues} // to and from MediaPicker
            allowRemoval
            onDelete={onFormChange}
          />
          <MediaPickerDialog
            initMedia={initialValues.media} // {selected.media ? selected.media : cleanedInitialValues.media}
            onConfirmSelection={selections => onFormChange('media', selections)}
          />
        </div>
      </Col>
    </Row>
  </>
);

EditOpenWebForm.propTypes = {
  // from parent
  initialValues: PropTypes.object,
  onEnterKey: PropTypes.func,
  // from state
  change: PropTypes.func.isRequired,
  // from dispatch
  onFormChange: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  renderSolrTextField: PropTypes.func.isRequired,
  handleMediaDelete: PropTypes.func,
};

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      EditOpenWebForm
    )
  )
);
