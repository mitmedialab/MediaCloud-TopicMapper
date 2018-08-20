import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Link from 'react-router/lib/Link';
import messages from '../../../resources/messages';
import AppButton from '../../common/AppButton';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN } from '../../../lib/auth';
import { EditButton } from '../../common/IconButton';
import DescriptiveButton from '../../common/DescriptiveButton';
import FocusIcon from '../../common/icons/FocusIcon';
import SnapshotIcon from '../../common/icons/SnapshotIcon';

const localMessages = {
  modifyTopic: { id: 'topic.modify', defaultMessage: 'Modify Topic' },
  addFocusDetails: { id: 'topic.addFocus.details', defaultMessage: 'Refine your data by creating a new Subtopic' },
  addTimespan: { id: 'topic.addTimespan', defaultMessage: 'Add New Timespan' },
  addTimespanDetails: { id: 'topic.addTimespan.details', defaultMessage: 'Create now timespans for grouping stories to analyze' },
  changePermissions: { id: 'topic.changePermissions', defaultMessage: 'Change Permissions' },
  changePermissionsDetails: { id: 'topic.changePermissions.details', defaultMessage: 'Control who else can see and/or change this topic' },
  changeSettings: { id: 'topic.changeSettings', defaultMessage: 'Change Settings' },
  changeSettingsDetails: { id: 'topic.changeSettings.details', defaultMessage: 'Edit this topic\'s configuration and visibility' },
  generateSnapshotDetails: { id: 'topic.generateSnapshot.details', defaultMessage: 'Your topic needs to be updated!' },
  runSpider: { id: 'topic.runSpider', defaultMessage: 'Run a Spider' },
  runSpiderDetails: { id: 'topic.runSpider.details', defaultMessage: 'Start the spidering manually now if you need to (admin only)' },
};

class ModifyTopicDialog extends React.Component {

  state = {
    open: false,
  };

  handleModifyClick = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({ open: true });
  };

  handleRemoveDialogClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { topicId, onUrlChange, needsNewSnapshot, onSpiderRequest } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div className="modify-topic">
        <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
          <EditButton
            onClick={this.handleModifyClick}
            tooltip={formatMessage(localMessages.modifyTopic)}
          />
          <Link to={`${formatMessage(localMessages.modifyTopic)}`} onClick={this.handleModifyClick}>
            <b><FormattedMessage {...localMessages.modifyTopic} /></b>
          </Link>
        </Permissioned>
        <Dialog
          open={this.state.open}
          onClose={this.handleRemoveDialogClose}
          className={'modify-topic-dialog'}
          autoDetectWindowHeight={false}
        >
          <DialogTitle>
            {formatMessage(localMessages.modifyTopic)}
          </DialogTitle>
          <DialogContent>
            <DescriptiveButton
              svgIcon={(<SnapshotIcon height={40} />)}
              label={formatMessage(messages.snapshotGenerate)}
              description={(needsNewSnapshot) ? formatMessage(localMessages.generateSnapshotDetails) : ''}
              onClick={() => onUrlChange(`/topics/${topicId}/snapshot/generate`)}
              className={(needsNewSnapshot) ? 'warning' : ''}
              id="modify-topic-snapshot"
            />
            <Permissioned onlyTopic={PERMISSION_TOPIC_ADMIN}>
              <DescriptiveButton
                label={formatMessage(localMessages.runSpider)}
                description={formatMessage(localMessages.runSpiderDetails)}
                onClick={() => {
                  onSpiderRequest();
                  this.handleRemoveDialogClose();
                }}
                id="modify-topic-spider"
              />
            </Permissioned>
            <DescriptiveButton
              svgIcon={(<FocusIcon height={50} />)}
              label={formatMessage(messages.manageFoci)}
              description={formatMessage(localMessages.addFocusDetails)}
              onClick={() => onUrlChange(`/topics/${topicId}/snapshot/foci`)}
              id="modify-topic-subtopics"
            />
            <DescriptiveButton
              label={formatMessage(localMessages.changePermissions)}
              description={formatMessage(localMessages.changePermissionsDetails)}
              onClick={() => onUrlChange(`/topics/${topicId}/permissions`)}
              id="modify-topic-permissions"
            />
            <DescriptiveButton
              label={formatMessage(localMessages.changeSettings)}
              description={formatMessage(localMessages.changeSettingsDetails)}
              onClick={() => onUrlChange(`/topics/${topicId}/edit`)}
              id="modify-topic-settings"
            />
            <DialogActions>
              <AppButton
                label={formatMessage(messages.cancel)}
                onTouchTap={this.handleRemoveDialogClose}
                key="close"
              />
            </DialogActions>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

}

ModifyTopicDialog.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number,
  needsNewSnapshot: PropTypes.bool.isRequired,
  onSpiderRequest: PropTypes.func.isRequired,
  // from dispatch
  onUrlChange: PropTypes.func.isRequired,
};

export default
  injectIntl(
    ModifyTopicDialog
  );
