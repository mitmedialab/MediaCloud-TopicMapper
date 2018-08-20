import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import messages from '../../resources/messages';

const localMessages = {
  title: { id: 'title', defaultMessage: 'Copy To All Queries' },
};

class CopyAllComponent extends React.Component {
  state = {
    open: false,
  };
  handleOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    const { onOk } = this.props;
    this.setState({ open: false });
    onOk();
  };
  handleCancel = () => {
    this.setState({ open: false });
  };
  render() {
    const { label, title, msg } = this.props;
    const { formatMessage } = this.props.intl;
    const dialogActions = [
      <Button
        variant="outlined"
        label={formatMessage(messages.cancel)}
        primary
        onClick={this.handleCancel}
      />,
      <Button
        variant="outlined"
        label={formatMessage(messages.ok)}
        primary
        onClick={this.handleClose}
      />,
    ];
    let content = null;
    if (msg) {
      content = (
        <div>
          {msg}
        </div>
      );
    }

    const dialogTitle = title ? formatMessage(localMessages.title) : '';
    return (
      <span className="copy-all">
        <label htmlFor="q">{label}</label><a role="button" title={formatMessage(localMessages.title)} tabIndex="0" onClick={this.handleOpen}>&nbsp;&#x00BB;</a>
        <Dialog
          title={dialogTitle}
          actions={dialogActions}
          modal={false}
          className="app-dialog"
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {content}
        </Dialog>
      </span>
    );
  }
}

CopyAllComponent.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from parent
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default injectIntl(CopyAllComponent);
