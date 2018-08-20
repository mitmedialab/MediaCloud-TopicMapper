import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
// import { push } from 'react-router-redux';
import * as d3 from 'd3';
import messages from '../../../resources/messages';
import QueryForm from './QueryForm';
import AppButton from '../../common/AppButton';
import ItemSlider from '../../common/ItemSlider';
import QueryPickerItem from './QueryPickerItem';
import { updateFeedback } from '../../../actions/appActions';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';
import { selectQuery, updateQuery, addCustomQuery, loadUserSearches, saveUserSearch, deleteUserSearch, markAsDeletedQuery, copyAndReplaceQueryField } from '../../../actions/explorerActions';
import { AddQueryButton } from '../../common/IconButton';
import { getDateRange, solrFormat, PAST_MONTH } from '../../../lib/dateUtil';
import { DEFAULT_COLLECTION_OBJECT_ARRAY, autoMagicQueryLabel, generateQueryParamString, KEYWORD, DATES, MEDIA } from '../../../lib/explorerUtil';

const localMessages = {
  mainTitle: { id: 'explorer.querypicker.mainTitle', defaultMessage: 'Query List' },
  intro: { id: 'explorer.querypicker.intro', defaultMessage: 'Here are all available queries' },
  addQuery: { id: 'explorer.querypicker.addQuery', defaultMessage: 'Add query' },
  querySearch: { id: 'explorer.queryBuilder.advanced', defaultMessage: 'Search' },
  searchHint: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Search' },
  deleteFailed: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Sorry, deleting your search failed for some reason.' },
};

const formSelector = formValueSelector('queryForm');

class QueryPicker extends React.Component {
  // load selected if collections have been updated
 /* componentWillReceiveProps(nextProps) {
    const { queries, selected, handleQuerySelected } = nextProps;
    const selectedCollectionStatus = selected.collections.reduce((combined, c) => combined && c.tag_sets_id !== undefined, true);
    if (!selectedCollectionStatus) {
      const selectedIndex = queries.findIndex(q => q.id === selected.id);
      handleQuerySelected(queries[selectedIndex]);
    }
  } */
  addAQuery(newQueryObj) {
    const { addAQuery, selected } = this.props;
    this.handleSelectedQueryChange(selected, selected.index);
    addAQuery(newQueryObj);
  }
  focusRequested = field => field.focus();

  updateDemoQueryLabel(query, newValue) {
    // update both label and q for query
    const { updateCurrentQuery } = this.props;
    const updatedQuery = { ...query };
    updatedQuery.label = newValue;
    updatedQuery.q = newValue;
    updatedQuery.autoNaming = false;
    updateCurrentQuery(updatedQuery, 'label');
  }
  // called by query picker to update things like label or color
  updateQueryProperty(query, propertyName, newValue) {
    const { updateCurrentQuery, formQuery } = this.props;
    const updatedQuery = {
      ...query,
      ...formQuery,
    };
    updatedQuery[propertyName] = newValue;
    if (propertyName === 'label') { // no longer auto-name query if the user has intentionally changed it
      updatedQuery.autoNaming = false;
    }
    if (propertyName === 'q' && updatedQuery.autoNaming) { // no longer auto-name query if the user has intentionally changed it
      updatedQuery.label = newValue;
    }
    // now update it in the store
    updateCurrentQuery(updatedQuery, propertyName);
  }

