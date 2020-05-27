import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import LoadingSpinner from '../../common/LoadingSpinner';
import { urlWithFilters } from '../../util/location';
import CountOverTimeSummaryContainer from './CountOverTimeSummaryContainer';
import TopicStoryStats from './TopicStoryStats';
import StoryTotalsSummaryContainer from './StoryTotalsSummaryContainer';
import DownloadMapFilesContainer from './export/DownloadMapFilesContainer';
import DownloadTimespanFilesConatainer from './export/DownloadTimespanFilesContainer';
import NytLabelSummaryContainer from './NytLabelSummaryContainer';
import GeoTagSummaryContainer from './GeoTagSummaryContainer';
import { SummarizedVizualization } from '../../common/hocs/SummarizedVizualization';
import TopicStoryMetadataStatsContainer from './TopicStoryMetadataStatsContainer';
import FociStoryCountComparisonContainer from './FociStoryCountComparisonContainer';
import TopicWordSpaceContainer from './TopicWordSpaceContainer';
import TabSelector from '../../common/TabSelector';
import messages from '../../../resources/messages';
import SeedQuerySummary from '../versions/SeedQuerySummary';
import TopicWordCloudContainer from '../provider/TopicWordCloudContainer';
import TopicStoriesContainer from '../provider/TopicStoriesContainer';
import TopicTagUseContainer from '../provider/TopicTagUseContainer';
import TopicMediaContainer from '../provider/TopicMediaContainer';
import { CLIFF_VERSION_TAG_LIST, TAG_SET_CLIFF_PEOPLE, TAG_SET_CLIFF_ORGS } from '../../../lib/tagUtil';

const localMessages = {
  title: { id: 'topic.summary.summary.title', defaultMessage: 'Topic: {name}' },
  previewTitle: { id: 'topic.summary.public.title', defaultMessage: 'Topic Preview: {name}' },
  previewIntro: { id: 'topic.summary.public.intro', defaultMessage: 'This is a preview of our {name} topic.  It shows just a sample of the data available once you login to the Topic Mapper tool. To explore, click on a link and sign in.' },
  statsTabTitle: { id: 'topic.summary.summary.about', defaultMessage: 'Stats' },
  exportTabTitle: { id: 'topic.summary.summary.export', defaultMessage: 'Export' },
  wordsDescriptionIntro: { id: 'topic.summary.words.help.intro', defaultMessage: '<p>Look at the top words to see how this topic was talked about. This can suggest what the dominant narrative was, and looking at different timespans can suggest how it evolved over time.</p>' },
  topStories: { id: 'topic.summary.stories.title', defaultMessage: 'Top Stories' },
  storiesDescriptionIntro: { id: 'topic.summary.stories.help.title', defaultMessage: '<p>The top stories within this topic can suggest the main ways it is talked about.  Sort by different measures to get a better picture of a story\'s influence.</p>' },
  countOverTimeDescriptionIntro: { id: 'topic.summary.splitStoryCount.help.title', defaultMessage: '<p>Analyze attention to this topic over time to understand how it is covered. This chart shows the total number of stories that matched your topic query. Spikes in attention can reveal key events.  Plateaus can reveal stable, "normal", attention levels. <b>Click a point to label it with the top inlinked story in that week.</b></p>' },
  topPeople: { id: 'topic.summary.people.title', defaultMessage: 'Top People' },
  topOrgs: { id: 'topic.summary.orgs.title', defaultMessage: 'Top Organizations' },
  topMedia: { id: 'topic.summary.topMedia.title', defaultMessage: 'Top Media' },
  mediaDescriptionIntro: { id: 'topic.summary.stories.help.title', defaultMessage: '<p>The top media sources within this topic can show which sources had control of the main narratives. Sort by different measures to get a better picture of a media source\'s influence.</p>' },
  mediaDescription: { id: 'topic.summary.topMedia.help.text',
    defaultMessage: '<p>This table shows you the media that wrote about this Topic the most.</p><p>This table has one row for each Media Source.  The column currently being used to sort the results has a little down arrow next to it.  Click one of the green column headers to change how it is sorted.  Here is a summary of the columns:</p><ul><li>Name: the name of the Media Source; click to see details about this source\'s content within this Topic</li><li>Media Inlinks: how many unique other Media Sources have links to this content from this Media Source in the Topic</li><li>Outlinks: the number of links in this Media Source to other stories</li><li>Facebook Shares: the number of times stories from this Media Source were shared on Facebook</li></ul><p>Click the download button in the top right to download a CSV of the full list of stories</p>',
  },
};

