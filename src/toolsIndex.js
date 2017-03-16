// import ReactGA from 'react-ga';
import { setAppName, setVersion } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/toolsRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Topic Mapper app.
 */

// ReactGA.initialize('UA-60744513-7');

setVersion('1.0.0');

setAppName('tools');

setAppColors({
  light: 'rgb(189,189,189)',
  dark: 'rgb(97,97,97)',
  darker: 'rgb(33,33,33)',
});

initializeApp(routes);
