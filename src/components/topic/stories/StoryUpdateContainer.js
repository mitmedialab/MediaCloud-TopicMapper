import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import { fetchMetadataValuesForPrimaryLanguage } from '../../../actions/systemActions'; // TODO relocate metadata actions into system if we use more often...
import { selectStory, fetchStory, updateStory } from '../../../actions/storyActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import StoryDetailForm from '../../common/admin/form/StoryDetailForm';
import { updateFeedback } from '../../../actions/appActions';
import { TAG_SET_PRIMARY_LANGUAGE } from '../../../lib/tagUtil';

const localMessages = {
  title: { id: 'story.details.edit.title', defaultMessage: 'Edit Story Details' },
  feedback: { id: 'story.details.edit.feedback', defaultMessage: 'Story Updates saved' },
};

class StoryUpdateContainer extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { refetchAsyncData } = this.props;
    if (nextProps.storiesId !== this.props.storiesId) {
      refetchAsyncData(nextProps);
    }
  }

  handleReadItClick = () => {
    const { story } = this.props;
    window.open(story.url, '_blank');
  }

  handleEditClick = () => {
    const { story } = this.props;
    window.open(story.url, '_blank');
    // dispatch update story link
  }

  render() {
    const { story, storiesId, onSave, tags } = this.props;
    const lang = tags.map(c => c.tag).sort((f1, f2) => { // alphabetical
      // const f1Name = f1.toUpperCase();
      // const f2Name = f2.toUpperCase();
      if (f1 < f2) return -1;
      if (f1 > f2) return 1;
      return 0;
    });
    return (
      <div>
        <Grid>
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.title} /></h1>
            </Col>
          </Row>
          <Row>
            <Col lg={6} xs={12}>
              <StoryDetailForm story={story} initialValues={story} language={lang} storiesId={storiesId} onSave={onSave} buttonLabel="save" />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

StoryUpdateContainer.propTypes = {
  // from context
  params: PropTypes.object.isRequired, // params from router
  intl: PropTypes.object.isRequired,
  // from parent
  // from dispatch
  refetchAsyncData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  // from state
  story: PropTypes.object.isRequired,
  storiesId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  tags: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.story.info.fetchStatus,
  storiesId: parseInt(ownProps.params.storiesId, 10),
  topicId: parseInt(ownProps.params.topicId, 10),
  story: state.story.info,
  tags: state.system.metadata.primaryLanguage.tags,
});


const fetchAsyncData = (dispatch, props) => {
  dispatch(selectStory({ id: props.storiesId }));
  dispatch(fetchStory(props.topicId, props.storiesId));
  dispatch(fetchMetadataValuesForPrimaryLanguage(TAG_SET_PRIMARY_LANGUAGE));
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  refetchAsyncData: (props) => {
    fetchAsyncData(dispatch, props);
  },
  onSave: (storyInfo) => {
    dispatch(updateStory(storyInfo.stories_id, storyInfo))
      .then((result) => {
        if (result.success === 1) {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          dispatch(push(`/topics/${ownProps.params.topicId}/stories/${ownProps.params.storiesId}`));
        }
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      StoryUpdateContainer
    )
  )
);