class TopicSummaryContainer extends React.Component {
  state = {
    selectedTab: 0,
  };

  filtersAreSet() {
    const { filters, topic } = this.props;
    return (topic.topics_id && filters.snapshotId && filters.timespanId);
  }

  render() {
    const { filters, topic, selectedTimespan, user, location, selectedSnapshot, timespans } = this.props;
    const { formatMessage } = this.props.intl;
    let content = <div />;
    let intro = null;
    if (!user.isLoggedIn) {
      intro = (<p><FormattedMessage {...localMessages.previewIntro} values={{ name: topic.name }} /></p>);
    }
    // only show filtered story counts if you have a filter in place
    let filteredStoryCountContent = null;
    if ((selectedTimespan && (selectedTimespan.period !== 'overall')) || (filters.focusId) || (filters.q)) {
      filteredStoryCountContent = (
        <Row>
          <Col lg={12}>
            <StoryTotalsSummaryContainer topicId={topic.topics_id} topicName={topic.name} filters={filters} />
          </Col>
        </Row>
      );
    }
    if (!user.isLoggedIn || this.filtersAreSet()) { // TODO: but what if only one filter (snapshot) is set?
      let viewContent;
      switch (this.state.selectedTab) {
        case 0:
          // influence
          viewContent = (
            <>
              <Row>
                <Col lg={12}>
                  <SummarizedVizualization
                    titleMessage={localMessages.topStories}
                    introMessage={localMessages.storiesDescriptionIntro}
                    handleExplore={urlWithFilters(`/topics/${topic.topics_id}/stories`, filters)}
                    wide
                  >
                    <TopicStoriesContainer uid="topic" border={false} />
                  </SummarizedVizualization>
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <SummarizedVizualization
                    titleMessage={localMessages.topMedia}
                    introMessage={localMessages.mediaDescriptionIntro}
                    detailedMessage={localMessages.mediaDescription}
                    handleExplore={urlWithFilters(`/topics/${topic.topics_id}/media`, filters)}
                    wide
                  >
                    <TopicMediaContainer uid="topic" border={false} />
                  </SummarizedVizualization>
                </Col>
              </Row>
            </>
          );
          break;
        case 1:
          // attention
          viewContent = (
            <>
              <CountOverTimeSummaryContainer topic={topic} filters={filters} timespans={timespans} />
              <Row>
                {filteredStoryCountContent}
              </Row>
            </>
          );
          break;
        case 2:
          // language
          viewContent = (
            <>
              <Row>
                <Col lg={12}>
                  <SummarizedVizualization
                    titleMessage={messages.topWords}
                    introMessage={localMessages.wordsDescriptionIntro}
                    detailedMessage={[messages.wordcloudHelpText, messages.wordCloudTopicWord2VecLayoutHelp]}
                    handleExplore={urlWithFilters(`/topics/${topic.topics_id}/words`, filters)}
                  >
                    <TopicWordCloudContainer svgName="all-words" border={false} uid="topic" />
                  </SummarizedVizualization>
                </Col>
                <Col lg={12}>
                  <TopicWordSpaceContainer topicId={topic.topics_id} topicName={topic.name} filters={filters} uid="topic" />
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <NytLabelSummaryContainer topicId={topic.topics_id} filters={filters} topicName={topic.name} location={location} />
                </Col>
              </Row>
            </>
          );
          break;
        case 3:
          // entities
          viewContent = (
            <>
              <Row>
                <Col lg={12}>
                  <SummarizedVizualization
                    titleMessage={localMessages.topPeople}
                    introMessage={messages.entityHelpContent}
                  >
                    <TopicTagUseContainer
                      topicId={topic.topics_id}
                      filters={filters}
                      uid="people"
                      tagSetsId={TAG_SET_CLIFF_PEOPLE}
                      tagsId={CLIFF_VERSION_TAG_LIST}
                      border={false}
                    />
                  </SummarizedVizualization>
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <SummarizedVizualization
                    titleMessage={localMessages.topOrgs}
                    introMessage={messages.entityHelpContent}
                  >
                    <TopicTagUseContainer
                      topicId={topic.topics_id}
                      filters={filters}
                      uid="orgs"
                      tagSetsId={TAG_SET_CLIFF_ORGS}
                      tagsId={CLIFF_VERSION_TAG_LIST}
                      border={false}
                    />
                  </SummarizedVizualization>
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <GeoTagSummaryContainer topicId={topic.topics_id} filters={filters} />
                </Col>
              </Row>
            </>
          );
          break;
        case 4:
          // stats
          viewContent = (
            <>
              <Row>
                <Col lg={12}>
                  <TopicStoryMetadataStatsContainer topicId={topic.topics_id} filters={filters} timespan={selectedTimespan} />
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <FociStoryCountComparisonContainer topicId={topic.topics_id} filters={filters} />
                </Col>
              </Row>
              <Row>
                <Col lg={6}>
                  <SeedQuerySummary topic={topic} snapshot={selectedSnapshot} />
                </Col>
              </Row>
            </>
          );
          break;
        case 5:
          // export
          // stats
          viewContent = (
            <>
              <Row>
                <Col lg={12}>
                  <DownloadMapFilesContainer topicId={topic.topics_id} filters={filters} />
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <DownloadTimespanFilesConatainer topicId={topic.topics_id} filters={filters} />
                </Col>
              </Row>
            </>
          );
          break;
        default:
          break;
      }
      content = (
        <>
          <Grid>
            <Row>
              <Col lg={12}>
                {intro}
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <TopicStoryStats topicId={topic.topics_id} filters={filters} timespan={selectedTimespan} />
              </Col>
            </Row>
            <Row>
              <TabSelector
                tabLabels={[
                  formatMessage(messages.influence),
                  formatMessage(messages.attention),
                  formatMessage(messages.language),
                  formatMessage(messages.representation),
                  formatMessage(localMessages.statsTabTitle),
                  formatMessage(localMessages.exportTabTitle),
                ]}
                onViewSelected={index => this.setState({ selectedTab: index })}
              />
            </Row>
          </Grid>
          <div className="tabbed-content-wrapper">
            <Grid>
              {viewContent}
            </Grid>
          </div>
        </>
      );
    } else {
      content = <LoadingSpinner />;
    }
    return (
      <div className="topic-summary">
        {content}
      </div>
    );
  }
}

TopicSummaryContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  params: PropTypes.object,
  location: PropTypes.object,
  // from state
  filters: PropTypes.object.isRequired,
  topic: PropTypes.object.isRequired,
  selectedTimespan: PropTypes.object,
  timespans: PropTypes.array.isRequired,
  selectedSnapshot: PropTypes.object,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topic: state.topics.selected.info,
  selectedTimespan: state.topics.selected.timespans.selected,
  selectedSnapshot: state.topics.selected.snapshots.selected,
  timespans: state.topics.selected.timespans.list,
  user: state.user,
});

export default
injectIntl(
  connect(mapStateToProps)(
    TopicSummaryContainer
  )
);
