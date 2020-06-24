import PropTypes from 'prop-types';
import React from 'react';
import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { selectMediaPickerQueryArgs, selectMedia, unselectMedia, clearSelectedMedia, resetMetadataShortlist, resetMediaPickerSources, resetMediaPickerCollections } from '../../../actions/systemActions';
import { PICK_SOURCE_AND_COLLECTION, PICK_FEATURED } from '../../../lib/explorerUtil';
import OpenWebMediaItem from '../OpenWebMediaItem';
import { ALL_MEDIA } from '../../../lib/mediaUtil';
import messages from '../../../resources/messages';

const localMessages = {
  pickSAndC: { id: 'system.mediaPicker.select.pickSources', defaultMessage: 'Search Sources & Collections' },
  selectedMedia: { id: 'system.mediaPicker.selected.title', defaultMessage: 'Selected Media' },
  pickFeatured: { id: 'system.mediaPicker.select.pickFeatured', defaultMessage: 'Browse Featured & Starred' },
  searchAllMedia: { id: 'system.mediaPicker.selected.allMedia', defaultMessage: 'Search All Media' },
  clear: { id: 'system.mediaPicker.selected.clear', defaultMessage: 'Clear All' },
};

class PickedMediaContainer extends React.Component {
  state = {
    anchorEl: null,
  };

  updateMediaType = (menuSelection) => {
    const { updateMediaQueryArgsSelection } = this.props;
    updateMediaQueryArgsSelection({ type: menuSelection });
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  setAllMedia = () => {
    const { updateMediaQueryArgsSelection, selectedMediaQueryArgs } = this.props;
    const { formatMessage } = this.props.intl;
    updateMediaQueryArgsSelection({ ...selectedMediaQueryArgs, allMedia: true, label: formatMessage(messages.allMediaNotAdvised) });
  };

  render() {
    const { selectedMediaQueryType, selectedMedia, handleUnselectMedia, handleClearAll, viewOnly } = this.props;
    const options = [
      { label: localMessages.pickFeatured, value: PICK_FEATURED },
      { label: localMessages.pickSAndC, value: PICK_SOURCE_AND_COLLECTION },
    ];

    const allMedia = (
      <Menu
        id="all-media-menu"
        open={Boolean(this.state.anchorEl)}
        anchorEl={this.state.anchorEl}
        onClose={this.handleClose}
      >
        <MenuItem onClick={() => { this.handleClose(); this.setAllMedia(); }}>
          <FormattedMessage {...localMessages.searchAllMedia} />
        </MenuItem>
        <MenuItem onClick={() => { this.handleClose(); handleClearAll(); }}>
          <FormattedMessage {...localMessages.clear} />
        </MenuItem>
      </Menu>
    );
    let warningInfo = null;
    let selectedMediaContent = null;
    if (!selectedMedia || (selectedMedia && selectedMedia.length === 0)) {
      warningInfo = (
        <div className="media-picker-no-media-warning">
          <FormattedMessage {...messages.noMedia} />
        </div>
      );
    }
    selectedMediaContent = (
      <div className="select-media-selected-list">
        <FormattedMessage {...localMessages.selectedMedia} />
        <IconButton className="select-media-options" onClick={this.handleClick} aria-haspopup="true" aria-owns="logged-in-header-menu"><MoreVertIcon /></IconButton>
        { allMedia }
        {selectedMedia && selectedMedia.length > 0 && selectedMedia.map(obj => (
          <OpenWebMediaItem
            key={obj.id || obj.tags_id || obj.media_id || obj.tag_sets_id || obj.tags.name}
            object={obj}
            onDelete={() => handleUnselectMedia(obj)}
          />
        ))}
        { warningInfo }
      </div>
    );

    return (
      <div>
        <div className="select-media-menu">
          {options.map((option, idx) => (
            <a
              key={option.value}
              href="#select"
              onClick={(evt) => {
                evt.preventDefault();
                this.updateMediaType(option.value);
              }}
            >
              <div
                key={idx}
                className={`select-media-option ${(selectedMediaQueryType === option.value) ? 'selected' : ''}`}
              >
                <h3><FormattedMessage {...option.label} /></h3>
              </div>
            </a>
          ))}
        </div>
        { !viewOnly && selectedMediaContent }
      </div>
    );
  }
}

PickedMediaContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  selectedMedia: PropTypes.array,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryArgs: PropTypes.object,
  updateMediaQueryArgsSelection: PropTypes.func.isRequired,
  handleUnselectMedia: PropTypes.func.isRequired,
  handleClearAll: PropTypes.func.isRequired,
  viewOnly: PropTypes.bool,
};

const mapStateToProps = state => ({
  sourcesResults: state.system.mediaPicker.media ? state.system.mediaPicker.media.results : null, // resutl of query?
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryArgs: state.system.mediaPicker.selectMediaQuery.args,
  collectionsResults: state.system.mediaPicker.collections ? state.system.mediaPicker.collections.results : null,
  favoritedCollections: state.system.mediaPicker.favoritedCollections ? state.system.mediaPicker.favoritedCollections.results : null,
  favoritedSources: state.system.mediaPicker.favoritedSources ? state.system.mediaPicker.favoritedSources.results : null,
});

const mapDispatchToProps = dispatch => ({
  updateMediaQueryArgsSelection: (values) => {
    if (values.type >= 0) {
      dispatch(selectMediaPickerQueryArgs(values.type));
    }
    dispatch(resetMediaPickerSources());
    dispatch(resetMediaPickerCollections());
    dispatch(resetMetadataShortlist());
    if (values.allMedia) { // handle the "all media" placeholder selection
      dispatch(selectMediaPickerQueryArgs({ media_keyword: values.mediaKeyword, type: values.type, allMedia: true }));
      dispatch(clearSelectedMedia());
      dispatch(selectMedia({ label: values.label, id: ALL_MEDIA }));
    } else {
      dispatch(selectMediaPickerQueryArgs({ media_keyword: values.mediaKeyword, type: values.type, tags: { ...values.tags } }));
    }
  },
  handleUnselectMedia: (selectedMedia) => {
    if (selectedMedia) {
      let unselectedMedia = {};
      if (selectedMedia.id) { // if this is a source or collection
        unselectedMedia = { ...selectedMedia, selected: false };
      } else { // if this is a search composite
        unselectedMedia.tags = {};
        unselectedMedia.addAllSearch = false;
        unselectedMedia.selected = false;
      }
      dispatch(unselectMedia(unselectedMedia));
    }
  },
  handleClearAll: () => {
    dispatch(clearSelectedMedia());
    dispatch(resetMetadataShortlist());
  },
});


export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    PickedMediaContainer
  )
);
