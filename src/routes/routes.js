import getStore from '../store';

function isLoggedIn() {
  const store = getStore();
  const state = store.getState();
  return state.user.isLoggedIn === true;
}

function hasConsented() {
  const store = getStore();
  const state = store.getState();
  return state.user.profile.has_consented === true;
}

// We need to restrict some routes to only users that are logged in
export function requireAuth(nextState, replace) {
  if (!isLoggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname },
    });
    return false;
  }
  if (!hasConsented()) {
    if (nextState.location.pathname !== '/user/consent') { // from login or other
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname },
      });
    }
    return false;
  }
  return true;
}

export function redirectHomeIfLoggedIn(nextState, replace) {
  if (isLoggedIn() && hasConsented()) {
    replace({ pathname: '/home' });
    return true;
  }
  return false;
}

export function requiresUrlParams(...params) {
  return (nextState, replaceState) => {
    for (let i = 0; i < params.length; i += 1) {
      if (nextState.location.query[params[i]] === undefined) {
        replaceState('/home');
        return;
      }
    }
  };
}
