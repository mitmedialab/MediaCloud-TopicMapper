import ReactGA from 'react-ga';
import doNotTrack from 'donottrack';
import { setAppName, APP_TOOLS } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/toolsRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Tools app.
 */

if (!doNotTrack(false)) ReactGA.initialize('UA-60744513-9');

setAppName(APP_TOOLS);

setAppColors({
  light: '#BDBDBD',
  dark: '#616161',
  darker: '#1F1F1F',
  main: '#616161',
});

initializeApp(routes);
