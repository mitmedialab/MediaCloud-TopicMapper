import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import withIntlForm from '../../../../../common/hocs/IntlForm';
import messages from '../../../../../../resources/messages';
import PartisanCoveragePreviewContainer from './PartisanCoveragePreviewContainer';
import PartisanshipStoryCountsPreviewContainer from './PartisanshipStoryCountsPreviewContainer';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Step 2: Preview Subtopics by {analysisType}' },
  about2016: { id: 'focus.create.edit.about',
    defaultMessage: 'This will create a set of subtopics driven by our analysis of Twitter followers of Trump and Clinton during the 2016 election season. Each media source is scored based on the ratio of shares of their stories in those two groups. For instance, if their stories are almost completely shared by Trump retweeters and not by Clinton retweeters, then that media source will be assigned to the "right" subtopic. This covers around 1000 media sources, so it is likely it will not cover all the media sources in your Topic.' },
  about2019: { id: 'focus.create.edit.about',
    defaultMessage: 'This will create a set of subtopics driven by our analysis of the urls shared by partisan users on Twitter during 2019. To analyze the partisanship of each media source, we first assign a partisanship score to each of a sample of millions of Twitter users based on the widely used {dwNominateLink} score of each politician that the user follows. We then assign a partisanship score to each media source based on the average partisanship of the users who share urls belonging to that media source. Finally, we divide those partisanship scores into quintile buckets -- left, center left, center, center right, and right. For instance, Daily Kos is categorized as left because, within our sample of Twitter users who follow politicians, the vast majority of Daily Kos urls are shared by users who follow politicians with a liberal DW-NOMINATE score. Using this method, we have categorized over thirteen thousand media sources into one of the five partisan buckets.' },
};

const EditPartisanshipContainer = (props) => {
  const { topicId, year, analysisType, onPreviousStep, handleSubmit, finishStep } = props;
  const { formatMessage } = props.intl;
  return (
    <Grid>
      <form className="focus-create-edit-retweet" name="focusCreateEditRetweetForm" onSubmit={handleSubmit(finishStep.bind(this))}>
        <Row>
          <Col lg={8} md={12}>
            <h1><FormattedMessage {...localMessages.title} values={{ analysisType, year }} /></h1>
            <p><FormattedMessage {...localMessages[`about${year}`]} values={{ dwNominateLink: <a href="https://voteview.com/about">DW_NOMINATE</a> }} /></p>
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <PartisanCoveragePreviewContainer topicId={topicId} year={year} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <PartisanshipStoryCountsPreviewContainer topicId={topicId} year={year} />
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

EditPartisanshipContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  analysisType: PropTypes.string.isRequired,
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
        EditPartisanshipContainer
      )
    )
  )
);
