import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AppButton from '../../common/AppButton';
import QueryPickerItemMenu from './QueryPickerItemMenu';
import { getShortDate } from '../../../lib/dateUtil';
import { QUERY_LABEL_CHARACTER_LIMIT } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';

const localMessages = {
  emptyMedia: { id: 'explorer.querypicker.emptyMedia', defaultMessage: 'No media selected' },
  sourcesSummary: { id: 'explorer.querypicker.sources', defaultMessage: '{sourceCount, plural, \n =0 {``} \n =1 {# source} \n other {# sources }\n}' },
  collectionsSummary: { id: 'explorer.querypicker.coll', defaultMessage: '{collectionCount, plural, \n =0 {``} \n =1 {# collection} \n other {# collections }\n}' },
  customCollSummary: { id: 'explorer.querypicker.customColl', defaultMessage: '{customCollCount, plural, \n =0 {``} \n =1 {# custom collection} \n other {# custom collections }\n}' },
  totalCollectionsSummary: { id: 'explorer.querypicker.coll', defaultMessage: '{totalCollCount} collections, ({customCollCount} custom)' },
  searchHint: { id: 'explorer.querypicker.searchHint', defaultMessage: 'keywords' },
  queryDialog: { id: 'explorer.querypicker.queryDialog', defaultMessage: 'The query label shows up on the legend of the various charts and graphs below. We autogenerate it for you based on your query, but you can also set your own short name to make the charts easier to read.' },
  title: { id: 'explorer.querypicker.title', defaultMessage: 'Rename Query' },
};

const focusUsernameInputField = (input) => {
  if (input) {
    setTimeout(() => { input.focus(); }, 100);
  }
};

class QueryPickerItem extends React.Component {
  state = {
    labelChangeDialogOpen: false,
    labelInDialog: '', // the actual label they type into the change-label popup dialog
  };

  handleBlurAndSelection = () => {
    const { onQuerySelected, query } = this.props;
    onQuerySelected(query);
  };

  updateLabelInDialog = (val) => {
    this.setState({ labelInDialog: val });
  };

  handleLabelEditRequest = () => {
    const { query } = this.props;
    this.setState({ labelChangeDialogOpen: true, labelInDialog: query.label });
  };

  handleLabelClose = () => {
    this.setState({ labelChangeDialogOpen: false });
  };

  handleLabelChangeAndClose = () => {
    const { updateQueryProperty } = this.props;
    this.setState({ labelChangeDialogOpen: false });
    let updatedLabel = this.state.labelInDialog;
    if (updatedLabel.indexOf('...') > 0) {
      updatedLabel = updatedLabel.slice(0, updatedLabel.indexOf('...') - 1);
    }
    updateQueryProperty('label', updatedLabel);
  };

  handleMenuItemKeyDown = (evt) => {
    const { onSearch } = this.props;
    switch (evt.key) {
      case 'Enter':
        onSearch();
        break;
      default: break;
    }
  };

  handleColorChange = (newColor) => {
    const { updateQueryProperty } = this.props;
    updateQueryProperty('color', newColor);
  }

