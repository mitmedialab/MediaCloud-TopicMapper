import { UPDATE_QUERY, UPDATE_QUERY_COLLECTION_LOOKUP_INFO, UPDATE_QUERY_SOURCE_LOOKUP_INFO, UPDATE_QUERY_SEARCH_LOOKUP_INFO, ADD_CUSTOM_QUERY, SAVE_PARSED_QUERIES, MARK_AS_DELETED_QUERY, RESET_QUERIES, REMOVE_DELETED_QUERIES, COPY_AND_REPLACE_QUERY_FIELD, REMOVE_NEW_STATUS, SWAP_SORT_QUERIES } from '../../../actions/explorerActions';
import { autoMagicQueryLabel, lookupReadableMetadataName } from '../../../lib/explorerUtil';

const INITIAL_STATE = [];

function shiftSortPositions(state, position) {
  const updatedState = [...state];
  updatedState.map((q, index) => {
    if (index >= position) {
      updatedState[index].sortPosition += 1;
    }
    return updatedState[index];
  });
  return updatedState;
}
function swapSortPositions(state, fromQuery, toPosition) {
  const updatedState = [...state];
  const highestPosition = updatedState.reduce((a, b) => (a.sortPosition > b.sortPosition ? a : b)).sortPosition;
  const fromQueryIndex = state.findIndex(q => q.uid !== null && q.uid === fromQuery.uid);
  updatedState.map((q, index) => {
    if (q.sortPosition === toPosition) {
      updatedState[index].sortPosition = fromQuery.sortPosition;
    }
    return q;
  });
  updatedState[fromQueryIndex].sortPosition = toPosition > highestPosition ? highestPosition : toPosition; // prevent inflation at end of list
  return updatedState;
}

function queries(state = INITIAL_STATE, action) {
  let updatedState = null;
  let queryIndex = -1;
  switch (action.type) {
    case ADD_CUSTOM_QUERY:
      updatedState = [...state];
      updatedState = shiftSortPositions(state, action.payload.sortPosition); // increment sortPosition for all queries 'behind' new query
      updatedState.push(action.payload);
      return updatedState;
    case UPDATE_QUERY:
      if (action.payload.query) { // update entire query object versus field at a time like in selected reducer
        updatedState = [...state];
        queryIndex = state.findIndex(q => q.uid !== null && q.uid === action.payload.query.uid);
        // we may not have an id if this is a custom query, use index. -- update we may not even use ID... TBD
        queryIndex = queryIndex > -1 ? queryIndex : action.payload.query.uid;
        updatedState[queryIndex] = action.payload.query;
        if (updatedState[queryIndex].autoNaming) {
          updatedState[queryIndex].label = autoMagicQueryLabel(updatedState[queryIndex]);
        }
        if (updatedState[queryIndex].q === '*' || updatedState[queryIndex].q === '') {
          updatedState[queryIndex].autoNaming = true;
        }
        return updatedState;
      }
      return null;
    case COPY_AND_REPLACE_QUERY_FIELD: // replace property

      if (action.payload.uid !== undefined && action.payload.field) {
        queryIndex = state.findIndex(q => q.uid !== null && q.uid === action.payload.uid);
        updatedState = [...state];
        updatedState[queryIndex] = { ...updatedState[queryIndex], ...action.payload.newValues };
        updatedState[queryIndex].label = action.payload.newValues.q ? action.payload.newValues.q : updatedState[queryIndex].label;
        return updatedState;
      }
      return null;
    case UPDATE_QUERY_SOURCE_LOOKUP_INFO:
      if (action.payload && state && state.length > 0) { // just for safety
        updatedState = [...state];
        queryIndex = state.findIndex(q => q.uid !== null && q.uid === action.payload.uid);
        if (queryIndex === -1) {
          // we didn't fine the query uid we are looking for, so this is an error
          // so swallow the error for now with no updates
          return state;
        }
        queryIndex = queryIndex > -1 ? queryIndex : action.payload.uid;
        updatedState[queryIndex].sources = action.payload.sources.results.map(r => ({ ...r, selected: true }));
        return updatedState;
      }
      return null;
    case UPDATE_QUERY_COLLECTION_LOOKUP_INFO:
      if (action.payload && state && state.length > 0) { // just for safety
        updatedState = [...state];
        queryIndex = state.findIndex(q => q.uid !== null && q.uid === action.payload.uid);
        if (queryIndex === -1) {
          // we didn't fine the query uid we are looking for, so this is an error
          // so swallow the error for now with no updates
          return state;
        }
        updatedState[queryIndex].collections = action.payload.collections.results.map(r => ({ ...r, selected: true }));
        return updatedState;
      }
      return null;
    case UPDATE_QUERY_SEARCH_LOOKUP_INFO:
      if (action.payload && state && state.length > 0) { // just for safety
        updatedState = [...state];
        queryIndex = state.findIndex(q => q.uid !== null && q.uid === action.payload.uid);
        if (queryIndex === -1) {
          // we didn't find the query uid we are looking for, so this is an error
          // so swallow the error for now with no updates
          return state;
        }
        const searches = [];
        // for each searchoject in the array, see what tags have entries, and go through them and make the tags readable and selected
        action.payload.searches.results.map((searchObj) => {
          if (searchObj && searchObj.tags) {
            const updatedCustonObj = {};
            if (!updatedCustonObj.tags) updatedCustonObj.tags = {};
            Object.keys(searchObj.tags).forEach((m) => { // for each tag
              const vals = Object.values(searchObj.tags[m]).map(a => a.tags_id);
              if (vals && vals.length > 0) {
                const tagSet = Object.values(searchObj.tags[m]).map(a => a.tag_sets_id).reduce(ts => ts);
                const readableName = lookupReadableMetadataName(tagSet);
                updatedCustonObj.tags[readableName] = Object.values(searchObj.tags[m]).map(a => ({ ...a, selected: true }));
              }
              return null;
            });
            updatedCustonObj.customColl = true; // action.payload.searches.results.customColl;
            updatedCustonObj.mediaKeyword = searchObj.media_keyword;
            updatedCustonObj.id = searchObj.id; // from python when loaded in
            searches.push(updatedCustonObj);
            return null;
          }
          return null;
        });
        updatedState[queryIndex].searches = searches;
        return updatedState;
      }
      return null;
    case SAVE_PARSED_QUERIES: // select this set of queries as passed in by URL
      updatedState = action.payload.map(q => ({ ...q, autoNaming: q.q === '*' || q.q === '' ? true : q.autoNaming }));
      return updatedState;
    case MARK_AS_DELETED_QUERY:
      if (action.payload) {
        updatedState = [...state];
        if (updatedState.length === 1) return updatedState; // they can't delete all the queries
        queryIndex = updatedState.findIndex(q => q.uid !== null && q.uid === action.payload.uid);

        updatedState[queryIndex].deleted = true;
        return updatedState;
      }
      return state;
    case REMOVE_NEW_STATUS:
      const queryData = [...state.map(q => ({ ...q, new: false }))];
      updatedState = queryData;
      return updatedState;
    case REMOVE_DELETED_QUERIES:
      return state.filter(q => !q.deleted);
    case SWAP_SORT_QUERIES:
      updatedState = [...state];
      return swapSortPositions(state, action.payload.from, action.payload.to);
    case RESET_QUERIES:
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default queries;