  handleColorChange = (newColorInfo) => {
    // when user changes color we want to change it on all charts right away
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      color: newColorInfo.value,
    };
    // this.handleSelectedQueryChange(selected, selected.index);
    updateCurrentQuery(updatedQuery, 'color');
  }
  handleMediaDelete = (toBeDeletedObj) => {
    // the user has removed media from the Query Form SourceCollectionsFieldList
    const { selected, formQuery, updateCurrentQuery } = this.props; // formQuery same as selected
    // filter out removed ids...
    const updatedMedia = {
      ...selected,
      ...formQuery,
    };
    const updatedSources = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'source' || m.media_id));
    const updatedCollections = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'collection' || m.tags_id));
    updatedMedia.collections = updatedCollections;
    updatedMedia.sources = updatedSources;
    updateCurrentQuery(updatedMedia, null);
  }


  handleMediaChange = (sourceAndCollections) => {
    // the user has picked new sources and/or collections so we need to save in order to update the list onscreen
    const { selected, formQuery, updateCurrentQueryThenReselect } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
    };
    const updatedSources = sourceAndCollections.filter(m => m.type === 'source' || m.media_id);
    const updatedCollections = sourceAndCollections.filter(m => m.type === 'collection' || m.tags_id);
    updatedQuery.collections = updatedCollections;
    updatedQuery.sources = updatedSources;
    updateCurrentQueryThenReselect(updatedQuery);
  }

  isDeletable() {
    const { queries } = this.props;
    const unDeletedQueries = queries.filter(q => q.deleted !== true);
    return unDeletedQueries.length >= 2; // because we always have an empty query in the query array
  }

  handleDeleteAndSelectQuery(query) {
    const { queries, handleDeleteQuery } = this.props;
    const queryIndex = queries.findIndex(q => q.index !== null && q.index === query.index);
    const replaceSelectionWithWhichQuery = queryIndex === 0 ? 1 : 0; // replace with the query, not the position
    if (this.isDeletable()) {
      handleDeleteQuery(query, queries[replaceSelectionWithWhichQuery]);
    }
  }

  saveChangesToSelectedQuery() {
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = Object.assign({}, selected, formQuery);
    updateCurrentQuery(updatedQuery, 'label');
  }

  handleSelectedQueryChange(nextSelectedQuery, nextSelectedIndex) {
    const { handleQuerySelected } = this.props;
    // first update the one we are unmounting
    this.saveChangesToSelectedQuery();

    handleQuerySelected(nextSelectedQuery, nextSelectedQuery.index ? nextSelectedQuery.index : nextSelectedIndex);
  }

  saveAndSearch = () => {
    // wrap the save handler here because we need to save the changes to the selected query the user
    // might have made on the form, and then search
    const { onSearch, queries, isLoggedIn, updateOneQuery } = this.props;
    if (isLoggedIn) {
      this.saveChangesToSelectedQuery();
    } else {
      // for demo mode we have to save all the queries they entered first, and then search
      const nonDeletedQueries = queries.filter(q => q.deleted !== true);
      nonDeletedQueries.forEach((q) => {
        const queryText = document.getElementById(`query-${q.index}-q`).value;  // not super robust,
        const updatedQuery = {
          ...q,
          q: queryText,
        };
        updatedQuery.label = updatedQuery.autoNaming ? autoMagicQueryLabel(updatedQuery) : updatedQuery.label; // have to call this alone because input is the whole query
        updateOneQuery(updatedQuery);
      });
    }
    onSearch();
  }
  saveThisSearch = (queryName) => {
    const { queries, sendAndSaveUserSearch } = this.props; // formQuery same as selected
    // filter out removed ids...
    const searchstr = generateQueryParamString(queries.map(q => ({
      label: q.label,
      q: q.q,
      color: q.color,
      startDate: q.startDate,
      endDate: q.endDate,
      sources: q.sources,
      collections: q.collections,
    })));
    const userSearch = Object.assign({}, queryName, { timestamp: Date.now(), queryParams: searchstr });
    sendAndSaveUserSearch(userSearch);
  }

  render() {
    const { isLoggedIn, selected, queries, isEditable, handleLoadUserSearches, handleLoadSelectedSearch, handleDeleteUserSearch, savedSearches, handleCopyAll } = this.props;
    const { formatMessage } = this.props.intl;
    let queryPickerContent; // editable if demo mode
    let queryFormContent; // hidden if demo mode
    let fixedQuerySlides;
    let canSelectMedia = false;

    const unDeletedQueries = queries.filter(q => q.deleted !== true);
    if (unDeletedQueries && unDeletedQueries.length > 0 && selected) {
      fixedQuerySlides = unDeletedQueries.map((query, index) => (
        <div key={index}>
          <QueryPickerItem
            isLoggedIn={isLoggedIn}
            key={index}
            query={query}
            isSelected={selected.index === query.index}
            isLabelEditable={isEditable} // if custom, true for either mode, else if logged in no
            isDeletable={() => this.isDeletable()}
            displayLabel={false}
            onQuerySelected={() => this.handleSelectedQueryChange(query, index)}
            updateQueryProperty={(propertyName, newValue) => this.updateQueryProperty(query, propertyName, newValue)}
            updateDemoQueryLabel={newValue => this.updateDemoQueryLabel(query, newValue)}
            onSearch={this.saveAndSearch}
            onDelete={() => this.handleDeleteAndSelectQuery(query)}
            // loadDialog={loadQueryEditDialog}
          />
        </div>
      ));
      canSelectMedia = isLoggedIn;
      // provide the add Query button, load with default values when Added is clicked
      if (isLoggedIn || isEditable) {
        const colorPallette = idx => d3.schemeCategory10[idx % 10];
        const dateObj = getDateRange(PAST_MONTH);
        dateObj.start = solrFormat(dateObj.start);
        dateObj.end = solrFormat(dateObj.end);
        if (unDeletedQueries.length > 0) {
          dateObj.start = unDeletedQueries[unDeletedQueries.length - 1].startDate;
          dateObj.end = unDeletedQueries[unDeletedQueries.length - 1].endDate;
        }
        const newIndex = queries.length; // all queries, including 'deleted' ones
        const genDefColor = colorPallette(newIndex);
        const newQueryLabel = `Query ${String.fromCharCode('A'.charCodeAt(0) + newIndex)}`;
        const defaultQueryField = isLoggedIn ? '*' : '';
        const defaultQuery = { index: newIndex, label: newQueryLabel, q: defaultQueryField, description: 'new', startDate: dateObj.start, endDate: dateObj.end, collections: DEFAULT_COLLECTION_OBJECT_ARRAY, sources: [], color: genDefColor, autoNaming: true };

        const emptyQuerySlide = (
          <div key={fixedQuerySlides.length}>
            <div className="query-picker-item">
              <div className="add-query-item">
                <AddQueryButton
                  key={fixedQuerySlides.length} // this isn't working
                  tooltip={formatMessage(localMessages.addQuery)}
                  onClick={() => this.addAQuery(defaultQuery)}
                />
                <a href="" onTouchTap={() => this.addAQuery(defaultQuery)}><FormattedMessage {...localMessages.addQuery} /></a>
              </div>
            </div>
          </div>
        );

        fixedQuerySlides.push(emptyQuerySlide);
      }
      let demoSearchButtonContent; // in demo mode we need a search button outside the form (cause we can't see the form)
      if (!isLoggedIn) {
        demoSearchButtonContent = (
          <Grid>
            <Row>
              <Col lg={10}>
                <div className="query-help-info">
                  <QueryHelpDialog />
                </div>
              </Col>
              <Col lg={1}>
                <AppButton
                  style={{ marginTop: 30 }}
                  type="submit"
                  label={formatMessage(messages.search)}
                  color="primary"
                  onTouchTap={this.saveAndSearch}
                />
              </Col>
            </Row>
          </Grid>
        );
      }
      queryPickerContent = (
        <div className="query-picker-wrapper">
          <div className="query-picker">
            <Grid>
              <ItemSlider
                title={formatMessage(localMessages.intro)}
                slides={fixedQuerySlides}
                settings={{ height: 60, dots: false, slidesToShow: 4, slidesToScroll: 1, infinite: false, arrows: fixedQuerySlides.length > 4 }}
              />
            </Grid>
          </div>
          {demoSearchButtonContent}
        </div>
      );
      if (isLoggedIn) {  // if logged in show full form
        queryFormContent = (
          <QueryForm
            initialValues={selected}
            selected={selected}
            searchNickname={queries.map(q => q.label).join(', ')}
            savedSearches={savedSearches}
            form="queryForm"
            enableReinitialize
            destroyOnUnmount={false}
            buttonLabel={formatMessage(localMessages.querySearch)}
            onSave={this.saveAndSearch}
            onColorChange={this.handleColorChange}
            onMediaChange={this.handleMediaChange}
            onMediaDelete={this.handleMediaDelete}
            onDateChange={(dateObject, newValue) => this.updateQueryProperty(selected, dateObject.currentTarget.name, newValue)}
            handleLoadSearches={handleLoadUserSearches}
            handleLoadSelectedSearch={handleLoadSelectedSearch}
            handleSaveSearch={l => this.saveThisSearch(l)}
            handleDeleteSearch={l => handleDeleteUserSearch(l)}
            handleCopyAll={property => handleCopyAll(property, selected, queries)}
            isEditable={canSelectMedia}
            focusRequested={this.focusRequested}
            // TODO change to on
          />
        );
      }
      // indicate which queryPickerItem is selected -
      // const selectedWithSandCLabels = queries.find(q => q.index === selected.index);
      return (
        <div>
          {queryPickerContent}
          {queryFormContent}
        </div>
      );
    }
    return (
      <div>error - no queries</div>
    );
  }
}

