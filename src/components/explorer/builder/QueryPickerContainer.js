import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import * as d3 from 'd3';
import messages from '../../../resources/messages';
import QueryForm from './QueryForm';
import AppButton from '../../common/AppButton';
import ItemSlider from '../../common/ItemSlider';
import QueryPickerItem from './QueryPickerItem';
import { QUERY_COLORS } from '../../common/ColorPicker';
import { updateFeedback } from '../../../actions/appActions';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';
import { selectQuery, updateQuery, addCustomQuery, loadUserSearches, saveUserSearch, deleteUserSearch, markAsDeletedQuery, copyAndReplaceQueryField, swapSortQueries } from '../../../actions/explorerActions';
import { AddQueryButton } from '../../common/IconButton';
import { getDateRange, solrFormat, PAST_MONTH } from '../../../lib/dateUtil';
import { autoMagicQueryLabel, KEYWORD, DATES, MEDIA,
  DEFAULT_COLLECTION_OBJECT_ARRAY, replaceCurlyQuotes, uniqueQueryId, LEFT, prepSearches, getQFromCodeMirror } from '../../../lib/explorerUtil';
import { ALL_MEDIA } from '../../../lib/mediaUtil';
import { queryAsString } from '../../../lib/stringUtil';

const localMessages = {
  mainTitle: { id: 'explorer.querypicker.mainTitle', defaultMessage: 'Query List' },
  intro: { id: 'explorer.querypicker.intro', defaultMessage: 'Here are all available queries' },
  addQuery: { id: 'explorer.querypicker.addQuery', defaultMessage: 'Add query' },
  querySearch: { id: 'explorer.queryBuilder.advanced', defaultMessage: 'Search' },
  searchHint: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Search' },
  deleteFailed: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Sorry, deleting your search failed for some reason.' },
};

const formSelector = formValueSelector('queryForm');

class QueryPickerContainer extends React.Component {
  getAllActiveQueries = queries => (queries.filter(q => q.deleted !== true));

