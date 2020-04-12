import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { fetchTopicStoryCounts } from '../../../actions/topicActions';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import InfluentialStoryExplorer from './InfluentialStoryExplorer';
import TopicPageTitle from '../TopicPageTitle';

const localMessages = {
  title: { id: 'topic.influentialStoryExplorer.title', defaultMessage: 'Story Explorer' },
  intro: { id: 'topic.influentialStoryExplorer.intro', defaultMessage: 'This is an <b>experimental</b> interface that lets you dyanimcally explore stories in a multi-dimensional way.  Think of it as a pivot-table explorer within this timespan.  First it has to download a list of all the stories in this timespan, so don\'t be surprised if it spins for 5 or so minutes while downloading.  Then you\'ll see a number of charts you can explore.  Drag and click on the charts to filter for just the stories you want to see.' },
  error: { id: 'topic.influentialStoryExplorer.error', defaultMessage: 'Sorry - there are too many stories in this timespan to support this UI.  Try looking at just one week or just one month of this topic instead.' },
};

const MAX_STORIES = 100000;

const InfluentialStoryExplorerContainer = (props) => {
  const { totalStories, topicId, filters, selectedTimespan } = props;
  let content = null;
  if (totalStories > MAX_STORIES) {
    content = (
      <p>
        <FormattedMessage {...localMessages.error} />
      </p>
    );
  } else {
    content = (
      <InfluentialStoryExplorer
        topicId={topicId}
        filters={filters}
        selectedTimespan={selectedTimespan}
      />
    );
  }
  return (
    <div className="story-explorer">
      <TopicPageTitle value={localMessages.title} />
      <Grid>
        <Row>
          <Col lg={12} md={12} sm={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
            <p><FormattedHTMLMessage {...localMessages.intro} /></p>
            {content}
          </Col>
        </Row>
      </Grid>
    </div>
  );
};

InfluentialStoryExplorerContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  // from parent
  // from state
  topicId: PropTypes.number.isRequired,
  selectedTimespan: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
  totalStories: PropTypes.number,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  selectedTimespan: state.topics.selected.timespans.selected,
  fetchStatus: state.topics.selected.summary.storyTotals.fetchStatus,
  totalStories: state.topics.selected.summary.storyTotals.counts.total, // total
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicStoryCounts(props.topicId, props.filters));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      InfluentialStoryExplorerContainer
    )
  )
);
