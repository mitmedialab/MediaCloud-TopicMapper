import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import AppButton from '../../common/AppButton';
import messages from '../../../resources/messages';

const localMessages = {
  saveSearchTitle: { id: 'explorer.querypicker.saveSearchTitle', defaultMessage: 'Save Your Search' },
  saveSearchDialog: { id: 'explorer.querypicker.saveSearchDialog', defaultMessage: 'Name your search, so you can remember what it is later. Once you save it, you will be able to load this search again by clicking the "Load Saved Search" button.' },
  searchHint: { id: 'explorer.querypicker.searchHint', defaultMessage: 'query labels...' },
  saveSearch: { id: 'explorer.querypicker.saveSearch', defaultMessage: 'Save Search...' },
};

class QueryPickerSaveUserSearchesDialog extends React.Component {
  state = {
    saveSearchDialogOpen: false,
    searchName: this.props.searchNickname,  // the actual label they type into the change-label popup dialog
  };

  onSaveRequest = () => {
    const { setQueryFormChildDialogOpen } = this.props;
    this.setState({ saveSearchDialogOpen: true });
    setQueryFormChildDialogOpen(true);
  }

  onSaveConfirm = () => {
    const { handleSaveSearch } = this.props;
    handleSaveSearch({ queryName: this.state.searchName });
  };

  focusQueryInputField = (input) => {
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  };

  handleDialogClose = () => {
    const { setQueryFormChildDialogOpen } = this.props;
    this.setState({ saveSearchDialogOpen: false });
    setQueryFormChildDialogOpen(false);
  };

  handleLabelChangeAndClose = () => {
    this.setState({ saveSearchDialogOpen: false });
    this.onSaveConfirm();
  };

  updateTextInDialog = (ev) => {
    this.setState({ searchName: ev.target.value });
  };

  render() {
    const { searchNickname, submitting } = this.props;
    const { formatMessage } = this.props.intl;
    const actions = [
      <AppButton
        variant="outlined"
        label={formatMessage(messages.cancel)}
        color="secondary"
        onClick={this.handleDialogClose}
        key="qpsusd-cancel"
      />,
      <AppButton
        primary
        label={formatMessage(messages.save)}
        keyboardFocused
        onClick={this.handleLabelChangeAndClose}
        key="qpsusd-save"
      />,
    ];
    return (
      <div className="save-search-wrapper">
        <Dialog
          open={this.state.saveSearchDialogOpen}
          onClose={this.handleDialogClose}
        >
          <DialogTitle><FormattedMessage {...localMessages.saveSearchTitle} /></DialogTitle>
          <DialogContent>
            <p><FormattedMessage {...localMessages.saveSearchDialog} /></p>
            <TextField
              className="query-picker-save-search-name"
              id="searchNameInDialog"
              name="searchNameInDialog"
              inputRef={this.focusQueryInputField}
              onChange={this.updateTextInDialog}
              placeholder={searchNickname}
            />
          </DialogContent>
          <DialogActions>{actions}</DialogActions>
        </Dialog>
        <AppButton
          variant="outlined"
          style={{ marginTop: 30 }}
          onClick={this.onSaveRequest}
          label={formatMessage(localMessages.saveSearch)}
          disabled={submitting}
          key="qpsusd-reallySave"
        />
      </div>
    );
  }
}

QueryPickerSaveUserSearchesDialog.propTypes = {
  // from parent
  submitting: PropTypes.bool.isRequired,
  searchNickname: PropTypes.string.isRequired,
  handleSaveSearch: PropTypes.func,
  setQueryFormChildDialogOpen: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
};


export default
  injectIntl(
QueryPickerSaveUserSearchesDialog
);
