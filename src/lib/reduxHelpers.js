import { resolve, reject } from 'redux-simple-promise';
import * as fetchConstants from './fetchConstants';
import { addNotice } from '../actions/appActions';
import { LEVEL_ERROR } from '../components/common/Notice';
import { logout } from './auth';

// TODO: replace this with normalizr? https://github.com/gaearon/normalizr
export function arrayToDict(arr, keyPropertyName) {
  const dict = {};
  arr.forEach((item) => {
    dict[item[keyPropertyName]] = item;
  });
  return dict;
}

// if all rows should be selected, or only page rows, or none, checked will tell us
// arr contains only a chunk of rows at a time... TODO
export function selectItemInArray(arr, idArr, idField, checked) {
  const updateWithNewlySelected = [];
  arr.forEach((item) => {
    const newItem = item;
    idArr.forEach((id) => {
      if (item[idField] === id) {
        if (checked) {
          newItem.selected = true;
        } else {
          newItem.selected = false;
        }
      }
    });
    updateWithNewlySelected.push(newItem);
  });
  return updateWithNewlySelected;
}

/**
 * Helper for generating async actions (these are promise-based).  Provide two params:
 * - `type`: the action type constant
 * - `fetcher`: the function object to run (args will be relayed automatically)
 * This returns an action function you can use.
 */
export function createAsyncAction(type, fetcher) {
  return (...args) => ({
    type,
    payload: {
      promise: fetcher(...args),
      args, // tack on arguments pass in so we can access them directly in a reducer
      uid: Math.random(), // track this request with a random id, to avoid race conditions in reducer
    },
  });
}

/**
 * Helper to create a generic reducer.  Pass in an object with the following properties:
 * - `intialState`: the intial state to use for this recuder (default to empty object)
 * - `[OTHER_CONSTANTS]`: any other constants will be added as extra checks (this lets you include other actions in this reducer)
 */
export function createReducer(handlers) {
  // there might be intial state we need to set up
  let desiredInitialState = {};
  if ('initialState' in handlers) {
    desiredInitialState = handlers.initialState;
  }
  // set up a lookup table for any things the user passed in
  const actionLookup = {};
  Object.keys(handlers).forEach((key) => {
    if (!['initialState'].includes(key)) {
      actionLookup[key] = handlers[key];
    }
  });
  // and now set up the reducer method
  return (state = desiredInitialState, action) => {
    if (action.type in actionLookup) {
      // run the reducer and if it returns new things, change the state
      const reducerResults = actionLookup[action.type](action.payload, state);
      if (reducerResults) {
        return { ...state,
          ...state,
          ...reducerResults };
      }
      // otherwise return the state as is so the object itself doesn't change and trigger a dumb re-render
      return state;
    }
    // otherwise this isn't an action we need to handle, so just return the state as is
    return state;
  };
}

/**
 * Helper for generating generic async reducers.  Pass in an object with the following properties
 * (each is optional):
 * - `initialState`: the initial state for this reducer (defaults to empty object)
 * - `handleFetch`: any state to set when the action is first dispatched (defaults to empty)
 * - `handleSuccess`: any state to set when the async call returns successfully (defaults to `{...payload}`)
 * - `handleFailure`: any state to set when the action is first dispatched (defaults to empty)
 * - `[OTHER_CONSTANTS]`: any other constants will be added as extra checks (this lets you include other actions in this reducer)
 * This handles setting the fetchState to the appropriate item from `fetchConstants` for you. So you can
 * write reducers like this and they will act like you'd expect:
 * ```es6
 * const topWords = createAsyncReducer({
 *  initialState: {
 *    list: [],
 *  },
 *  action: FETCH_STUFF,
 * });
 * ```
 */
