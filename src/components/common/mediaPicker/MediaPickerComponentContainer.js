import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import messages from '../../../resources/messages';
import composeMediaPickerSidebarContainer from './MediaPickerSidebarContainer';
import PickedMediaContainer from './PickedMediaContainer';
import MediaPickerResultsContainer from './MediaPickerResultsContainer';
import AppButton from '../AppButton';
// import { ALL_MEDIA } from '../../../lib/mediaUtil';

class MediaPickerComponentContainer extends React.Component {
  render() {
    const { selectedMedia, onConfirmSelection } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    content = (
      <div>
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
  onConfirmSelection: PropTypes.func,
  // from state
  selectedMedia: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.selectMedia.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list, // initially empty
});

export default
injectIntl(
  connect(mapStateToProps)(
    composeMediaPickerSidebarContainer()(
      MediaPickerComponentContainer
    )
  )
);
