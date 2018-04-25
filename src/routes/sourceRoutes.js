import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import IndexRoute from 'react-router/lib/IndexRoute';
import Redirect from 'react-router/lib/Redirect';
import SourceDetailsContainer from '../components/source/mediaSource/SourceDetailsContainer';
import CollectionDetailsContainer from '../components/source/collection/CollectionDetailsContainer';
import CollectionContentHistory from '../components/source/collection/CollectionContentHistory';
import CreateCollectionContainer from '../components/source/collection/CreateCollectionContainer';
import AdvancedSearchContainer from '../components/source/search/AdvancedSearchContainer';
import SelectCollectionContainer from '../components/source/collection/SelectCollectionContainer';
import EditCollectionContainer from '../components/source/collection/EditCollectionContainer';
import ManageSourcesContainer from '../components/source/collection/ManageSourcesContainer';
import CreateSourceContainer from '../components/source/mediaSource/CreateSourceContainer';
import SuggestSourceContainer from '../components/source/mediaSource/suggest/SuggestSourceContainer';
import AllSuggestionsContainer from '../components/source/mediaSource/suggest/AllSuggestionsContainer';
import PendingSuggestionsContainer from '../components/source/mediaSource/suggest/PendingSuggestionsContainer';
import EditSourceContainer from '../components/source/mediaSource/EditSourceContainer';
import SourceFeedContainer from '../components/source/mediaSource/SourceFeedContainer';
import CreateSourceFeedContainer from '../components/source/mediaSource/CreateSourceFeedContainer';
import EditSourceFeedContainer from '../components/source/mediaSource/EditSourceFeedContainer';
import SelectSourceContainer from '../components/source/mediaSource/SelectSourceContainer';
import SourcesHomepage from '../components/source/homepage/SourcesHomepage';
import MCCollectionListContainer from '../components/source/collection/list/MCCollectionListContainer';
import CountryCollectionListContainer from '../components/source/collection/list/CountryCollectionListContainer';
import PageWrapper from '../components/source/PageWrapper';
import FavoritedContainer from '../components/source/FavoritedContainer';
import { requireAuth } from './routes';
import userRoutes from './userRoutes';
import systemRoutes from './systemRoutes';
import SourcesApp from '../components/source/SourcesApp';
import About from '../components/source/About';

const sourceRoutes = (
  <Route path="/" component={SourcesApp}>

    <IndexRedirect to="/home" />

    <Route path="/home" component={SourcesHomepage} />

    <Route component={PageWrapper}>
      <Route path="/about" component={About} />
      <Route path="/search" component={AdvancedSearchContainer} onEnter={requireAuth} />
      <Route path="/favorites" component={FavoritedContainer} onEnter={requireAuth} />
    </Route>

    <Route path="/sources" >
      <Route path="create" component={CreateSourceContainer} onEnter={requireAuth} />
      <Route path="suggest" component={SuggestSourceContainer} onEnter={requireAuth} />
      <Route path="suggestions" component={PendingSuggestionsContainer} onEnter={requireAuth} />
      <Route path="suggestions/history" component={AllSuggestionsContainer} onEnter={requireAuth} />
      <Route path="feeds/create" component={EditSourceFeedContainer} onEnter={requireAuth} />

      <Redirect from="details" to=":sourceId/:sourceName" />
      <Route path="/sources/:sourceId/:sourceName" component={SelectSourceContainer} >
        <IndexRoute component={SourceDetailsContainer} onEnter={requireAuth} />
        <Route path="edit" component={EditSourceContainer} onEnter={requireAuth} />
        <Route path="feeds" component={SourceFeedContainer} onEnter={requireAuth} />
        <Route path="feeds/create" component={CreateSourceFeedContainer} onEnter={requireAuth} />
        <Route path="feeds/:feedId/edit" component={EditSourceFeedContainer} onEnter={requireAuth} />
      </Route>
    </Route>

    <Route path="/collections" >
      <Route component={PageWrapper}>
        <Route path="media-cloud" component={MCCollectionListContainer} onEnter={requireAuth} />
        <Route path="country-and-state" component={CountryCollectionListContainer} onEnter={requireAuth} />
      </Route>
      <Route path="create" component={CreateCollectionContainer} onEnter={requireAuth} />
      <Redirect from="details" to=":collectionId/:collectionName" />
      <Route path=":collectionId/:collectionName" component={SelectCollectionContainer} >
        <IndexRoute component={CollectionDetailsContainer} onEnter={requireAuth} />
        <Route path="edit" component={EditCollectionContainer} onEnter={requireAuth} />
        <Route path="content-history" component={CollectionContentHistory} onEnter={requireAuth} />
        <Route path="manage-source-list" component={ManageSourcesContainer} onEnter={requireAuth} />
      </Route>
    </Route>

    {userRoutes}
    {systemRoutes}

  </Route>
);

export default sourceRoutes;
