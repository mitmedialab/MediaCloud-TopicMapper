import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import { fetchMetadataValuesForPrimaryLanguage } from '../../../actions/systemActions'; // TODO relocate metadata actions into system if we use more often...
import { selectStory, fetchStory, updateStory } from '../../../actions/storyActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import StoryDetailForm from './StoryDetailForm';
import messages from '../../../resources/messages';
import { updateFeedback } from '../../../actions/appActions';
import { TAG_SET_PRIMARY_LANGUAGE } from '../../../lib/tagUtil';


const localMessages = {
  feedback: { id: 'story.details.feedback', defaultMessage: 'Story Updates saved' },
};
class StoryUpdateContainer extends React.Component {

  state = {
    open: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.storiesId !== this.props.storiesId) {
      const { fetchData } = this.props;
      fetchData(nextProps.storiesId);
    }
  }

  handleRemoveClick = () => {
    this.setState({ open: true });
  };

  handleRemoveDialogClose = () => {
    this.setState({ open: false });
  };

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
    const { formatMessage } = this.props.intl;
    const titleHandler = `${formatMessage(messages.storyTitle)}: ${story.title}`;
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
            <h2>{titleHandler}</h2>
          </Row>
          <Row>
            <Col lg={6} xs={12} >
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
  params: PropTypes.object.isRequired,       // params from router
  intl: PropTypes.object.isRequired,
  // from parent
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(selectStory(ownProps.params.storiesId));
    dispatch(fetchStory(ownProps.params.topicId, ownProps.params.storiesId));
    dispatch(fetchMetadataValuesForPrimaryLanguage(TAG_SET_PRIMARY_LANGUAGE));
  },
  fetchData: (storiesId) => {
    dispatch(selectStory(storiesId));
    dispatch(fetchStory(ownProps.params.topicId, ownProps.params.storiesId));
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
      withAsyncFetch(
        injectIntl(
          StoryUpdateContainer
        )
      )
    )
  );
