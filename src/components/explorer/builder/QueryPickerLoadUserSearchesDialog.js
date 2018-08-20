import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedDate, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import { DeleteButton } from '../../common/IconButton';
import AppButton from '../../common/AppButton';
import { getDateFromTimestamp } from '../../../lib/dateUtil';
import messages from '../../../resources/messages';

const STORY_SEARCH_RELEASE_DATE = new Date(2018, 5, 18);

const localMessages = {
  loadSearchTitle: { id: 'explorer.querypicker.loadSearchTitle', defaultMessage: 'Load One of Your Saved Searches' },
  loadSavedSearches: { id: 'explorer.querypicker.loadSavedSearches', defaultMessage: 'Load Saved Search...' },
  delete: { id: 'explorer.querypicker.deleteSearch', defaultMessage: 'Delete' },
  load: { id: 'explorer.querypicker.loadSearch', defaultMessage: 'Load' },
  noSavedSearches: { id: 'explorer.querypicker.noSearches', defaultMessage: '<p>You have no saved searches.  You can save any searches you find useful and use this screen to reload it later.</p>' },
  needsUpdating: { id: 'explorer.querypicker.needsUpdating', defaultMessage: 'We\'ve switched to story-level searching since you saved this. Results will be different; you might need to update it. <a target="_new" href="https://mediacloud.org/news/2018/4/12/switching-to-story-based-searching-on-may-12th">Learn more</a>.' },
};

class QueryPickerLoadUserSearchesDialog extends React.Component {
  state = {
    loadSearchDialogOpen: false,
  };

  onLoadRequest = () => {
    const { handleLoadSearches } = this.props;
    this.setState({ loadSearchDialogOpen: true });
    handleLoadSearches();
  }

  onDeleteRequest = (selectedSearch) => {
    const { handleDeleteSearch } = this.props;
    handleDeleteSearch(selectedSearch);
  }

  onLoadConfirm = (search) => {
    const { handleLoadSelectedSearch } = this.props;
    handleLoadSelectedSearch(search);
    this.setState({ loadSearchDialogOpen: false });
  };

  handleDialogClose = () => {
    this.setState({ loadSearchDialogOpen: false });
  };

  handleLabelChangeAndClose = () => {
    this.setState({ loadSearchDialogOpen: false });
    this.onLoadConfirm();
  };

  render() {
    const { searches, submitting } = this.props;
    const { formatMessage } = this.props.intl;
    let searchList;
    if (searches !== null && searches !== undefined && searches.length > 0) {
      searchList = (
        <div className="query-picker-save-search-list">
          {searches.map((search, idx) => {
            const searchDate = getDateFromTimestamp(search.timestamp);
            const needsUpdating = searchDate < STORY_SEARCH_RELEASE_DATE;
            return (
              <Row>
                <Col lg={12}>
                  <div key={idx} className="query-picker-save-search-item">
                    <DeleteButton className="delete-search" onClick={() => this.onDeleteRequest(search)} />
                    <h3><Link to={`queries/search?q=${search.queryParams}`}>{search.queryName}</Link></h3>
                    <p><FormattedDate value={searchDate} /></p>
                    {needsUpdating && (
                      <i><FormattedHTMLMessage {...localMessages.needsUpdating} /></i>
                    )}
                  </div>
                </Col>
              </Row>
            );
          })}
        </div>
      );
    } else {
      // no searches so show a nice messages
      searchList = (
        <FormattedHTMLMessage {...localMessages.noSavedSearches} />
      );
    }
    return (
      <div className="load-saved-search-wrapper">
        <Dialog
          open={this.state.loadSearchDialogOpen}
          onClose={this.handleDialogClose}
          maxWidth={'md'}
        >
          <DialogTitle><FormattedMessage {...localMessages.loadSearchTitle} /></DialogTitle>
          <DialogContent>
            {searchList}
          </DialogContent>
          <DialogActions>
            <AppButton
              primary
              onClick={this.handleDialogClose}
            >
              <FormattedMessage {...messages.close} />
            </AppButton>,
          </DialogActions>
        </Dialog>
        <AppButton
          variant="outlined"
          style={{ marginTop: 30 }}
          onClick={this.onLoadRequest}
          label={formatMessage(localMessages.loadSavedSearches)}
          disabled={submitting}
        />
      </div>
    );
  }
}

QueryPickerLoadUserSearchesDialog.propTypes = {
  // from parent
  submitting: PropTypes.bool.isRequired,
  searches: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
  handleLoadSearches: PropTypes.func.isRequired,
  handleLoadSelectedSearch: PropTypes.func.isRequired,
  handleDeleteSearch: PropTypes.func.isRequired,
  onLoad: PropTypes.func,
  // from composition
  intl: PropTypes.object.isRequired,
};


export default
  injectIntl(
    QueryPickerLoadUserSearchesDialog
  );
