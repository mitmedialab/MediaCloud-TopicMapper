import ReactGA from 'react-ga';
import doNotTrack from 'donottrack';
import { setAppName, APP_TOPIC_MAPPER } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/topicRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Topic Mapper app.
 */

if (!doNotTrack(false)) ReactGA.initialize('UA-60744513-7');

setAppName(APP_TOPIC_MAPPER);

setAppColors({
  light: '#58DBCC',
  dark: '#38BBAC', // primary
  darker: '#189B8C',
  main: '#38BBAC',
});

initializeApp(routes);
