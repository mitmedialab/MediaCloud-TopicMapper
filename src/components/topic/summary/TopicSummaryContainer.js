import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import LoadingSpinner from '../../common/LoadingSpinner';
import TopicInfo from './TopicInfo';
import TopPeopleContainer from './TopPeopleContainer';
import TopOrgsContainer from './TopOrgsContainer';
import StoriesSummaryContainer from './StoriesSummaryContainer';
import MediaSummaryContainer from './MediaSummaryContainer';
import WordsSummaryContainer from './WordsSummaryContainer';
import SplitStoryCountSummaryContainer from './SplitStoryCountSummaryContainer';
import TopicStoryStatsContainer from './TopicStoryStatsContainer';
import StoryTotalsSummaryContainer from './StoryTotalsSummaryContainer';
import DownloadMapContainer from './DownloadMapContainer';
import NytLabelSummaryContainer from './NytLabelSummaryContainer';
import GeoTagSummaryContainer from './GeoTagSummaryContainer';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import TopicStoryMetadataStatsContainer from './TopicStoryMetadataStatsContainer';
import TopicWordSpaceContainer from './TopicWordSpaceContainer';

const localMessages = {
  title: { id: 'topic.summary.public.title', defaultMessage: 'Topic: {name}' },
  previewTitle: { id: 'topic.summary.public.title', defaultMessage: 'Topic Preview: {name}' },
  previewIntro: { id: 'topic.summary.public.intro', defaultMessage: 'This is a preview of our {name} topic.  It shows just a sample of the data available once you login to the Topic Mapper tool. To explore, click on a link and sign in.' },
};

class TopicSummaryContainer extends React.Component {
  filtersAreSet() {
    const { filters, topicId } = this.props;
    return (topicId && filters.snapshotId && filters.timespanId);
  }
  render() {
    const { filters, topicId, topicInfo, selectedTimespan, user, seletecFocus, location } = this.props;
    let content = <div />;
    let intro = null;
    if (!user.isLoggedIn) {
      intro = (<p><FormattedMessage {...localMessages.previewIntro} values={{ name: topicInfo.name }} /></p>);
    }
    // only show filtered story counts if you have a filter in place
    let filteredStoryCountContent = null;
    if ((selectedTimespan && (selectedTimespan.period !== 'overall')) || (filters.focusId) || (filters.q)) {
      filteredStoryCountContent = (
        <Row>
          <Col lg={12}>
            <StoryTotalsSummaryContainer topicId={topicId} filters={filters} />
          </Col>
        </Row>
      );
    }
    if (!user.isLoggedIn || this.filtersAreSet()) {
      content = (
        <Grid>
          <Row>
            <Col lg={12}>
              {intro}
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <TopicStoryStatsContainer topicId={topicId} filters={filters} timespan={selectedTimespan} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <SplitStoryCountSummaryContainer topicId={topicId} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoriesSummaryContainer topicId={topicId} filters={filters} location={location} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <MediaSummaryContainer topicId={topicId} filters={filters} location={location} />
            </Col>
          </Row>
          <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
            <Row>
              <Col lg={12}>
                <NytLabelSummaryContainer topicId={topicId} filters={filters} location={location} />
              </Col>
            </Row>
          </Permissioned>
          <Row>
            <Col lg={12}>
              <WordsSummaryContainer topicId={topicId} topicName={topicInfo.name} filters={filters} width={720} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <TopicWordSpaceContainer topicId={topicId} />
            </Col>
          </Row>
          <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
            <Row>
              <Col lg={6}>
                <TopPeopleContainer topicId={topicId} filters={filters} location={location} />
              </Col>
              <Col lg={6}>
                <TopOrgsContainer topicId={topicId} filters={filters} location={location} />
              </Col>
            </Row>
          </Permissioned>
          <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
            <Row>
              <Col lg={12}>
                <GeoTagSummaryContainer topicId={topicId} filters={filters} />
              </Col>
            </Row>
            {filteredStoryCountContent}
            <Row>
              <Col lg={12}>
                <DownloadMapContainer topicId={topicId} filters={filters} />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <TopicInfo topic={topicInfo} timespan={selectedTimespan} focus={seletecFocus} />
              </Col>
              <Col lg={6}>
                <TopicStoryMetadataStatsContainer topicId={topicId} filters={filters} timespan={selectedTimespan} />
              </Col>
            </Row>
          </Permissioned>
        </Grid>
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
  selectedTimespan: PropTypes.object,
  seletecFocus: PropTypes.object,
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number,
  topicInfo: PropTypes.object,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
  topicInfo: state.topics.selected.info,
  selectedTimespan: state.topics.selected.timespans.selected,
  seletecFocus: state.topics.selected.focalSets.foci.selected,
  user: state.user,
});

export default
  injectIntl(
    connect(mapStateToProps)(
      TopicSummaryContainer
    )
  );
