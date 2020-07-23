import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import RetweetCoveragePreviewContainer from './RetweetCoveragePreviewContainer';
import RetweetStoryCountsPreviewContainer from './RetweetStoryCountsPreviewContainer';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Preview Subtopics by Retweet Partisanship {year}' },
  about2016: { id: 'focus.create.edit.about',
    defaultMessage: 'This will create a set of subtopics driven by our analysis of Twitter followers of Trump and Clinton during the 2016 election season.  Each media soure is scored based on the ratio of retweets of their stories in those two groups.  For instance, if their stories are almost completely retweeted by Trump followers on Twitter, then that media source will be assigned to the "right" subtopic.  This covers the 1000 most tweeted media sources, so it is likely it will not cover all the media sources in your Topic.' },
  about2020: { id: 'focus.create.edit.about',
    defaultMessage: 'TODO: TBD' },
};

const EditRetweetPartisanshipContainer = (props) => {
  const { topicId, year, onPreviousStep, handleSubmit, finishStep } = props;
  const { formatMessage } = props.intl;
  return (
    <Grid>
      <form className="focus-create-edit-retweet" name="focusCreateEditRetweetForm" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={8} md={12}>
            <h1><FormattedMessage {...localMessages.title} values={{ year }} /></h1>
            <p><FormattedMessage {...localMessages[`about${year}`]} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <RetweetCoveragePreviewContainer topicId={topicId} year={year} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <RetweetStoryCountsPreviewContainer topicId={topicId} year={year} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={12}>
            <br />
            <AppButton color="secondary" variant="outlined" onClick={onPreviousStep} label={formatMessage(messages.previous)} />
            &nbsp; &nbsp;
            <AppButton type="submit" label={formatMessage(messages.next)} primary />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

EditRetweetPartisanshipContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onPreviousStep: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: () => {
    ownProps.onNextStep({});
  },
});

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // so the wizard works
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        EditRetweetPartisanshipContainer
      )
    )
  )
);
