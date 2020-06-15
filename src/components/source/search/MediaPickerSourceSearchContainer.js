import PropTypes from 'prop-types';
import React from 'react';
import { Grid } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeMediaPickerSidebarContainer from '../../common/mediaPicker/MediaPickerSidebarContainer';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import PickedMediaContainer from '../../common/mediaPicker/PickedMediaContainer';
import MediaPickerResultsContainer from '../../common/mediaPicker/MediaPickerResultsContainer';
import { ALL_MEDIA } from '../../../lib/mediaUtil';
import { selectMediaPickerQueryArgs, fetchMediaPickerSources } from '../../../actions/systemActions';

class MediaPickerSourceSearchContainer extends React.Component {
  handleConfirmSelection = (confirm) => {
    const { onFormChange, selectedMedia, setQueryFormChildDialogOpen, reset } = this.props;
    if (confirm) {
      const allTest = selectedMedia.filter(m => m.id === ALL_MEDIA);
      if (allTest.length > 0) {
        onFormChange('media', allTest); // if selected, this takes precedence
      } else {
        onFormChange('media', selectedMedia); // passed in from containing element
      }
    }
    reset();
    if (setQueryFormChildDialogOpen) {
      setQueryFormChildDialogOpen(false);
    }
  };

  render() {
    const { selectedMedia } = this.props;
    return (
      <Grid>
        <div className="select-media-sources">
          <div className="select-media-sidebar-sources">
            <PickedMediaContainer viewOnly selectedMedia={selectedMedia} />
          </div>
          <div className="select-media-content-sources">
            <MediaPickerResultsContainer viewOnly selectedMedia={selectedMedia} />
          </div>
        </div>
      </Grid>
    );
  }
}

MediaPickerSourceSearchContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent/implementer
  initMedia: PropTypes.array,
  handleInitialSelectionOfMedia: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setQueryFormChildDialogOpen: PropTypes.func,
  selectedMediaQueryType: PropTypes.object,
  selectedMediaQueryKeyword: PropTypes.object,
  onFormChange: PropTypes.func,
  // from state
  selectedMedia: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list, // initially empty
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 1,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
});

const fetchAsyncData = (dispatch, ownProps) => {
  dispatch(selectMediaPickerQueryArgs({ media_keyword: (ownProps.mediaKeyword || '*'), which_set: 2, type: 1, linkId: 0 }));
  dispatch(fetchMediaPickerSources({ media_keyword: (ownProps.mediaKeyword || '*'), tags: (ownProps.allMedia ? -1 : 0), linkId: 0 }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      composeMediaPickerSidebarContainer()(
        MediaPickerSourceSearchContainer
      )
    )
  )
);
