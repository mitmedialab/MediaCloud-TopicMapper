import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import withAsyncFetch from '../../../common/hocs/AsyncContainer';
import AppButton from '../../../common/AppButton';
import ConfirmationDialog from '../../../common/ConfirmationDialog';
import { fetchFocalSetDefinitions, deleteFocalSetDefinition, deleteFocusDefinition, setTopicNeedsNewSnapshot }
  from '../../../../actions/topicActions';
import { updateFeedback } from '../../../../actions/appActions';
import FocalSetDefinitionSummary from './FocalSetDefinitionSummary';
import BackLinkingControlBar from '../../BackLinkingControlBar';
import FocusIcon from '../../../common/icons/FocusIcon';
import messages from '../../../../resources/messages';

const localMessages = {
  focalSetsManageAbout: { id: 'focalSets.manage.about',
    defaultMessage: 'Every Subtopic is part of a Set. All the Subtopics within a Set share the same Technique. Our tools lets you compare Subtopics with a Set, but they don\'t let you easily compare Subtopics in different Sets.' },
  removeFocalSetTitle: { id: 'focalSets.manage.remove.title', defaultMessage: 'Really Remove this Set?' },
  removeFocalSetAbout: { id: 'focalSets.manage.remove.about', defaultMessage: '<p>Removing a Set means that the next Snapshot you make will NOT include it.  This will NOT remove the Set from this Snapshot.</p><p>Are you sure you want to remove this Set? All the Subtopic that are part of it will be removed from the next Snapshot as well.</p>' },
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

  handleDelete = (focalSetDef) => {
    this.setState({ removeDialogOpen: true, idToRemove: focalSetDef.focal_set_definitions_id });
  }

  actuallyDelete = () => {
    const { handleFocalSetDefinitionDelete } = this.props;
    handleFocalSetDefinitionDelete(this.state.idToRemove);
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  doNotActuallyDelete = () => {
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  handleFocusDefinitionDelete = (focusDef) => {
    const { handleFocusDefinitionDelete } = this.props;
    handleFocusDefinitionDelete(focusDef.focus_definitions_id);
  }

  render() {
    const { topicId, focalSetDefinitions } = this.props;
    const { formatMessage } = this.props.intl;
    const removeConfirmationDialog = (
      <ConfirmationDialog
        open={this.state.removeDialogOpen}
        title={formatMessage(localMessages.removeFocalSetTitle)}
        okText={formatMessage(localMessages.removeOk)}
        onCancel={this.doNotActuallyDelete}
        onOk={this.actuallyDelete}
      >
        <FormattedHTMLMessage {...localMessages.removeFocalSetAbout} />
      </ConfirmationDialog>
    );
    return (
      <div className="manage-focal-sets">
        <BackLinkingControlBar message={localMessages.backToTopic} linkTo={`/topics/${topicId}/summary`} />
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
          <Row>
            <Col lg={10} xs={12}>
              <div className="focal-set-definition-list">
                {focalSetDefinitions.map(focalSetDef =>
                  <FocalSetDefinitionSummary
                    key={focalSetDef.focal_set_definitions_id}
                    focalSetDefinition={focalSetDef}
                    onDelete={this.handleDelete}
                    onFocusDefinitionDelete={this.handleFocusDefinitionDelete}
                    topicId={topicId}
                  />
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <div id="create-foci-button">
                <Link to={`/topics/${topicId}/snapshot/foci/create`}>
                  <AppButton color="primary" label={formatMessage(messages.addFocus)}>{formatMessage(messages.addFocus)}</AppButton>
                </Link>
              </div>
            </Col>
          </Row>
        </Grid>
        {removeConfirmationDialog}
      </div>
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
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  handleFocalSetDefinitionDelete: PropTypes.func.isRequired,
  handleFocusDefinitionDelete: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  focalSetDefinitions: state.topics.selected.focalSets.definitions.list,
  fetchStatus: state.topics.selected.focalSets.definitions.fetchStatus,
});

const mapDispatchToProps = dispatch => ({
  fetchData: (topicId) => {
    dispatch(fetchFocalSetDefinitions(topicId));
  },
  removeFocalSetDefinition: (topicId, focalSetDefinitionId, succeededMessage, failedMessage) => {
    dispatch(deleteFocalSetDefinition(topicId, focalSetDefinitionId))
      .then((results) => {
        if (results.success === 0) {
          dispatch(updateFeedback({ open: true, message: failedMessage }));
        } else {
          dispatch(updateFeedback({ open: true, message: succeededMessage }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchFocalSetDefinitions(topicId));
        }
      });
  },
  removeFocusDefinition: (topicId, focusDefinitionId, succeededMessage, failedMessage) => {
    dispatch(deleteFocusDefinition(topicId, focusDefinitionId))
      .then((results) => {
        if (results.success === 0) {
          dispatch(updateFeedback({ open: true, message: failedMessage }));
        } else {
          dispatch(updateFeedback({ open: true, message: succeededMessage }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchFocalSetDefinitions(topicId));
        }
      });
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps.topicId);
    },
    handleFocalSetDefinitionDelete: (focalSetDefinitionId) => {
      dispatchProps.removeFocalSetDefinition(stateProps.topicId, focalSetDefinitionId,
        ownProps.intl.formatMessage(localMessages.removeFocalSetSucceeded),
        ownProps.intl.formatMessage(localMessages.removeFocalSetFailed)
      );
    },
    handleFocusDefinitionDelete: (focusDefinitionId) => {
      dispatchProps.removeFocusDefinition(stateProps.topicId, focusDefinitionId,
        ownProps.intl.formatMessage(localMessages.removeFocusSucceeded),
        ownProps.intl.formatMessage(localMessages.removeFocusFailed)
      );
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withAsyncFetch(
        ManageFocalSetsContainer
      )
    )
  );
