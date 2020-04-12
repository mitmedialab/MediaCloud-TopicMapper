import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'intl';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Router from 'react-router/lib/Router';
import hashHistory from 'react-router/lib/hashHistory';
import { syncHistoryWithStore } from 'react-router-redux';
import Raven from 'raven-js';
import { loginWithCookie } from './actions/userActions';
import getStore from './store';
import { getAppName, getVersion, isProdMode } from './config';
import { getBrandColors } from './styles/colors';

const APP_DOM_ELEMENT_ID = 'app';
const DEFAULT_LOCALE = 'en';

function reallyInitializeApp(routes) {
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
    typography: {
      useNextVariants: true,
    },
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
          padding: '5px 16px',
        },
        containedPrimary: {
          color: 'white',
        },
        outlined: {
          color: getBrandColors().dark,
        },
        label: {
          fontFamily: 'Lato, sans',
          fontWeight: 300,
        },
      },
      MuiInput: {
        input: {
          padding: '8px 0px',
          fontFamily: 'Lato, Helvetica, sans',
        },
      },
      MuiModal: {
        // paperWidth: '80%',
      },
      MuiTypography: {
        h6: {
          fontFamily: 'Lato, Helvetica, sans',
        },
      },
      MuiInputLabel: {
        root: {
          fontFamily: 'Lato, Helvetica, sans',
        },
      },
      zIndex: {
        modal: 900,
      },
    },
  });

  const renderApp = () => {
    ReactDOM.render(
      <ThemeProvider theme={muiTheme}>
        <Provider store={store}>
          <IntlProvider locale={DEFAULT_LOCALE}>
            <Router history={history} onUpdate={logPageView}>
              {routes}
            </Router>
          </IntlProvider>
        </Provider>
      </ThemeProvider>,
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
