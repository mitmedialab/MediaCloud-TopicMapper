import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import Homepage from '../components/explorer/home/Homepage';
import About from '../components/explorer/About';
import LoggedInQueryContainer from '../components/explorer/builder/LoggedInQueryContainer';
import ExplorerApp from '../components/explorer/ExplorerApp';
import { requireAuth } from './routes';
import systemRoutes from './systemRoutes';

const explorerRoutes = (
  <Route path="/" component={ExplorerApp}>

    <IndexRedirect to="/home" />

    <Route path="/about" component={About} />
    <Route path="/home" component={Homepage} />

    <Route path="/queries">
      <Route path="search" component={LoggedInQueryContainer} onEnter={requireAuth} />
    </Route>

    {systemRoutes}

  </Route>
);

export default explorerRoutes;
