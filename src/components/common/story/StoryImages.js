import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import { fetchStoryImages } from '../../../actions/storyActions';
import withAsyncData from '../hocs/AsyncDataContainer';
import DataCard from '../DataCard';
import { trimToMaxLength } from '../../../lib/stringUtil';

const localMessages = {
  title: { id: 'story.images.title', defaultMessage: 'Story Images' },
  top: { id: 'story.images.top', defaultMessage: 'Top Image' },
  other: { id: 'story.images.other', defaultMessage: 'Other Images' },
};

const StoryImages = ({ topImage, allImages }) => (
  <DataCard className="story-images-container">
    <h2><FormattedMessage {...localMessages.title} /></h2>
    <Row>
      <Col lg={6}>
        <h3><FormattedMessage {...localMessages.top} /></h3>
        {topImage && (
          <a href={topImage}><img alt="top" src={topImage} width="100%" /></a>
        )}
      </Col>
      <Col lg={6}>
        <h3><FormattedMessage {...localMessages.other} /></h3>
        <ul>
          {allImages && allImages.map((imageUrl, idx) => (
            <li key={idx}><a href={imageUrl}>{trimToMaxLength(imageUrl, 70)}</a></li>
          ))}
        </ul>
      </Col>
    </Row>
  </DataCard>
);

StoryImages.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  storyId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  allImages: PropTypes.array,
  topImage: PropTypes.string,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.images.fetchStatus,
  allImages: state.story.images.all,
  topImage: state.story.images.top,
});

const fetchAsyncData = (dispatch, { storyId }) => dispatch(fetchStoryImages(storyId));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['storyId'])(
      StoryImages
    )
  )
);
