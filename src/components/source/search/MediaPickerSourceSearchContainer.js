import PropTypes from 'prop-types';
import React from 'react';
import { Grid } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { PICK_SOURCE_AND_COLLECTION } from '../../../lib/explorerUtil';
import composeMediaPickerSidebarContainer from '../../common/mediaPicker/MediaPickerSidebarContainer';
import PickedMediaContainer from '../../common/mediaPicker/PickedMediaContainer';
import MediaPickerResultsContainer from '../../common/mediaPicker/MediaPickerResultsContainer';

const MediaPickerSourceSearchContainer = () => (
  <Grid>
    <div className="select-media-sources">
      <div className="select-media-sidebar-sources">
        <PickedMediaContainer viewOnly selectedMediaQueryType={PICK_SOURCE_AND_COLLECTION} />
      </div>
      <div className="select-media-content-sources">
        <MediaPickerResultsContainer viewOnly selectedMediaQueryType={PICK_SOURCE_AND_COLLECTION} />
      </div>
    </div>
  </Grid>
);

MediaPickerSourceSearchContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent/implementer
  initMedia: PropTypes.array,
  handleInitialSelectionOfMedia: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setQueryFormChildDialogOpen: PropTypes.func,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  onFormChange: PropTypes.func,
  // from state
  selectedMedia: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 1,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
});

export default
injectIntl(
  connect(mapStateToProps)(
    composeMediaPickerSidebarContainer()(
      MediaPickerSourceSearchContainer
    )
  )
);
