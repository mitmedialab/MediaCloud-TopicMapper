import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import TopicPageTitle from '../TopicPageTitle';
import { fetchTopicMapFiles } from '../../../actions/topicActions';
import GexfLinkMap from './GexfLinkMap';

const localMessages = {
  title: { id: 'topic.maps.link.title', defaultMessage: 'Link Map' },
};

const LinkMapContainer = ({ topicId, timespanId, mediaMapFiles, params }) => {
  const mediaMapFile = mediaMapFiles.find(mmf => mmf.timespan_maps_id === parseInt(params.mediaMapId, 10));
  return (
    <Grid>
      <Row>
        <Col lg={12}>
          <TopicPageTitle value={localMessages.title} />
          <h1><FormattedMessage {...localMessages.title} /></h1>
          {(mediaMapFile.format === 'gexf') && <GexfLinkMap topicId={topicId} timespanId={timespanId} mediaMapFile={mediaMapFile} />}
        </Col>
      </Row>
    </Grid>
  );
};

LinkMapContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  // from state
  topicId: PropTypes.number.isRequired,
  mediaMapFiles: PropTypes.array,
  apiKey: PropTypes.string.isRequired,
  timespanId: PropTypes.number.isRequired,
  // from dispatch
  // from parent
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.summary.mapFiles.fetchStatus,
  mediaMapFiles: state.topics.selected.summary.mapFiles.timespan_maps,
  apiKey: state.user.key,
  timespanId: state.topics.selected.filters.timespanId,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchTopicMapFiles(props.topicId, props.filters));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      LinkMapContainer
    )
  )
);
