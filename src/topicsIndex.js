import ReactGA from 'react-ga';
import { setAppName, setVersion, APP_TOPIC_MAPPER } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/topicRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Topic Mapper app.
 */

ReactGA.initialize('UA-60744513-7');

setVersion('3.3.0');

setAppName(APP_TOPIC_MAPPER);

setAppColors({
  light: '#58DBCC',
  dark: '#38BBAC',  // primary
  darker: '#189B8C',
  main: '#38BBAC',
});

initializeApp(routes);