export function createAsyncReducer(handlers) {
  // there might be intial state we need to set up
  let desiredInitialState = {};
  if ('initialState' in handlers) {
    desiredInitialState = handlers.initialState;
  }
  const initialState = {
    fetchStatus: fetchConstants.FETCH_INVALID, // invalid, succeeded, or failed
    lastFetchSuccess: null, // null or a Date object of the last successful fetch
    fetchUid: null, // set this to a random id so we know which request is returning async, to avoid race conditions
    ...desiredInitialState,
  };
  // set up any async reducer handlers the user passed in
  const reducers = { // set up some smart defaults for normal behaviour
    handleFetch: () => ({}),
    handleSuccess: payload => ({ ...payload }),
    handleFailure: () => ({}),
  };
  Object.keys(reducers).forEach((key) => { // override defaults with custom methods passed in
    if (key in handlers) {
      reducers[key] = handlers[key];
    }
  });
  // set up a lookup table for any other things the user passed in
  const extraActionLookup = {};
  Object.keys(handlers).forEach((key) => {
    if (!['action', 'initialState', 'handleFetch', 'handleSuccess', 'handleFailure'].includes(key)) {
      extraActionLookup[key] = handlers[key];
    }
  });
  // now alter the state appropriately
  return (state = initialState, action) => {
    // only do something if this hasn't been superceeded by another aysnc request before this one returned
    let isValid = true;
    if (action.meta) {
      isValid = action.meta.uid === state.fetchUid;
    }
    switch (action.type) {
      case handlers.action:
        return { ...state,
          ...state,
          fetchStatus: fetchConstants.FETCH_ONGOING,
          lastFetchSuccess: null,
          fetchUid: action.payload.uid,
          ...reducers.handleFetch(action.payload, state, action.meta) };
      case resolve(handlers.action):
        if (isValid) {
          return { ...state,
            ...state,
            fetchStatus: fetchConstants.FETCH_SUCCEEDED,
            lastFetchSuccess: new Date(),
            ...reducers.handleSuccess(action.payload, state, action.meta) };
        }
        // another request happened after this one, so don't do anything!
        return state;
      case reject(handlers.action):
        if (isValid) {
          return { ...state,
            ...state,
            fetchStatus: fetchConstants.FETCH_FAILED,
            lastFetchSuccess: null,
            ...reducers.handleFailure(action.payload, state, action.meta) };
        }
        // another request happened after this one, so don't do anything!
        return state;
      default:
        if (action.type in extraActionLookup) {
          return { ...state,
            ...state,
            ...extraActionLookup[action.type](action.payload, state, action.meta) };
        }
        return state;
    }
  };
}

/**
 * Report failures to user via app-level feedback mechanism.
 */
export function errorReportingMiddleware({ dispatch }) {
  return next => (action) => {
    let messageToShow = null;
    let die = false;
    if (action.type.endsWith('_RESOLVED') || action.type.endsWith('_REJECTED')) {
      if ((typeof action.payload === 'object') && ('statusCode' in action.payload)) {
        if (action.payload.statusCode === 401) {
          // unauthorized - ie. needs to login so delete cookies by going to logout
          if ((action.type !== 'LOGIN_WITH_PASSWORD_RESOLVED') && (action.type !== 'LOGIN_WITH_COOKIE_RESOLVED')) { // unless they are trying to login (cause that would be dumb)
            messageToShow = action.payload.message;
            logout();
          }
        } else if (action.payload.statusCode !== 200) {
          // if request failed in some other way, but it isn't login-related, qeueu up a generic error msg
          if ((action.type !== 'LOGIN_WITH_PASSWORD_RESOLVED') && (action.type !== 'LOGIN_WITH_COOKIE_RESOLVED')) { // unless they are trying to login (cause that would be dumb)
            messageToShow = 'Sorry, we had an error';
            if ('message' in action.payload) {
              messageToShow = action.payload.message;
            }
            die = true; // don't continue executing the action chain, because something bad happened
          }
        }
      }
    }
    if (messageToShow) {
      dispatch(addNotice({ level: LEVEL_ERROR, message: messageToShow }));
    }
    if (die) {
      dispatch({ type: action.type.replace('RESOLVED', 'REJECTED') }); // mark the action as failed (because it wasn't a 200!)
      return -1;
    }
    return next(action); // Call the next dispatch method in the middleware chain.
  };
}

/**
 * For any anyc reducers that query N of the same action in parallel, and want to hold the results
 * in an array of results.  This REQUIRES you to have a "uid" parameter in the action, so it knows
 * where to put the payload in the results array it holds.
 */
