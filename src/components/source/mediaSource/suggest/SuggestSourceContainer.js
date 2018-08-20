import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { reduxForm, reset } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../common/hocs/IntlForm';
import SourceSuggestionForm from './SourceSuggestionForm';
import PickCollectionsForm from '../form/PickCollectionsForm';
import { emptyString } from '../../../../lib/formValidators';
import { suggestSource } from '../../../../actions/sourceActions';
import { updateFeedback } from '../../../../actions/appActions';
import AppButton from '../../../common/AppButton';

const localMessages = {
  mainTitle: { id: 'source.suggest.maintitle', defaultMessage: 'Suggest A Source' },
  intro: { id: 'source.suggest.intro', defaultMessage: 'Don\'t see a media source in our database that you are looking for? Use this form to suggest the source and we\'ll see if we can add it.  You\'ll get an email when we review your suggestion.' },
  addButton: { id: 'source.suggest.saveAll', defaultMessage: 'Submit Suggestion' },
  feedback: { id: 'source.suggest.feedback.success', defaultMessage: 'We submitted your suggestion and will email you.' },
  errorFeedback: { id: 'source.suggest.feedback.error', defaultMessage: 'Sorry, it didn\'t work :-(' },
  missingUrl: { id: 'source.suggest.missingUrl', defaultMessage: 'You need to enter a homepage URL.' },
};

const SuggestSourceContainer = (props) => {
  const { initialValues, pristine, submitting, handleSubmit, handleSave } = props;
  const { formatMessage } = props.intl;
  const titleHandler = formatMessage(localMessages.mainTitle);
  return (
    <div>
      <Helmet><title>{titleHandler}</title></Helmet>
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.mainTitle} /></h1>
            <p><FormattedMessage {...localMessages.intro} /></p>
          </Col>
        </Row>
        <form name="suggestionForm" onSubmit={handleSubmit(handleSave.bind(this))}>
          <SourceSuggestionForm initialValues={initialValues} />
          <PickCollectionsForm form="suggestionForm" />
          <Row>
            <Col lg={12}>
              <AppButton
                type="submit"
                style={{ marginTop: 30 }}
                label={formatMessage(localMessages.addButton)}
                disabled={pristine || submitting}
                color="primary"
              />
            </Col>
          </Row>
        </form>
      </Grid>
    </div>
  );
};

SuggestSourceContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from dispatch
  handleSave: PropTypes.func.isRequired,
  // from form healper
  initialValues: PropTypes.object,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.url)) {
    errors.email = localMessages.missingUrl;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'suggestionForm',
  validate,
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSave: (values) => {
    const infoToSave = {
      url: values.url,
      name: (values.name) || null,
      feedurl: (values.feedurl) || null,
      reason: (values.reason) || null,
    };
    if ('collections' in values) {  // the collections are a FieldArray on the form
      infoToSave['collections[]'] = values.collections.map(s => s.id);
    } else {
      infoToSave['collections[]'] = [];
    }// try to save it
    return dispatch(suggestSource(infoToSave))
      .then((results) => {
        if (results.success === 1) {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          dispatch(reset('suggestionForm')); // empty it so they don't resubmit by accident
        } else {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.errorFeedback) }));
        }
      });
  },
});

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        connect(mapStateToProps, mapDispatchToProps)(
         SuggestSourceContainer
        )
      )
    )
  );
