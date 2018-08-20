import PropTypes from 'prop-types';
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppButton from '../AppButton';
import messages from '../../../resources/messages';

const localMessage = {
  title: { id: 'gottaLogin.title', defaultMessage: 'Login Required' },
  intro: { id: 'gottaLogin.message', defaultMessage: 'You have to login to use this feature.' },
};

/**
 * When awidget needs to throw up a "login first" dialog, wrap it in this and call `handleShowLoginDialog`.
 */
function withLoginRequired(ComposedContainer) {
  class LoginRequiredDialog extends React.Component {
    state = {
      open: false,
    }

    // call this from your component
    handleShowLoginDialog = () => {
      this.setState({ open: true });
    };

    handleClose = () => {
      this.setState({ open: false });
    };

    render() {
      const { details } = this.props;
      const { formatMessage } = this.props.intl;
      return (
        <React.Fragment>
          <ComposedContainer {...this.props} onShowLoginDialog={this.handleShowLoginDialog} />
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="login-dialog-title"
            aria-describedby="login-dialog-description"
          >
            <DialogTitle id="login-dialog-title">{formatMessage(localMessage.title)}</DialogTitle>
            <DialogContent>
              <DialogContentText id="login-dialog-description">
                {formatMessage(localMessage.intro)}
                {Boolean(details) && formatMessage(localMessage.details)}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <AppButton onClick={this.handleClose} color="primary">
                {formatMessage(messages.ok)}
              </AppButton>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
    }
  }

  LoginRequiredDialog.propTypes = {
    intl: PropTypes.object.isRequired,
    details: PropTypes.string,
  };

  return LoginRequiredDialog;
}

export default withLoginRequired;
