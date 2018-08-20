import React from 'react';
import Route from 'react-router/lib/Route';
import Redirect from 'react-router/lib/Redirect';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import TopicsHomepage from '../components/topic/homepage/TopicsHomepage';
import TopicContainer from '../components/topic/TopicContainer';
import FilteredTopicContainer from '../components/topic/FilteredTopicContainer';
import TopicSummaryContainer from '../components/topic/summary/TopicSummaryContainer';
import PublicTopicSummaryContainer from '../components/topic/summary/PublicTopicSummaryContainer';
import InfluentialMediaContainer from '../components/topic/media/InfluentialMediaContainer';
import InfluentialStoriesContainer from '../components/topic/stories/InfluentialStoriesContainer';
import InfluentialStoryExplorerContainer from '../components/topic/stories/InfluentialStoryExplorerContainer';
import StoryContainer from '../components/topic/stories/StoryContainer';
import StoryUpdateContainer from '../components/topic/stories/StoryUpdateContainer';
import StoryCachedContainer from '../components/topic/stories/StoryCachedContainer';
import MediaContainer from '../components/topic/media/MediaContainer';
import LinkMapContainer from '../components/topic/maps/LinkMapContainer';
import CreateFocusContainer from '../components/topic/snapshots/foci/CreateFocusContainer';
import EditFocusContainer from '../components/topic/snapshots/foci/EditFocusContainer';
import ManageFocalSetsContainer from '../components/topic/snapshots/foci/ManageFocalSetsContainer';
import { requireAuth } from './routes';
import userRoutes from './userRoutes';
import systemRoutes from './systemRoutes';
import TopicsApp from '../components/topic/TopicsApp';
import About from '../components/topic/About';
import CreateTopicContainer from '../components/topic/create/CreateTopicContainer';
import EditTopicContainer from '../components/topic/create/EditTopicContainer';
import AttentionContainer from '../components/topic/attention/AttentionContainer';
import WordContainer from '../components/topic/words/WordContainer';
import TopicPermissionsContainer from '../components/topic/permissions/TopicPermissionsContainer';
import SnapshotBuilder from '../components/topic/snapshots/SnapshotBuilder';
import SnapshotGenerate from '../components/topic/snapshots/SnapshotGenerate';
import ManageTimespansContainer from '../components/topic/snapshots/timespans/ManageTimespansContainer';
import InfluentialWordsContainer from '../components/topic/words/InfluentialWordsContainer';
import TopicStatusDashboardContainer from '../components/topic/list/TopicStatusDashboardContainer';

const topicRoutes = (
  <Route path="/" component={TopicsApp}>

    <IndexRedirect to="/home" />

    <Route path="/about" component={About} />

    <Redirect from="/topics/public/home" to="/home" />
    <Route path="/home" component={TopicsHomepage} />

    <Route path="/topics/create" component={CreateTopicContainer} onEnter={requireAuth}>
      <Route path="/topics/create/:step" component={CreateTopicContainer} onEnter={requireAuth} />
    </Route>

    <Route path="/topics/status" component={TopicStatusDashboardContainer} onEnter={requireAuth} />

    <Route path="/topics/:topicId" component={TopicContainer} onEnter={requireAuth} >

      <Route path="edit" component={EditTopicContainer} onEnter={requireAuth} />

      <Route path="permissions" component={TopicPermissionsContainer} onEnter={requireAuth} />

      <Route path="/topics/:topicId/filtered" component={FilteredTopicContainer} onEnter={requireAuth} >
        <Route path="/topics/:topicId/summary" component={TopicSummaryContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/media" component={InfluentialMediaContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/media/:mediaId" component={MediaContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/stories" component={InfluentialStoriesContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/stories/explore" component={InfluentialStoryExplorerContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/stories/:storiesId/update" component={StoryUpdateContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/stories/:storiesId/cached" component={StoryCachedContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/stories/:storiesId" component={StoryContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/attention" component={AttentionContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/words" component={InfluentialWordsContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/words/:word" component={WordContainer} onEnter={requireAuth} />
        <Route path="/topics/:topicId/link-map" component={LinkMapContainer} onEnter={requireAuth} />
      </Route>

      <Route path="/topics/:topicId/snapshot" component={SnapshotBuilder} >
        <Route path="generate" component={SnapshotGenerate} />
        <Route path="foci" component={ManageFocalSetsContainer} />
        <Route path="foci/create" component={CreateFocusContainer} />
        <Route path="foci/:focusDefId/edit" component={EditFocusContainer} />
        <Route path="timespans" component={ManageTimespansContainer} />
      </Route>

    </Route>

    <Route path="/topics/public/:topicId" component={TopicContainer}>
      <Route path="/topics/public/:topicId/summary" component={PublicTopicSummaryContainer} />
    </Route>

    {userRoutes}
    {systemRoutes}

  </Route>

);

export default topicRoutes;
