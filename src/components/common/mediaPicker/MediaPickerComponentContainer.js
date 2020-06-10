import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import messages from '../../../resources/messages';
import PickedMediaContainer from './PickedMediaContainer';
import MediaPickerResultsContainer from './MediaPickerResultsContainer';
import { initializePreviouslySelectedMedia, clearSelectedMedia, resetMetadataShortlist } from '../../../actions/systemActions';
import AppButton from '../AppButton';
// import { ALL_MEDIA } from '../../../lib/mediaUtil';

class MediaPickerComponentContainer extends React.Component {
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

  render() {
    const { selectedMedia, onConfirmSelection } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    content = (
      <div>
        <div className="select-media-dialog-inner">
          <div className="select-media-sidebar">
            <PickedMediaContainer
              selectedMedia={selectedMedia}
            />
            <AppButton
              className="select-media-ok-button"
              label={formatMessage(messages.ok)}
              onClick={() => onConfirmSelection(true)}
              type="submit"
              primary
            />
            <AppButton
              className="select-media-cancel-button"
              label={formatMessage(messages.cancel)}
              onClick={() => onConfirmSelection(false)}
              type="submit"
            />
          </div>
          <div className="select-media-content">
            <MediaPickerResultsContainer
              selectedMedia={selectedMedia}
            />
          </div>
        </div>
      </div>
    );

    return content;
  }
}

MediaPickerComponentContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent/implementer
  initMedia: PropTypes.array,
  handleInitialSelectionOfMedia: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setQueryFormChildDialogOpen: PropTypes.func,
  onConfirmSelection: PropTypes.func,
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
    MediaPickerComponentContainer
  )
);
