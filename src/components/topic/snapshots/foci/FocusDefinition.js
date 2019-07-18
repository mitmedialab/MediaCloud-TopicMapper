import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { DeleteButton, EditButton } from '../../../common/IconButton';
import AppButton from '../../../common/AppButton';
import messages from '../../../../resources/messages';
import { filteredLinkTo } from '../../../util/location';

const localMessages = {
  focusDelete: { id: 'focusDefinition.delete', defaultMessage: 'Delete this Subtopic' },
  deleteConfirmTitle: { id: 'focusDefinition.delete.confirm.title', defaultMessage: 'Are You Sure?' },
  deleteConfirmDescription: { id: 'focusDefinition.delete.confirm.description', defaultMessage: 'Click "delete" to actually delete this subtopic from the next version.  You can\'t undo this.  Clicking delete means that your next version will NOT include this subtopic.  Your current version (which you are looking at now) will continue to have it.  After doing this you need to create a new snapshot.' },
};

class FocusDefinition extends React.Component {
  state = {
    deleteConfirmationOpen: false,
  };

  handleDeleteCancel = () => {
    this.setState({ deleteConfirmationOpen: false });
  };

  showDeleteDialog = () => {
    this.setState({ deleteConfirmationOpen: true });
  }

  handleDelete = (event) => {
    const { focusDefinition, onDelete } = this.props;
    event.preventDefault();
    if ((onDelete !== undefined) && (onDelete !== null)) {
      onDelete(focusDefinition);
    }
  }

  render() {
    const { focusDefinition, topicId, filters } = this.props;
    const { formatMessage } = this.props.intl;
    const dialogActions = [
      <AppButton
        label={formatMessage(messages.cancel)}
        onClick={this.handleDeleteCancel}
      />,
      <AppButton
        label={formatMessage(messages.delete)}
        primary
        onClick={this.handleDelete}
      />,
    ];
    return (
      <div className="focus-definition" data-focus-definitions-id={focusDefinition.focus_definitions_id}>
        <h3>
          {focusDefinition.name}
          <div className="controls">
            <EditButton linkTo={filteredLinkTo(`/topics/${topicId}/snapshot/foci/${focusDefinition.focus_definitions_id}/edit`, filters)} />
            <DeleteButton onClick={this.showDeleteDialog} tooltip={formatMessage(localMessages.focusDelete)} />
          </div>
        </h3>
        <p>
          {focusDefinition.description}
        </p>
        <p>
          <FormattedMessage {...messages.query} />: <code>{focusDefinition.query}</code>
        </p>
        <Dialog
          open={this.state.deleteConfirmationOpen}
          onClose={this.handleDeleteCancel}
          className="app-dialog"
        >
          <DialogTitle>
            {formatMessage(localMessages.deleteConfirmTitle)}
          </DialogTitle>
          <DialogContent>
            <FormattedMessage {...localMessages.deleteConfirmDescription} />
          </DialogContent>
          <DialogActions>
            {dialogActions}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

FocusDefinition.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  focusDefinition: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  filters: PropTypes.object,
};

export default
injectIntl(
  FocusDefinition
);
