import React from 'react';
import Route from 'react-router/lib/Route';
import Redirect from 'react-router/lib/Redirect';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import TopicsHomepage from '../components/topic/homepage/TopicsHomepage';
import TopicContainer from '../components/topic/TopicContainer';
import TopicVersionReadyStatusContainer from '../components/topic/versions/homepages/TopicVersionReadyStatusContainer';
import TopicVersionListContainer from '../components/topic/versions/TopicVersionListContainer';
import TopicNewVersionContainer from '../components/topic/versions/TopicNewVersionContainer';
import TopicSummaryContainer from '../components/topic/summary/TopicSummaryContainer';
import TopicVersionContainer from '../components/topic/versions/TopicVersionContainer';
import BrowseMediaContainer from '../components/topic/media/BrowseMediaContainer';
import BrowseStoriesContainer from '../components/topic/stories/BrowseStoriesContainer';
import StoryContainer from '../components/topic/stories/StoryContainer';
import StoryUpdateContainer from '../components/topic/stories/StoryUpdateContainer';
import StoryCachedContainer from '../components/common/admin/story/StoryCachedContainer';
import MediaContainer from '../components/topic/media/MediaContainer';
import CreateFocusContainer from '../components/topic/snapshots/foci/CreateFocusContainer';
import EditFocusContainer from '../components/topic/snapshots/foci/EditFocusContainer';
import ManageFocalSetsContainer from '../components/topic/snapshots/foci/ManageFocalSetsContainer';
import ManagePlatformsContainer from '../components/topic/platforms/ManagePlatformsContainer';
import EditPlatformContainer from '../components/topic/platforms/EditPlatformContainer';
import CreatePlatformContainer from '../components/topic/platforms/CreatePlatformContainer';
import PlatformBuilder from '../components/topic/platforms/PlatformBuilder';
import PlatformStatusContainer from '../components/topic/platforms/PlatformStatusContainer';
import { requireAuth } from './routes';
import systemRoutes from './systemRoutes';
import TopicsApp from '../components/topic/TopicsApp';
import About from '../components/topic/About';
import CreateTopicContainer from '../components/topic/wizard/CreateTopicContainer';
import EditTopicDataOptionsContainer from '../components/topic/wizard/EditTopicDataOptionsContainer';
import EditTopicSettingsContainer from '../components/topic/wizard/EditTopicSettingsContainer';
import AttentionContainer from '../components/topic/attention/AttentionContainer';
import WordContainer from '../components/topic/words/WordContainer';
import TopicPermissionsContainer from '../components/topic/permissions/TopicPermissionsContainer';
import SnapshotBuilder from '../components/topic/snapshots/SnapshotBuilder';
import InfluentialWordsContainer from '../components/topic/words/InfluentialWordsContainer';
import AdminAllTopicsContainer from '../components/topic/list/AdminAllTopicsContainer';
import TopicSearchContainer from '../components/topic/search/TopicSearchContainer';

const topicRoutes = (
  <Route path="/" component={TopicsApp}>

    <IndexRedirect to="/home" />

    <Route path="/about" component={About} />

    <Redirect from="/topics/public/home" to="/home" />
    <Route path="/home" component={TopicsHomepage} />

    <Route path="/topics/create" component={CreateTopicContainer} onEnter={requireAuth}>
      <Route path="/topics/create/:step" component={CreateTopicContainer} onEnter={requireAuth} />
    </Route>

    <Route path="/topics/search" component={TopicSearchContainer} onEnter={requireAuth} />

    <Route path="/topics/status" component={AdminAllTopicsContainer} onEnter={requireAuth} />

    <Route path="/topics/:topicId" component={TopicContainer} onEnter={requireAuth}>
      <Route path="data-options" component={EditTopicDataOptionsContainer} onEnter={requireAuth} />
      <Route path="versions" component={TopicVersionListContainer} onEnter={requireAuth} />
      <Route path="permissions" component={TopicPermissionsContainer} onEnter={requireAuth} />
      <Route path="settings" component={EditTopicSettingsContainer} onEnter={requireAuth} />
      <Route path="new-version" component={TopicNewVersionContainer} onEnter={requireAuth} />
      <Route path="/topics/:topicId/versions" component={TopicVersionContainer} onEnter={requireAuth}>
        <Route component={TopicVersionReadyStatusContainer} onEnter={requireAuth}>
          <Route path="/topics/:topicId/summary" component={TopicSummaryContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/media" component={BrowseMediaContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/media/:mediaId" component={MediaContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/stories" component={BrowseStoriesContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/stories/:storiesId/update" component={StoryUpdateContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/stories/:id/cached" component={StoryCachedContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/stories/:storiesId" component={StoryContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/attention" component={AttentionContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/words" component={InfluentialWordsContainer} onEnter={requireAuth} />
          <Route path="/topics/:topicId/words/:word" component={WordContainer} onEnter={requireAuth} />
        </Route>
      </Route>

      <Route path="/topics/:topicId/snapshot" component={PlatformStatusContainer}>
        <Route path="/topics/:topicId/snapshot" component={SnapshotBuilder}>
          <Route path="foci" component={ManageFocalSetsContainer} />
          <Route path="foci/create" component={CreateFocusContainer} />
          <Route path="foci/:focusDefId/edit" component={EditFocusContainer} />
        </Route>
      </Route>

      <Route path="/topics/:topicId/platforms" component={PlatformBuilder} onEnter={requireAuth}>
        <Route path="manage" component={ManagePlatformsContainer} onEnter={requireAuth} />
        <Route path="create" component={CreatePlatformContainer} onEnter={requireAuth} />
        <Route path=":platformId/edit" component={EditPlatformContainer} onEnter={requireAuth} />
      </Route>

    </Route>

    {systemRoutes}
  </Route>

);

export default topicRoutes;
