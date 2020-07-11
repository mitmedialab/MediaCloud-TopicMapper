import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import SanitizedHTML from 'react-sanitized-html';
import AppButton from './AppButton';
import messages from '../../resources/messages';
import { intlIfObject } from '../../lib/stringUtil';
import { intlMessageShape } from '../../lib/reactUtil';

/**
 * A helper for showing a modal dialog. If you want to show a help icon, use the HelpDialog wrapper instead.
 */
class SimpleDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = (evt) => {
    evt.preventDefault();
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { trigger, children, title, content } = this.props;
    const { formatMessage, formatHTMLMessage } = this.props.intl;
    return (
      <span>
        <a role="button" tabIndex="0" onKeyPress={this.handleClickOpen} onClick={this.handleClickOpen}>{intlIfObject(formatHTMLMessage, trigger)}</a>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="simple-dialog-title"
        >
          <DialogTitle id="simple-dialog-title">{intlIfObject(formatHTMLMessage, title)}</DialogTitle>
          <DialogContent>
            <SanitizedHTML html={intlIfObject(formatHTMLMessage, content)} />
            {children}
          </DialogContent>
          <DialogActions>
            <AppButton
              primary
              label={formatMessage(messages.ok)}
              onClick={this.handleClose}
            >
              <FormattedMessage {...messages.ok} />
            </AppButton>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

SimpleDialog.propTypes = {
  // from parent
  trigger: PropTypes.oneOfType([ // the thing the user can click to make the dialog appear
    PropTypes.shape(intlMessageShape),
    PropTypes.string, // a raw text link
    PropTypes.node, // an icon perhaps
  ]).isRequired,
  title: PropTypes.oneOfType([ // the title of the dialog that shows up
    PropTypes.string,
    PropTypes.shape(intlMessageShape),
  ]).isRequired,
  content: PropTypes.oneOfType([ // supply this, or children to show
    PropTypes.string,
    PropTypes.shape(intlMessageShape),
  ]),
  children: PropTypes.node, // supply this, or `content` to show
  // from composition
  intl: PropTypes.object.isRequired,
};


export default injectIntl(SimpleDialog);
