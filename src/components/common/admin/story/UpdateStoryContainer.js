import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid } from 'react-flexbox-grid/lib';
import withAsyncData from '../../hocs/AsyncDataContainer';
import { fetchStory, selectStory, updateStory } from '../../../../actions/storyActions';
import { fetchMetadataValuesForPrimaryLanguage } from '../../../../actions/systemActions'; // TODO relocate metadata actions into system if we use more often...
import { updateFeedback } from '../../../../actions/appActions';
import StoryDetailForm from '../form/StoryDetailForm';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import Permissioned from '../../Permissioned';
import { TAG_SET_PRIMARY_LANGUAGE } from '../../../../lib/tagUtil';

const localMessages = {
  userTitle: { id: 'user.details.title', defaultMessage: '{name}: ' },
  updateTitle: { id: 'user.details.title.update', defaultMessage: 'Update Story' },
  updateButton: { id: 'user.deatils.update.button', defaultMessage: 'Update' },
  feedback: { id: 'user.deatils.feedback', defaultMessage: 'Successfully updated this story.' },
};

const UpdateStoryContainer = (props) => {
  const { story, handleSave, tags } = props;
  const { formatMessage } = props.intl;
  const content = null;
  const lang = tags.map(c => c.tag).sort((f1, f2) => { // alphabetical
    // const f1Name = f1.toUpperCase();
    // const f2Name = f2.toUpperCase();
    if (f1 < f2) return -1;
    if (f1 > f2) return 1;
    return 0;
  });
  if (story === undefined) {
    return (
      <div>
        { content }
      </div>
    );
  }
  return (
    <Grid className="details story-details">
      <h1>
        <FormattedMessage {...localMessages.updateTitle} />
      </h1>
      <Permissioned onlyRole={PERMISSION_ADMIN}>
        <StoryDetailForm
          story={story}
          language={lang}
          initialValues={story}
          onSave={handleSave}
          buttonLabel={formatMessage(localMessages.updateButton)}
        />
      </Permissioned>
    </Grid>
  );
};

UpdateStoryContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleSave: PropTypes.func.isRequired,
  // from context
  params: PropTypes.object.isRequired, // params from router
  // from state
  fetchStatus: PropTypes.string.isRequired,
  story: PropTypes.object,
  tags: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.info.fetchStatus,
  story: state.story.info,
  tags: state.system.metadata.primaryLanguage.tags,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSave: (values) => {
    const infoToSave = {
      ...values,
      undateable: values.undateable || false,
    };
    return dispatch(updateStory(ownProps.params.id, infoToSave))
      .then((result) => {
        if (result.success) {
          // let them know it worked
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          // need to fetch it again because something may have changed
          window.location.reload();
        }
      });
  },
});

const fetchAsyncData = (dispatch, { params }) => {
  dispatch(fetchMetadataValuesForPrimaryLanguage(TAG_SET_PRIMARY_LANGUAGE));
  dispatch(selectStory({ id: params.id }));
  dispatch(fetchStory(params.id));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['params'])(
      UpdateStoryContainer
    )
  )
);
