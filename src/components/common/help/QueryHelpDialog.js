import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import messages from '../../../resources/messages';

const localMessages = {
  invitation: { id: 'help.query.invitation', defaultMessage: 'Learn about writing search terms.' },
  title: { id: 'help.query.title', defaultMessage: 'Writing Media Cloud Queries' },
  content: { id: 'help.query.content', defaultMessage: `
<p>You can query Media Cloud with boolean searches that match stories, a lot like you might use Google.  Here are some examples:</p>
<ul>
<li><code>cheese AND blue</code> - using "AND" lets you look for stories that include both the word "cheese" and the word "blue"</li>
<li><code>"blue cheese"</code> - putting a phrase in quotes lets you search for stories that use the phrase "blue cheese"</li>
<li><code>cheese OR cheesy</code> - using "OR" searches for stories that use either "cheese" or the word "cheesy"</li>
<li><code>chees*</code> - using an asterix searches for stories that use any word that starts with "chees" - including "cheese", "cheesy", or others</li>
<li><code>cheese AND NOT blue</code> - using "NOT" lets you remove content you don't want; searching for stories that use the word "cheese" but don't have the word "blue" in them</li>
<li><code>cheese AND (blue OR manchego OR goat OR cheddar)</code> - using parentheses lets you author more complex queries; searching here for stories that have the word "cheese" and at least one other word describing what type it is</li>
<li><code>queso AND language:es</code> - using the "language:" keyword lets you narrow in on a language; here searching for stories that use the word "queso" and have been detected by our system as being written in Spanish</li>
<li><code>title:(cheese OR queso)</code> - using the "title:" keyword lets you limit your search to article titles (we search just the article text by default)</li>
</ul>
<p><a href="https://mediacloud.org/support/query-guide" target=_blank>Read our guide to creating queries to learn more</a>.</p>
  ` },
};

class QueryHelpDialog extends React.Component {
  state = {
    open: false,
  };
  handleOpen = (evt) => {
    this.setState({ open: true });
    evt.preventDefault();
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  render() {
    const { formatMessage } = this.props.intl;
    const dialogActions = [
      <Button
        variant="outlined"
        label={formatMessage(messages.ok)}
        primary
        onClick={this.handleClose}
      />,
    ];
    return (
      <span className="query-help-dialog">
        <a href="#help" onClick={this.handleOpen}><FormattedMessage {...localMessages.invitation} /></a>
        <Dialog
          title={formatMessage(localMessages.title)}
          actions={dialogActions}
          modal
          className="app-dialog"
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <div className="query-help-dialog-content">
            <FormattedHTMLMessage {...localMessages.content} />
          </div>
        </Dialog>
      </span>
    );
  }
}

QueryHelpDialog.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    QueryHelpDialog
  );