export function createIndexedAsyncReducer(handlers) {
  // there might be intial state we need to set up
  let desiredInitialState = {};
  if ('initialState' in handlers) {
    desiredInitialState = handlers.initialState;
  }
  const initialState = {
    results: {},
    fetchStatus: fetchConstants.FETCH_INVALID,
    fetchStatuses: {}, // array of fetchStatus
    ...desiredInitialState,
  };
  // set up any async reducer handlers the user passed in
  const reducers = { // set up some smart defaults for normal behaviour
    handleFetch: (payload, state, args) => {
      const firstArgWithUid = args.find(item => item.uid);
      const uid = firstArgWithUid ? firstArgWithUid.uid : undefined;
      if (uid === undefined) {
        const error = { error: 'You need to pass the indexedAsyncReducer an uid to use!' };
        throw error;
      }
      const updatedFetchStatuses = { ...state.fetchStatuses };
      updatedFetchStatuses[uid] = fetchConstants.FETCH_ONGOING;
      return { ...state,
        fetchStatus: fetchConstants.combineFetchStatuses(updatedFetchStatuses),
        fetchStatuses: updatedFetchStatuses,
        // NOT a good idea to set `results: null|[]|{}` here, because in case of a failure at least the last results will be there
      };
    },
    handleSuccess: (payload, state, args) => {
      const firstArgWithUid = args.find(item => item.uid);
      const uid = firstArgWithUid ? firstArgWithUid.uid : undefined;
      // update the appropriate fetchStatus
      const updatedFetchStatuses = { ...state.fetchStatuses };
      updatedFetchStatuses[uid] = fetchConstants.FETCH_SUCCEEDED;
      // if results already exist (by uid), we need to replace them, otherwise add them as new results
      const updatedResults = { ...state.results };
      let resultsToSave;
      if ('handleSuccess' in handlers) {
        const results = handlers.handleSuccess(payload, state, args, uid);
        resultsToSave = results;
      } else {
        resultsToSave = payload;
      }
      updatedResults[uid] = resultsToSave;
      return {
        ...state,
        fetchStatus: fetchConstants.combineFetchStatuses(updatedFetchStatuses),
        fetchStatuses: updatedFetchStatuses,
        results: updatedResults,
      };
    },
    handleFailure: (payload, state, args) => {
      const firstArgWithUid = args.find(item => item.uid);
      const uid = firstArgWithUid ? firstArgWithUid.uid : undefined;
      // update the appropriate fetch status
      const updatedFetchStatuses = { ...state.fetchStatuses };
      updatedFetchStatuses[uid] = fetchConstants.FETCH_FAILED;
      return { ...state,
        fetchStatus: fetchConstants.combineFetchStatuses(updatedFetchStatuses),
        fetchStatuses: updatedFetchStatuses,
      };
    },
  };
  // set up a lookup table for any other things the user passed in
  const extraActionLookup = {};
  Object.keys(handlers).forEach((key) => {
    if (!['action', 'initialState', 'handleFetch', 'handleSuccess', 'handleFailure'].includes(key)) {
      extraActionLookup[key] = handlers[key];
    }
  });
  // now alter the state appropriately
  return (state = initialState, action) => {
    switch (action.type) {
      case handlers.action:
        return reducers.handleFetch(action.payload, state, action.payload.args);
      case resolve(handlers.action):
        const uid = action.meta.args ? action.meta.args[0].uid : 0;
        const isValid = Object.keys(state.fetchStatuses).length > 0 && state.fetchStatuses[uid] !== null;
        if (!isValid) { // don't honor resolves that are for indexes we aren't tracking anymore
          return state;
        }
        return reducers.handleSuccess(action.payload, state, action.meta.args, action.meta);
      case reject(handlers.action):
        return reducers.handleFailure(action.payload, state, action.meta.args);
      default:
        if (action.type in extraActionLookup) {
          return { ...state,
            ...state,
            ...extraActionLookup[action.type](action.payload, state, action.args) };
        }
        return state;
    }
  };
}