  render() {
    const { query, isSelected, isDeletable, displayLabel, onDuplicate, onDelete, onMove } = this.props;
    const { formatMessage } = this.props.intl;
    let subT = null;
    let headerInfo = null;
    // the user can delete a query, , the user can click the icon button, and edit the label of the query or delete the query
    if (query) {
      headerInfo = (
        <QueryPickerItemMenu
          query={query}
          onLabelEditRequest={this.handleLabelEditRequest}
          onDuplicate={onDuplicate}
          isDeletable={isDeletable}
          displayLabel={displayLabel}
          onDelete={onDelete}
          onMove={onMove}
          onColorChange={this.handleColorChange}
          handleMenuItemKeyDown={this.handleMenuItemKeyDown}
        />
      );
      const queryLabel = query.label;


      const collectionCount = query.collections ? query.collections.length : 0;
      const sourceCount = query.sources ? query.sources.length : 0;
      const customCollCount = query.searches ? query.searches.length : 0;
      // const srcDesc = query.media;
      const totalMediaCount = collectionCount + sourceCount + customCollCount;
      if (totalMediaCount > 0) {
        let oneSourceLabel = query.sources && query.sources[0] && query.sources[0].name ? query.sources[0].name : '';
        const oneCollLabelOrNumber = query.collections[0] && query.collections[0].label ? query.collections[0].label : '';
        const oneCollLabel = collectionCount === 1 ? oneCollLabelOrNumber : '';
        const oneCustomCollLabelOrNumber = query.searches && query.searches[0] ? `${query.searches[0].mediaKeyword || ''} (custom)` : '';
        const oneCustomCollLabel = customCollCount === 1 ? oneCustomCollLabelOrNumber : '';
        oneSourceLabel = sourceCount === 1 ? oneSourceLabel : '';

        const oneCollStatus = oneCollLabel;
        subT = (
          <div>
            <span className="error"><FormattedMessage {...localMessages.emptyMedia} values={{ totalMediaCount }} /></span>
            <br />{query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
          </div>
        );
        /* if there is just one media, we can show label info */
        if (sourceCount === 0 && collectionCount === 1 && customCollCount === 0) {
          subT = (
            <div className="query-info">
              {displayLabel ? query.label : ''}
              {oneCollStatus.length >= QUERY_LABEL_CHARACTER_LIMIT - 1 ? oneCollStatus.slice(0, QUERY_LABEL_CHARACTER_LIMIT).concat('...') : oneCollStatus}<br />
              {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
            </div>
          );
        } else if (collectionCount === 0 && sourceCount === 1 && customCollCount === 0) {
          subT = (
            <div className="query-info">
              {displayLabel ? query.label : ''}
              {oneSourceLabel.length >= QUERY_LABEL_CHARACTER_LIMIT - 1 ? oneSourceLabel.slice(0, QUERY_LABEL_CHARACTER_LIMIT).concat('...') : oneSourceLabel}<br />
              {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
            </div>
          );
        } else if (customCollCount === 1 && sourceCount === 0 && collectionCount === 0) {
          subT = (
            <div className="query-info">
              {displayLabel ? query.label : ''}
              {oneCustomCollLabel.length >= QUERY_LABEL_CHARACTER_LIMIT - 1 ? oneCustomCollLabel.slice(0, QUERY_LABEL_CHARACTER_LIMIT).concat('...') : oneCustomCollLabel}<br />
              {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
            </div>
          );
        } else if (totalMediaCount > 0) { // otherwise, show the counts per source/collections. Merge collectiosn with custom search collections for brevity
          const totalCollCount = collectionCount + customCollCount;
          subT = (
            <div className="query-info">
              {displayLabel ? query.label : ''}
              {collectionCount > 0 || customCollCount > 0 ? <div><FormattedMessage {...localMessages.totalCollectionsSummary} values={{ totalCollCount, customCollCount, label: queryLabel }} /><br /></div> : ''}
              {sourceCount > 0 ? <div><FormattedMessage {...localMessages.sourcesSummary} values={{ sourceCount, label: queryLabel }} /><br /> </div> : ''}
              {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
            </div>
          );
        }
      }
    }
    const extraClassNames = (isSelected) ? 'selected' : '';
    let fullQuery = query.label;
    if (fullQuery && fullQuery.indexOf('...') > 0) {
      fullQuery = fullQuery.slice(0, fullQuery.indexOf('...') - 1);
    }
    return (
      <a
        href="#Edit this query"
        onClick={(evt) => {
          evt.preventDefault();
          this.handleBlurAndSelection();
        }}
      >
        <div
          className={`query-picker-item ${extraClassNames}`}
        >
          {headerInfo}
          <Dialog
            modal="false"
            open={this.state.labelChangeDialogOpen}
            onClose={this.handleLabelClose}
          >
            <DialogTitle>{formatMessage(localMessages.title)}</DialogTitle>
            <DialogContent>
              <p>
                <FormattedMessage {...localMessages.queryDialog} />
              </p>
              <FormControl
                className="query-picker-editable-name"
                id="labelInDialog"
                name="labelInDialog"
                defaultValue={fullQuery}
                maxLength={QUERY_LABEL_CHARACTER_LIMIT}
                onChange={(event) => {
                  this.updateLabelInDialog(event.target.value);
                }}
              >
                <Input
                  inputRef={focusUsernameInputField}
                  placeholder={query.label || formatMessage(localMessages.searchHint)}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <AppButton
                className="query-item-header-dialog-button"
                label={formatMessage(messages.cancel)}
                variant="outlined"
                onClick={this.handleLabelClose}
                key="picker-cancel"
              />
              <AppButton
                label={formatMessage(messages.rename)}
                primary
                onClick={() => this.handleLabelChangeAndClose(query)}
                key="picker-ok"
              />,
            </DialogActions>
          </Dialog>
          {subT}
        </div>
      </a>
    );
  }
}

QueryPickerItem.propTypes = {
  // from parent
  query: PropTypes.object,
  isSelected: PropTypes.bool.isRequired,
  isDeletable: PropTypes.func.isRequired,
  displayLabel: PropTypes.bool.isRequired,
  onQuerySelected: PropTypes.func,
  updateQueryProperty: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  loadEditLabelDialog: PropTypes.func,
  // from composition
  intl: PropTypes.object.isRequired,
};


export default
injectIntl(
  QueryPickerItem
);
