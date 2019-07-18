import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import AppButton from '../../../common/AppButton';
import messages from '../../../../resources/messages';
import ConfirmationDialog from '../../../common/ConfirmationDialog';
import { fetchFocalSetDefinitions, deleteFocalSetDefinition, deleteFocusDefinition, setTopicNeedsNewSnapshot }
  from '../../../../actions/topicActions';
import { updateFeedback } from '../../../../actions/appActions';
import FocalSetDefinitionDetails from './FocalSetDefinitionDetails';
import BackLinkingControlBar from '../../BackLinkingControlBar';
import FocusIcon from '../../../common/icons/FocusIcon';
import NewVersionFociComparisonContainer from './NewVersionFociComparisonContainer';
import NeedsNewVersionWarning from '../../versions/NeedsNewVersionWarning';
import LinkWithFilters from '../../LinkWithFilters';
import { filteredLinkTo } from '../../../util/location';

const localMessages = {
  listTitle: { id: 'focalSets.list.title', defaultMessage: 'Subtopic Details' },
  focalSetsManageAbout: { id: 'focalSets.manage.about',
    defaultMessage: 'Every Subtopic is part of a Set. All the Subtopics within a Set share the same Technique. Our tools lets you compare Subtopics with a Set, but they don\'t let you easily compare Subtopics in different Sets.' },
  removeFocalSetTitle: { id: 'focalSets.manage.remove.title', defaultMessage: 'Really Remove this Set?' },
  removeFocalSetAbout: { id: 'focalSets.manage.remove.about', defaultMessage: '<p>Removing a Set means that the next Version you make will NOT include it.  This will NOT remove the Set from this Version.</p><p>Are you sure you want to remove this Set? All the Subtopic that are part of it will be removed from the next Snapshot as well.</p>' },
  removeOk: { id: 'focalSets.manage.remove.ok', defaultMessage: 'Remove It' },
  removeFocalSetSucceeded: { id: 'focalSets.manage.remove.succeeded', defaultMessage: 'Removed the Set' },
  removeFocalSetFailed: { id: 'focalSets.manage.remove.failed', defaultMessage: 'Sorry, but removing the Set failed :-(' },
  removeFocusSucceeded: { id: 'focus.remove.succeeded', defaultMessage: 'Removed the Subtopic' },
  removeFocusFailed: { id: 'focus.remove.failed', defaultMessage: 'Sorry, but removing the Subtopic failed :-(' },
  backToTopic: { id: 'backToTopic', defaultMessage: 'back to the topic' },
};

class ManageFocalSetsContainer extends React.Component {
  state = {
    removeDialogOpen: false,
    idToRemove: null,
  };

  onFocusDefinitionDelete = (focusDef) => {
    const { topicId, handleDeleteFocusDefinition } = this.props;
    handleDeleteFocusDefinition(topicId, focusDef.focus_definitions_id);
  }

  onCancelDeleteFocalSetDefinition = () => {
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  onDeleteFocalSetDefinition = () => {
    const { topicId, handleDeleteFocalSetDefinition } = this.props;
    handleDeleteFocalSetDefinition(topicId, this.state.idToRemove);
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  handleDelete = (focalSetDef) => {
    this.setState({ removeDialogOpen: true, idToRemove: focalSetDef.focal_set_definitions_id });
  }

  render() {
    const { topicId, focalSetDefinitions, filters } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <React.Fragment>
        <BackLinkingControlBar
          message={localMessages.backToTopic}
          linkTo={filteredLinkTo(`/topics/${topicId}/summary`, filters)}
        />
        <NeedsNewVersionWarning />
        <div className="manage-focal-sets">
          <Grid>
            <Row>
              <Col lg={12}>
                <h1><FocusIcon /><FormattedMessage {...messages.manageFoci} /></h1>
              </Col>
            </Row>
            <Row>
              <Col lg={10} xs={12}>
                <p>
                  <FormattedMessage {...localMessages.focalSetsManageAbout} />
                </p>
              </Col>
            </Row>
            <NewVersionFociComparisonContainer />
            {(focalSetDefinitions.length > 0) && (
              <Row>
                <Col lg={10} xs={12}>
                  <div className="focal-set-definition-list">
                    <h2><FormattedMessage {...localMessages.listTitle} /></h2>
                    {focalSetDefinitions.map((focalSetDef, idx) => (
                      <FocalSetDefinitionDetails
                        key={idx}
                        focalSetDefinition={focalSetDef}
                        onDelete={this.handleDelete}
                        onFocusDefinitionDelete={this.onFocusDefinitionDelete}
                        topicId={topicId}
                        filters={filters}
                      />
                    ))}
                  </div>
                </Col>
              </Row>
            )}
            <Row>
              <Col lg={6}>
                <div id="create-foci-button">
                  <LinkWithFilters to={`/topics/${topicId}/snapshot/foci/create`}>
                    <AppButton primary label={messages.addFocus} />
                  </LinkWithFilters>
                </div>
              </Col>
            </Row>
          </Grid>
          <ConfirmationDialog
            open={this.state.removeDialogOpen}
            title={formatMessage(localMessages.removeFocalSetTitle)}
            okText={formatMessage(localMessages.removeOk)}
            onCancel={this.onCancelDeleteFocalSetDefinition}
            onOk={this.onDeleteFocalSetDefinition}
          >
            <FormattedHTMLMessage {...localMessages.removeFocalSetAbout} />
          </ConfirmationDialog>
        </div>
      </React.Fragment>
    );
  }
}

ManageFocalSetsContainer.propTypes = {
  // from composition
  topicId: PropTypes.number.isRequired,
  intl: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  focalSetDefinitions: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  // from dispatch
  handleDeleteFocalSetDefinition: PropTypes.func.isRequired,
  handleDeleteFocusDefinition: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  topicInfo: state.topics.selected.info,
  focalSetDefinitions: state.topics.selected.focalSets.definitions.list,
  fetchStatus: state.topics.selected.focalSets.definitions.fetchStatus,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDeleteFocalSetDefinition: (topicId, focalSetDefinitionId) => {
    dispatch(deleteFocalSetDefinition(topicId, focalSetDefinitionId))
      .then((results) => {
        if (results.success === 0) {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removeFocalSetFailed) }));
        } else {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removeFocalSetSucceeded) }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchFocalSetDefinitions(topicId));
        }
      });
  },
  handleDeleteFocusDefinition: (topicId, focusDefinitionId) => {
    dispatch(deleteFocusDefinition(topicId, focusDefinitionId))
      .then((results) => {
        if (results.success === 0) {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removeFocusFailed) }));
        } else {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removeFocusSucceeded) }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchFocalSetDefinitions(topicId));
        }
      });
  },
});

const fetchAsyncData = (dispatch, { topicId }) => {
  dispatch(fetchFocalSetDefinitions(topicId));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData)(
      ManageFocalSetsContainer
    )
  )
);