  handleColorChange = (newColorInfo) => {
    // when user changes color we want to change it on all charts right away
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
      color: newColorInfo.value,
    };
    updateCurrentQuery(updatedQuery, 'color');
  }

  handleMediaDelete = (toBeDeletedObj) => {
    // the user has removed media from the Query Form SourceCollectionsFieldList
    const { selected, formQuery, updateCurrentQuery } = this.props; // formQuery same as selected
    // filter out removed ids...
    const updatedMedia = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
    };
    const updatedSources = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'source' || m.media_id));
    const updatedCollections = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'collection' || m.tags_id));
    updatedMedia.collections = updatedCollections;
    updatedMedia.sources = updatedSources;
    updatedMedia.searches = formQuery.media.filter(m => (((m.tags === undefined && m.tags === toBeDeletedObj.tags && m.customColl) || (m.tags !== undefined && m.tags !== toBeDeletedObj.tags && m.customColl))));
    updatedMedia.media = [];
    updateCurrentQuery(updatedMedia, null);
  }

  handleMediaChange = (sourceAndCollections) => {
    // the user has picked new sources and/or collections so we need to save in order to update the list onscreen
    const { selected, formQuery, updateCurrentQueryThenReselect } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
    };
    if (sourceAndCollections.filter(m => m.id === ALL_MEDIA).length === 0) {
      const updatedSources = sourceAndCollections.filter(m => m.type === 'source' || m.media_id);
      const updatedCollections = sourceAndCollections.filter(m => m.type === 'collection' || m.tags_id);
      const updatedSearches = sourceAndCollections.filter(m => m.customColl);
      updatedQuery.collections = updatedCollections;
      updatedQuery.sources = updatedSources;
      updatedQuery.searches = updatedSearches;
      updateCurrentQueryThenReselect(updatedQuery);
    } else {
      updatedQuery.collections = sourceAndCollections; // push ALL_MEDIA selection into query so it shows up
      updatedQuery.sources = [];
      updateCurrentQueryThenReselect(updatedQuery);
    }
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
        const queryText = document.getElementById(`query-${q.uid}-q`).value; // not super robust,
        const cleanedQueryText = replaceCurlyQuotes(queryText);
        const updatedQuery = {
          ...q,
          q: cleanedQueryText,
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

    const queriesToSave = queries.map(q => ({
      label: q.label,
      q: replaceCurlyQuotes(q.q),
      color: q.color,
      startDate: q.startDate,
      endDate: q.endDate,
      sources: q.sources.map(m => m.media_id),
      collections: q.collections.map(c => c.tags_id),
      searches: prepSearches(q.searches),
    }));
    const userSearch = {
      ...queryName,
      timestamp: Date.now(),
      queries: JSON.stringify(queriesToSave),
    };
    sendAndSaveUserSearch(userSearch);
  }

  handleSelectedQueryChange = (nextSelectedQuery) => {
    const { handleQuerySelected } = this.props;
    // first update the one we are unmounting
    this.saveChangesToSelectedQuery();

    handleQuerySelected(nextSelectedQuery);
  }

  handleDeleteAndSelectQuery = (query) => {
    const { queries, handleDeleteQuery } = this.props;
    const queryIndex = queries.findIndex(q => q.uid !== null && q.uid === query.uid);
    const replaceSelectionWithWhichQuery = queryIndex === 0 ? 1 : 0; // replace with the query, not the position
    if (this.isDeletable()) {
      handleDeleteQuery(query, queries[replaceSelectionWithWhichQuery]);
    }
  }

  saveChangesToSelectedQuery = () => {
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      color: selected.color,
    };
    // handle a text query, or a codemirror object
    const queryText = (typeof updatedQuery.q === 'string') ? updatedQuery.q : updatedQuery.q.getValue();
    updatedQuery.q = replaceCurlyQuotes(queryText);
    updateCurrentQuery(updatedQuery, 'label');
  }

  isDeletable = () => {
    const { queries } = this.props;
    const unDeletedQueries = queries.filter(q => q.deleted !== true);
    return unDeletedQueries.length >= 2; // because we always have an empty query in the query array
  }

  updateDemoQueryLabel = (query, newValue) => {
    // update both label and q for query
    const { updateCurrentQuery } = this.props;
    const updatedQuery = { ...query };
    updatedQuery.label = newValue;
    updatedQuery.q = newValue;
    updatedQuery.autoNaming = false;
    updateCurrentQuery(updatedQuery, 'label');
  }

  // called by query picker to update things like label or color
  updateQueryProperty = (query, propertyName, newValue) => {
    const { updateCurrentQuery, formQuery } = this.props;
    const updatedQuery = {
      ...query,
      ...formQuery,
    };
    updatedQuery[propertyName] = newValue;
    if (propertyName === 'label') { // no longer auto-name query if the user has intentionally changed it
      updatedQuery.autoNaming = false;
    }

    if (propertyName === 'q') {
      const queryText = (typeof newValue === 'string') ? newValue : newValue.getValue();
      const cleanedQ = replaceCurlyQuotes(queryText);
      updatedQuery.q = cleanedQ;
      if (updatedQuery.autoNaming) { // no longer auto-name query if the user has intentionally changed it
        updatedQuery.label = cleanedQ;
      }
    }
    // now update it in the store
    updateCurrentQuery(updatedQuery, propertyName);
  }

  render() {
    const { isLoggedIn, selected, queries, isEditable, addAQuery, handleLoadUserSearches, formQuery,
      handleDeleteUserSearch, savedSearches, handleCopyAll, handleDuplicateQuery, handleMoveAndSwap } = this.props;
    const { formatMessage } = this.props.intl;
    let queryPickerContent; // editable if demo mode
    let queryFormContent; // hidden if demo mode
    let fixedQuerySlides;
    let canSelectMedia = false;

    const unDeletedQueries = this.getAllActiveQueries(queries);
    if (unDeletedQueries && unDeletedQueries.length > 0 && selected) {
      fixedQuerySlides = unDeletedQueries.sort((a, b) => a.sortPosition - b.sortPosition);
      fixedQuerySlides = fixedQuerySlides.map((query, index) => (
        <div key={index}>
          <QueryPickerItem
            isLoggedIn={isLoggedIn}
            key={index}
            query={query}
            isSelected={selected.uid === query.uid}
            isLabelEditable={isEditable} // if custom, true for either mode, else if logged in no
            isDeletable={() => this.isDeletable()}
            displayLabel={false}
            onQuerySelected={(newlySelectedQuery) => {
              if (selected.uid !== newlySelectedQuery.uid) {
                this.handleSelectedQueryChange(newlySelectedQuery);
              }
            }}
            updateQueryProperty={(propertyName, newValue) => this.updateQueryProperty(query, propertyName, newValue)}
            updateDemoQueryLabel={newValue => this.updateDemoQueryLabel(query, newValue)}
            onSearch={this.saveAndSearch}
            onDelete={() => this.handleDeleteAndSelectQuery(query)}
            onMove={direction => handleMoveAndSwap(query, direction, queries)}
            onDuplicate={() => handleDuplicateQuery(query, queries)}
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
        const newUid = Math.floor((Math.random() * 10000) + 1);
        const newPosition = queries.reduce((a, b) => (a.sortPosition > b.sortPosition ? a : b)).sortPosition + 1;
        const genDefColor = colorPallette(newPosition);
        const newQueryLabel = `Query ${String.fromCharCode('A'.charCodeAt(0) + newPosition)}`;
        const defaultQueryField = '';
        const defaultDemoQuery = { uid: newUid, sortPosition: newPosition, new: true, label: newQueryLabel, q: defaultQueryField, description: 'new', startDate: dateObj.start, endDate: dateObj.end, collections: DEFAULT_COLLECTION_OBJECT_ARRAY, sources: [], color: genDefColor, autoNaming: true };
        const defaultQuery = { uid: newUid, sortPosition: newPosition, new: true, label: newQueryLabel, q: defaultQueryField, description: 'new', startDate: dateObj.start, endDate: dateObj.end, searches: [], collections: [], sources: [], color: genDefColor, autoNaming: true };

        const emptyQuerySlide = (
          <div key={fixedQuerySlides.length}>
            <div className="query-picker-item">
              <div className="add-query-item">
                <AddQueryButton
                  key={fixedQuerySlides.length} // this isn't working
                  tooltip={formatMessage(localMessages.addQuery)}
                  onClick={() => addAQuery(isLoggedIn ? defaultQuery : defaultDemoQuery)}
                />
                <a
                  href="#add-query"
                  onClick={(evt) => { evt.preventDefault(); addAQuery(isLoggedIn ? defaultQuery : defaultDemoQuery); }}
                >
                  <FormattedMessage {...localMessages.addQuery} />
                </a>
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
                  <QueryHelpDialog trigger={formatMessage(messages.queryHelpLink)} />
                </div>
              </Col>
              <Col lg={1}>
                <AppButton
                  style={{ marginTop: 30 }}
                  type="submit"
                  label={formatMessage(messages.search)}
                  color="primary"
                  onClick={this.saveAndSearch}
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
      if (isLoggedIn) { // if logged in show full form
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
            onLoadSearches={handleLoadUserSearches}
            onSaveSearch={l => this.saveThisSearch(l)}
            onDeleteSearch={l => handleDeleteUserSearch(l)}
            onCopyAll={property => handleCopyAll(property, selected.uid, queries, formQuery)}
            isEditable={canSelectMedia}
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

QueryPickerContainer.propTypes = {
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
  handleDuplicateQuery: PropTypes.func.isRequired,
  savedSearches: PropTypes.array.isRequired,
  sendAndSaveUserSearch: PropTypes.func.isRequired,
  handleDeleteUserSearch: PropTypes.func.isRequired,
  handleDeleteQuery: PropTypes.func.isRequired,
  handleCopyAll: PropTypes.func.isRequired,
  updateOneQuery: PropTypes.func.isRequired,
  handleMoveAndSwap: PropTypes.func.isRequired,
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
  handleQuerySelected: (query) => {
    dispatch(selectQuery(query));
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
  handleCopyAll: (whichFilter, selectedUid, queries, currentFormValues) => {
    // formQuery
    let newValues = null;
    if (whichFilter === KEYWORD) {
      const q = { q: (typeof currentFormValues.q === 'string') ? currentFormValues.q : getQFromCodeMirror(currentFormValues.q) };
      newValues = q;
    } else if (whichFilter === DATES) {
      newValues = { startDate: currentFormValues.startDate, endDate: currentFormValues.endDate };
    } else if (whichFilter === MEDIA) {
      newValues = {
        collections: currentFormValues.media.filter(obj => obj.tags_id),
        sources: currentFormValues.media.filter(obj => obj.media_id),
        searches: currentFormValues.media.filter(obj => obj.tags),
      };
    }
    queries.map((query) => {
      if (selectedUid !== query.uid) {
        return dispatch(copyAndReplaceQueryField({ field: whichFilter, uid: query.uid, newValues }));
      }
      return null;
    });
  },
  handleLoadUserSearches: () => {
    dispatch(loadUserSearches());
  },
  handleDeleteUserSearch: (selectedSearch) => {
    if (selectedSearch && selectedSearch.queryName) {
      dispatch(deleteUserSearch(selectedSearch))
        .then((results) => {
          if (results.success) {
            dispatch(loadUserSearches());
          } else {
            dispatch(updateFeedback({
              classes: 'error-notice',
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
  handleMoveAndSwap: (query, direction, queries) => {
    const movedQuery = { ...query };
    const highestSortPosition = queries.reduce((a, b) => (a.sortPosition > b.sortPosition ? a : b)).sortPosition;
    const newSortPosition = direction === LEFT ? movedQuery.sortPosition - 1 : movedQuery.sortPosition + 1;
    if (newSortPosition > highestSortPosition) { // don't inflate sortPosition needlessly
      return;
    }
    dispatch(swapSortQueries({ from: query, to: newSortPosition }));
    dispatch(updateQuery({ query }));
  },
  handleDuplicateQuery: (query, queries) => {
    // smartly pick a new color for this query
    const colorsInUse = queries.map(q => q.color);
    const availableColors = QUERY_COLORS.filter(c => colorsInUse.indexOf(c) === -1);
    const nextColor = (availableColors.length > 0) ? availableColors[0] : QUERY_COLORS[0];
    // and dupliate the sucker
    const dupeQuery = {
      ...query,
      uid: uniqueQueryId(),
      sortPosition: query.sortPosition + 1,
      results: undefined,
      color: nextColor,
      new: true,
    }; // what is the index?
    if (query) {
      dispatch(addCustomQuery(dupeQuery));
      dispatch(selectQuery(dupeQuery));
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    QueryPickerContainer
  )
);
