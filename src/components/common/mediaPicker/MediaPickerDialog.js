import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Modal from '@material-ui/core/Modal';
import DialogContent from '@material-ui/core/DialogContent';
import MediaPickerComponentContainer from './MediaPickerComponentContainer';
import { initializePreviouslySelectedMedia, clearSelectedMedia, resetMetadataShortlist } from '../../../actions/systemActions';
import AppButton from '../AppButton';
import { ALL_MEDIA } from '../../../lib/mediaUtil';

const localMessages = {
  title: { id: 'system.mediaPicker.select.title', defaultMessage: 'title' },
  intro: { id: 'system.mediaPicker.select.info',
    defaultMessage: '<p>This is an intro</p>' },
  helpTitle: { id: 'system.mediaPicker.select.help.title', defaultMessage: 'About Media' },
  selectMediaTitle: { id: 'system.mediaPicker.selectMediaTitle', defaultMessage: 'Select Media' },
  searchByName: { id: 'system.mediaPicker.select.searchby.name', defaultMessage: 'Search by Name/URL' },
  addMedia: { id: 'system.mediaPicker.select.addMedia', defaultMessage: 'Change/add media sources and collections' },
  pickMedia: { id: 'system.mediaPicker.select.pickMedia', defaultMessage: 'Pick Media' },
};

class MediaPickerDialog extends React.Component {
  state = {
    open: false,
  };

  UNSAFE_componentWillMount() { // only called on intial parent load -eg not when dialog pops up
    if (this.state.open) {
      window.scrollTo(0, 0);
    }
  }

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

  handleModifyClick = (initMedia) => {
    const { setQueryFormChildDialogOpen, handleInitialSelectionOfMedia } = this.props;
    this.setState({ open: true });
    handleInitialSelectionOfMedia(initMedia); // push into selectedMedia in store

    // document.body.style.overflow = 'hidden';
    if (setQueryFormChildDialogOpen) { // way to tell parent that a dialog is open - focus issue stuff
      setQueryFormChildDialogOpen(true);
    }
    // need to set body to overflow: hidden somehow...
  };

  handleRemoveDialogClose = (confirm) => {
    const { onConfirmSelection, selectedMedia, setQueryFormChildDialogOpen, reset } = this.props;
    this.setState({ open: false });
    if (confirm) {
      const allTest = selectedMedia.filter(m => m.id === ALL_MEDIA);
      if (allTest.length > 0) {
        onConfirmSelection(allTest); // if selected, this takes precedence
      } else {
        onConfirmSelection(selectedMedia); // passed in from containing element
      }
    }
    reset();
    if (setQueryFormChildDialogOpen) {
      setQueryFormChildDialogOpen(false);
    }
  };

  render() {
    const { initMedia, setQueryFormChildDialogOpen } = this.props;
    const { formatMessage } = this.props.intl;
    let modalContent = null;
    const containingEl = document.getElementById('mediaPicker') ? document.getElementById('mediaPicker') : document.getElementById('app');
    if (this.state.open) {
      modalContent = (
        <div>
          <Modal
            title={formatMessage(localMessages.selectMediaTitle)}
            open={this.state.open}
            onClose={() => this.handleRemoveDialogClose(false)}
          >
            <DialogContent className="select-media-dialog-wrapper">
              <MediaPickerComponentContainer setQueryFormChildDialogOpen={() => setQueryFormChildDialogOpen()} onConfirmSelection={(okOrCancel) => this.handleRemoveDialogClose(okOrCancel)} />
            </DialogContent>
          </Modal>
        </div>
      );
    }

    return (
      <div id="mediaPicker">
        {ReactDOM.createPortal(
          <div className="add-media">
            <AppButton
              onClick={() => this.handleModifyClick(initMedia)}
              tooltip={formatMessage(localMessages.addMedia)}
              label="Add Media"
            />
            {modalContent}
          </div>,
          containingEl
        )}
      </div>
    );
  }
}

MediaPickerDialog.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent/implementer
  initMedia: PropTypes.array,
  handleInitialSelectionOfMedia: PropTypes.func.isRequired,
  onConfirmSelection: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setQueryFormChildDialogOpen: PropTypes.func,
  elId: PropTypes.object,
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
    MediaPickerDialog
  )
);
