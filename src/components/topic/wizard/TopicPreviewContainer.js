import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import TopicCreatePreview from './preview/TopicCreatePreview';
import { topicQueryAsString } from '../../util/topicUtil';

const localMessages = {
  prev: { id: 'topic.create.preview.prev', defaultMessage: 'back to seed query' },
  next: { id: 'topic.create.preview.next', defaultMessage: 'Validate Some Stories' },
};

const TopicPreviewContainer = (props) => {
  const { onStepChange, formData, mode, currentStepText } = props;
  const { formatMessage } = props.intl;
  if (formData !== undefined) {
    const content = (
      <TopicCreatePreview
        formData={{
          ...formData,
          solr_seed_query: topicQueryAsString(formData.solr_seed_query),
        }}
      />
    );
    return (
      <Grid>
        <h1 dangerouslySetInnerHTML={{ __html: currentStepText.title }} />
        <p dangerouslySetInnerHTML={{ __html: currentStepText.description }} />
        { content }
        <br />
        <Row>
          <Col lg={12} md={12} sm={12}>
            <AppButton variant="outlined" label={formatMessage(localMessages.prev)} onClick={() => onStepChange(mode, 0)} />
            &nbsp; &nbsp;
            <AppButton primary type="submit" label={formatMessage(localMessages.next)} onClick={() => onStepChange(mode, 2)} />
          </Col>
        </Row>
      </Grid>
    );
  } return (<div />);
};

TopicPreviewContainer.propTypes = {
  // from parent
  location: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  currentStepText: PropTypes.object,
  onStepChange: PropTypes.func.isRequired,
  // form composition
  intl: PropTypes.object.isRequired,
  // from state
  currentStep: PropTypes.number,
  // from form
  formData: PropTypes.object,
};

const mapStateToProps = state => ({
  currentStep: state.topics.modify.preview.workflow.currentStep,
  formData: state.form.topicForm.values,
});

export default
withIntlForm(
  connect(mapStateToProps)(
    TopicPreviewContainer
  )
);
