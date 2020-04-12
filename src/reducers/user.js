import { resolve, reject } from 'redux-simple-promise';
import Raven from 'raven-js';
import { LOGIN_WITH_PASSWORD, LOGIN_WITH_COOKIE, RESET_API_KEY, UPDATE_PROFILE } from '../actions/userActions';
import * as fetchConstants from '../lib/fetchConstants';

const INITIAL_STATE = {
  fetchStatus: fetchConstants.FETCH_INVALID,
  isLoggedIn: false,
  isAdmin: false,
  key: null,
};

function setRavenUserContext(userInfo) {
  if (userInfo) {
    Raven.setUserContext({ email: userInfo.email });
  }
}

function resetRavenUserContext() {
  Raven.setUserContext();
}

const isAdmin = profile => (((profile) && (profile.auth_roles) && Array.isArray(profile.auth_roles)) ? profile.auth_roles.filter(r => r === 'admin').length > 0 : false);

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOGIN_WITH_PASSWORD:
      return { ...state,
        fetchStatus: fetchConstants.FETCH_ONGOING,
        isLoggedIn: false,
        ...action.payload };
    case resolve(LOGIN_WITH_PASSWORD):
      setRavenUserContext(action.payload);
      const passwordLoginWorked = (action.payload.statusCode !== 500);
      return { ...state,
        fetchStatus: fetchConstants.FETCH_SUCCEEDED,
        isLoggedIn: passwordLoginWorked,
        isAdmin: passwordLoginWorked ? isAdmin(action.payload.profile) : false,
        ...action.payload };
    case reject(LOGIN_WITH_PASSWORD):
      resetRavenUserContext();
      return { ...state,
        fetchStatus: fetchConstants.FETCH_FAILED,
        isLoggedIn: false };

    case LOGIN_WITH_COOKIE:
      return { ...state,
        fetchStatus: fetchConstants.FETCH_ONGOING,
        isLoggedIn: false,
        ...action.payload };
    case resolve(LOGIN_WITH_COOKIE):
      setRavenUserContext(action.payload);
      const keyLoginWorked = (action.payload.statusCode !== 401);
      return { ...state,
        fetchStatus: fetchConstants.FETCH_SUCCEEDED,
        isLoggedIn: keyLoginWorked,
        isAdmin: keyLoginWorked ? isAdmin(action.payload.profile) : false,
        ...action.payload };
    case reject(LOGIN_WITH_COOKIE):
      resetRavenUserContext();
      return { ...state,
        fetchStatus: fetchConstants.FETCH_FAILED,
        isLoggedIn: false,
        key: null };

    case resolve(RESET_API_KEY):
      return { ...state,
        key: action.payload.profile.api_key,
        profile: { ...state.profile, ...action.payload.profile } };
    case resolve(UPDATE_PROFILE):
      return { ...state, profile: { ...state.profile, ...action.payload.profile } };
    default:
      return state;
  }
}