QueryPicker.propTypes = {
  // from state
  selected: PropTypes.object,
  queries: PropTypes.array,
  isLoggedIn: PropTypes.bool.isRequired,
  formQuery: PropTypes.object,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleQuerySelected: PropTypes.func.isRequired,
  updateCurrentQuery: PropTypes.func.isRequired,
  updateCurrentQueryThenReselect: PropTypes.func.isRequired,
  addAQuery: PropTypes.func.isRequired,
  handleLoadUserSearches: PropTypes.func.isRequired,
  handleLoadSelectedSearch: PropTypes.func.isRequired,
  savedSearches: PropTypes.array.isRequired,
  sendAndSaveUserSearch: PropTypes.func.isRequired,
  handleDeleteUserSearch: PropTypes.func.isRequired,
  handleDeleteQuery: PropTypes.func.isRequired,
  handleCopyAll: PropTypes.func.isRequired,
  updateOneQuery: PropTypes.func.isRequired,
  // from parent
  isEditable: PropTypes.bool.isRequired,
  isDeletable: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  selected: state.explorer.selected,
  queries: state.explorer.queries.queries ? state.explorer.queries.queries : null,
  isLoggedIn: state.user.isLoggedIn,
  formQuery: formSelector(state, 'q', 'color', 'media', 'startDate', 'endDate'),
  savedSearches: state.explorer.savedSearches.list,
});


