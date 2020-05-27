import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import AvailablePlatformList from './AvailablePlatformList';
import messages from '../../../resources/messages';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { deleteTopicPlatform, setTopicNeedsNewSnapshot, fetchPlatformsInTopicList, selectPlatform, fetchTopicSummary } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import IncompletePlatformWarning from './IncompletePlatformWarning';
import PlatformSizeNotice from './PlatformSizeNotice';
import VersionComparisonContainer from '../versions/VersionComparisonContainer';
import { filteredLinkTo } from '../../util/location';
import { MEDIA_CLOUD_SOURCE } from '../../../lib/platformTypes';
import * as fetchConstants from '../../../lib/fetchConstants';

const localMessages = {
  listTitle: { id: 'platform.list.title', defaultMessage: 'Platform Details' },
  platformManageAbout: { id: 'platform.manage.about', defaultMessage: 'empty' },
  removePlatform: { id: 'platform.manage.remove', defaultMessage: 'Remove Platform' },
  removeOk: { id: 'platform.manage.remove.ok', defaultMessage: 'Remove It' },
  removePlatformSucceeded: { id: 'platform.manage.remove.succeeded', defaultMessage: 'Removed the Platform' },
  removePlatformFailed: { id: 'platform.manage.remove.failed', defaultMessage: 'Sorry, but removing the platform failed :-(' },
  backToTopic: { id: 'backToTopic', defaultMessage: 'back to the topic' },
};

class ManagePlatformsContainer extends React.Component {
  state = {
    removeDialogOpen: false,
    platformToDelete: null,
  };

  onCancelDeletePlatform = () => {
    this.setState({ removeDialogOpen: false, platformToDelete: null });
  }

  onDeletePlatform = () => {
    const { topicId, handleDeletePlatform } = this.props;
    handleDeletePlatform(topicId, this.state.platformToDelete);
    this.setState({ removeDialogOpen: false, platformToDelete: null });
  }

  onEditPlatform = (platform) => {
    const { topicId, filters, handleSelectPlatform } = this.props;
    // filteredLinkTo link to edit wizard
    // in edit, we will find latest topic_seed_query for this platform
    handleSelectPlatform(
      { ...platform },
      filteredLinkTo(`/topics/${topicId}/platforms/${platform.topic_seed_queries_id}/edit`, filters)
    );
  }

  onNewPlatform = (platform) => {
    const { topicId, filters, handleSelectNewPlatform } = this.props;
    handleSelectNewPlatform(platform, filteredLinkTo(`/topics/${topicId}/platforms/create`, filters));
  }

  handleDelete = (platform) => {
    this.setState({ removeDialogOpen: true, platformToDelete: platform });
  }

  render() {
    const { platforms, platformsHaveChanged, titleMsg } = this.props;
    const { formatMessage } = this.props.intl;
    /* TODO get the latest platform info of each category if exists, relevantPlatforms = platform.map... */
    /* and, compare previous version with current to see if new platforms and if so, offer spider and generate */
    /* { new vs old platforms are different ? <PlatformComparisonContainer platforms={platforms} onEditClicked={this.onEditPlatform} onAddClicked={this.onNewPlatform} /> : '' }
    */
    let preventAdditions = false;
    let filteredPlatforms = platforms;
    // require that the mediasource platform is created first
    // to 'unlock' other platforms once we have a relevance query
    const incompleteWebPlatform = platforms.filter(p => p.topic_seed_queries_id !== -1 && p.source === MEDIA_CLOUD_SOURCE && p.query.indexOf('null') > -1);
    if (incompleteWebPlatform.length > 0) {
      filteredPlatforms = platforms.map(p => ({ ...p, isEnabled: (p.source === MEDIA_CLOUD_SOURCE) }));
      preventAdditions = true;
    }
    // sort in place so that the enabled platforms show up first
    filteredPlatforms.sort((p1, p2) => {
      if (!p1.isEnabled && p2.isEnabled) {
        return 1;
      }
      if (p1.isEnabled && !p2.isEnabled) {
        return -1;
      }
      return 0;
    });
    // sort in place so that the enabled platforms show up first
    filteredPlatforms.sort((p1, p2) => {
      if (p2.source === MEDIA_CLOUD_SOURCE) {
        return 1;
      }
      if (p1.source === MEDIA_CLOUD_SOURCE) {
        return -1;
      }
      return 0;
    });
    const h1Msg = titleMsg || messages.managePlatforms;
    return (
      <div>
        <IncompletePlatformWarning />
        <PlatformSizeNotice />
        <div className="manage-platforms">
          <Grid>
            <Row>
              <Col lg={10} xs={12}>
                <h1>
                  <FormattedMessage {...h1Msg} />
                </h1>
              </Col>
            </Row>
            {platformsHaveChanged && <VersionComparisonContainer />}
            <AvailablePlatformList
              platforms={filteredPlatforms}
              onEdit={this.onEditPlatform}
              onAdd={this.onNewPlatform}
              onDelete={this.handleDelete}
              preventAdditions={preventAdditions}
            />
          </Grid>
          <ConfirmationDialog
            open={this.state.removeDialogOpen}
            title={formatMessage(localMessages.removePlatform)}
            okText={formatMessage(localMessages.removeOk)}
            onCancel={this.onCancelDeletePlatform}
            onOk={this.onDeletePlatform}
          >
            <FormattedHTMLMessage {...localMessages.removePlatform} />
          </ConfirmationDialog>
        </div>
      </div>
    );
  }
}

ManagePlatformsContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from parent
  titleMsg: PropTypes.object, // alternate title
  // from state
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  platforms: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
  platformsHaveChanged: PropTypes.bool.isRequired,
  // from dispatch
  handleDeletePlatform: PropTypes.func.isRequired,
  handleSelectPlatform: PropTypes.func.isRequired,
  handleSelectNewPlatform: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  platforms: state.topics.selected.platforms.all.results,
  platformsHaveChanged: state.topics.selected.info.platformsHaveChanged,
  fetchStatus: state.topics.selected.platforms.all.fetchStatus,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDeletePlatform: (topicId, platform) => {
    // dispatch(selectPlatform({ topic_seed_queries_id: platformId, platformType }));
    dispatch(deleteTopicPlatform(topicId, platform.topic_seed_queries_id))
      .then((res) => {
        if (res.success === 0) {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removePlatformFailed) }));
        } else {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removePlatformSucceeded) }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchTopicSummary(topicId));
          // dispatch(fetchPlatformsInTopicList(topicId));
        }
      });
  },
  handleSelectPlatform: (args, url) => {
    dispatch(selectPlatform(args));
    dispatch(push(url));
  },
  handleSelectNewPlatform: (args, url) => {
    dispatch(selectPlatform(args));
    dispatch(push(url));
  },
});

const fetchAsyncData = (dispatch, { topicId, fetchStatus }) => {
  // this is a odd, and necessitates a forced refetch in EditPlatfromContainer and CreatePlatformConatiner
  if (fetchStatus !== fetchConstants.FETCH_SUCCEEDED) {
    dispatch(fetchPlatformsInTopicList(topicId));
  }
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['fetchStatus'])(
      ManagePlatformsContainer
    )
  )
);
