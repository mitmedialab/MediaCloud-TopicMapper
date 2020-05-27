import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import AppButton from '../../../../common/AppButton';
import { uploadPlatformGenericCsvFile } from '../../../../../actions/topicActions';
import { updateFeedback } from '../../../../../actions/appActions';

const localMessages = {
  feedbackGood: { id: 'platform.generic.csv.feedback.worked', defaultMessage: 'This CSV is valid' },
  feedbackBad: { id: 'platform.generic.csv.feedback.failed', defaultMessage: 'The isn\'t valid ({message}).' },
  csvFile: { id: 'platform.generic.csv.file', defaultMessage: 'CSV file' },
  validate: { id: 'platform.generic.csv.validate', defaultMessage: 'Validate Format' },
};

class EditGenericCsvForm extends React.Component {
  constructor(props) {
    super(props);
    this.csvFileRef = React.createRef();
  }

  handleFileChange = () => {
    const { topicId, uploadFile, change } = this.props;
    const fd = this.csvFileRef.current.files[0];
    uploadFile(topicId, fd, change);
  }

  render() {
    const { intl } = this.props;
    const validateButton = <AppButton label={intl.formatMessage(localMessages.validate)} color="primary" onClick={this.handleFileChange} />;
    return (
      <Row>
        <Col lg={12}>
          <div>
            <label htmlFor="csvFile"><FormattedMessage {...localMessages.csvFile} /></label>
            <input
              name="csvFile"
              type="file"
              ref={this.csvFileRef}
            />
            {validateButton}
          </div>
        </Col>
      </Row>
    );
  }
}

EditGenericCsvForm.propTypes = {
  // from parent
  initialValues: PropTypes.object,
  onEnterKey: PropTypes.func,
  // from state:
  topicId: PropTypes.number.isRequired,
  // from dispatch
  onFormChange: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
};

const mapStateToProps = (state) => ({
  topicId: state.topics.selected.id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  uploadFile: (topicId, file, change) => {
    dispatch(uploadPlatformGenericCsvFile(topicId, { file }))
      .then((results) => {
        if (results.status === 'Error') {
          return dispatch(updateFeedback({
            classes: 'error-notice',
            open: true,
            message: ownProps.intl.formatMessage(localMessages.feedbackBad, { message: results.message }),
          }));
        }
        if (results.status === 'Success') {
          dispatch(change('query', results.filename));
          return dispatch(updateFeedback({
            classes: 'info-notice',
            open: true,
            message: ownProps.intl.formatMessage(localMessages.feedbackGood),
          }));
        }
        return null;
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        EditGenericCsvForm
      )
    )
  )
);
