import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AppButton from './AppButton';
import { intlIfObject } from '../../lib/stringUtil';
import messages from '../../resources/messages';

const ConfirmationDialog = ({ open, title, children, okText, onCancel, onOk, intl }) => (
  <Dialog
    className="app-dialog"
    open={open}
    onClose={onCancel}
  >
    <DialogTitle>{intlIfObject(intl.formatMessage, title)}</DialogTitle>
    <DialogContent>
      {children}
    </DialogContent>
    <DialogActions>
      <AppButton
        label={messages.cancel}
        onClick={onCancel}
      />
      <AppButton
        label={intlIfObject(intl.formatMessage, okText)}
        primary
        onClick={onOk}
      />
    </DialogActions>
  </Dialog>
);

ConfirmationDialog.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  // from parent
  open: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  okText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default injectIntl(ConfirmationDialog);
