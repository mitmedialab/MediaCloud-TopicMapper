import PropTypes from 'prop-types';
import React from 'react';
import { Grid } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PickedMediaContainer from '../../common/mediaPicker/PickedMediaContainer';
import MediaPickerResultsContainer from '../../common/mediaPicker/MediaPickerResultsContainer';
import { initializePreviouslySelectedMedia, clearSelectedMedia, resetMetadataShortlist } from '../../../actions/systemActions';
import { ALL_MEDIA } from '../../../lib/mediaUtil';

class MediaPickerSourceSearchContainer extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    // select the media so we fill the reducer with the previously selected media
    const { initMedia, handleInitialSelectionOfMedia } = this.props;
    if (JSON.stringify(initMedia) !== JSON.stringify(nextProps.initMedia)) {
      if (nextProps.initMedia) { // expects an array of media from caller
        handleInitialSelectionOfMedia(nextProps.initMedia);
      }
    }
    if ((nextProps.selectedMedia !== this.props.selectedMedia)
      || (nextProps.selectedMedia && this.props.selectedMedia && nextProps.selectedMedia.length !== this.props.selectedMedia.length)) {
      // if the results have changed from a keyword entry, we need to update the UI
      this.shouldComponentUpdate(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    if ((nextProps.selectedMedia !== this.props.selectedMedia)
      || (nextProps.selectedMedia && this.props.selectedMedia && nextProps.selectedMedia.length !== this.props.selectedMedia.length)) {
      // if the results have changed from a keyword entry, we need to update the UI
      return true;
    }
    return true;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

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
    return (
      <Grid>
        <div className="select-media-sources">
          <div className="select-media-sidebar-sources">
            <PickedMediaContainer viewOnly selectedMedia={[]} />
          </div>
          <div className="select-media-content-sources">
            <MediaPickerResultsContainer viewOnly selectedMedia={[]} />
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
  onFormChange: PropTypes.func,
  // from state
  selectedMedia: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.selectMedia.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list, // initially empty
});

const mapDispatchToProps = dispatch => ({
  reset: () => {
    dispatch(clearSelectedMedia());
    dispatch(resetMetadataShortlist());
  },
  handleInitialSelectionOfMedia: (prevSelectedMedia) => {
    if (prevSelectedMedia) {
      dispatch(initializePreviouslySelectedMedia(prevSelectedMedia)); // disable button too
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    MediaPickerSourceSearchContainer
  )
);