const mapDispatchToProps = (dispatch, ownProps) => ({
  handleQuerySelected: (query, index) => {
    const queryWithIndex = Object.assign({}, query, { index }); // if this doesn't exist...
    dispatch(selectQuery(queryWithIndex));
  },
  updateCurrentQueryThenReselect: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
      dispatch(selectQuery(query));
    }
  },
  updateCurrentQuery: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
    }
  },
  updateOneQuery: (query) => {
    dispatch(updateQuery({ query }));
  },
  addAQuery: (query) => {
    if (query) {
      dispatch(addCustomQuery(query));
      dispatch(selectQuery(query));
    }
  },
  handleCopyAll: (whichFilter, selected, queries) => {
    // formQuery
    let field = null;
    if (whichFilter === KEYWORD) {
      field = { q: selected[whichFilter] };
    } else if (whichFilter === DATES) {
      field = { startDate: selected.startDate, endDate: selected.endDate };
    } else if (whichFilter === MEDIA) {
      field = { collections: selected.collections, sources: selected.sources };
    }
    queries.map((query) => {
      if (selected.index !== query.index) {
        return dispatch(copyAndReplaceQueryField({ whichFilter, index: query.index, field }));
      }
      return null;
    });
  },
  handleLoadUserSearches: () => {
    dispatch(loadUserSearches());
  },
  handleLoadSelectedSearch: (selectedSearch) => {
    if (selectedSearch && selectedSearch.queryParams) {
      window.location = `https://explorer.mediacloud.org/#/queries/search?q=${selectedSearch.queryParams}`;
    }
  },
  handleDeleteUserSearch: (selectedSearch) => {
    if (selectedSearch && selectedSearch.queryName) {
      dispatch(deleteUserSearch(selectedSearch))
      .then((results) => {
        if (results.success) {
          dispatch(loadUserSearches());
        } else {
          dispatch(updateFeedback({
            open: true,
            message: ownProps.intl.formatMessage(localMessages.deleteFailed),
          }));
        }
      });
    }
  },
  sendAndSaveUserSearch: (savedSearch) => {
    if (savedSearch) {
      dispatch(saveUserSearch(savedSearch));
    }
  },
  handleDeleteQuery: (query, replacementSelectionQuery) => {
    if (query) {
      dispatch(markAsDeletedQuery(query));
      dispatch(selectQuery(replacementSelectionQuery));
    }
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      QueryPicker
    )
  );

