import 'babel-polyfill';
import 'intl';
import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
// currently using old AutoComplete, keeping old theme in context
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Router from 'react-router/lib/Router';
import hashHistory from 'react-router/lib/hashHistory';
import { syncHistoryWithStore } from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Raven from 'raven-js';
import { loginWithCookie } from './actions/userActions';
import getStore from './store';
import { getAppName, getVersion, isProdMode } from './config';
import { getBrandColors } from './styles/colors';

const APP_DOM_ELEMENT_ID = 'app';
const DEFAULT_LOCALE = 'en';

function reallyInitializeApp(routes) {
  // necessary lines for Material-UI library to work
  injectTapEventPlugin();

  const store = getStore(getAppName());

  // Create an enhanced history that syncs navigation events with the store
  const history = syncHistoryWithStore(hashHistory, store);

  const logPageView = () => {
    // only log hits to google analytics when in production mode
    if (process.env.NODE_ENV === 'production') {
      ReactGA.set({ page: window.location.pathname });
      ReactGA.pageview(window.location.pathname);
    }
  };
  const muiTheme = createMuiTheme({
    palette: {
      primary: getBrandColors(),
      secondary: getBrandColors(),
    },
    dialog: {
      width: '80%',
    },
    status: {
      info: 'info',
      warning: 'warning',
      error: 'error',
    },
    overrides: { // Name of the component ⚛️ / style sheet
      MuiButton: {
        root: {
          padding: '0px 16px',
        },
        containedPrimary: {
          color: 'white',
        },
        outlined: {
          color: getBrandColors().dark,
        },
        label: {
          fontFamily: 'Lato, sans',
          fontWeight: 200,
        },
      },
      MuiInput: {
        input: {
          padding: '8px 0px',
        },
      },
      MuiModal: {
        // paperWidth: '80%',
      },
      MuiTypography: {
        title: {
          fontFamily: 'Lato, sans',
        },
      },
      zIndex: {
        modal: 900,
      },
    },
  });

  const themeV0 = getMuiTheme({
    fontFamily: 'Lato, sans',
    palette: {
      primary1Color: getBrandColors().dark,
      accent1Color: getBrandColors().light,
    },
  });

  const renderApp = () => {
    ReactDOM.render(
      <MuiThemeProvider theme={muiTheme}>
        <V0MuiThemeProvider muiTheme={themeV0}>
          <Provider store={store}>
            <IntlProvider locale={DEFAULT_LOCALE}>
              <Router history={history} onUpdate={logPageView}>
                {routes}
              </Router>
            </IntlProvider>
          </Provider>
        </V0MuiThemeProvider>
      </MuiThemeProvider>,
      document.getElementById(APP_DOM_ELEMENT_ID)
    );
  };

  // log them in if they have a valid cookie (wait till login attempt complete before rendering app)
  store.dispatch(loginWithCookie())
    .then(() => renderApp());
}


/**
 * Call this from your own appIndex.js with some routes to start up your app.  Do not
 * refer to this file as an entry point directly.
 */
export default function initializeApp(routes) {
  // set up logging when you're in production mode
  if (isProdMode()) {
    Raven.config('https://e19420a2c46a4f97942553dfe8322cc4@sentry.io/1229723', {
      release: getVersion(),
      environment: 'production',
      logger: getAppName(),
    }).install();
    // This wraps the app intialization in a Raven context to catch any init errors (as they recommend).
    Raven.context(() => {
      reallyInitializeApp(routes);
    });
  } else {
    reallyInitializeApp(routes);
  }
}
