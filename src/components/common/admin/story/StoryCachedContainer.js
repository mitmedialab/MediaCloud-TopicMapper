import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { selectStory, fetchStory } from '../../../../actions/storyActions';
import withAsyncData from '../../hocs/AsyncDataContainer';
import { ReadItNowButton } from '../../IconButton';
import HighlightedText from '../HighlightedText';

const localMessages = {
  title: { id: 'story.cached.title', defaultMessage: 'Cached Story' },
  intro: { id: 'story.cached.intro', defaultMessage: 'Originally published on { publishDate } in <a href="{ ref }">{ link }</a>. Collected on { collectDate }.' },
  readRaw: { id: 'story.cached.read', defaultMessage: 'View Raw Story' },
  storyText: { id: 'story.cached.text', defaultMessage: 'Story Text' },
};

const StoryCachedContainer = ({ story, location }) => (
  <Grid>
    <h1>{story.title}</h1>
    <h3><FormattedHTMLMessage {...localMessages.intro} values={{ publishDate: story.publish_date, ref: story.media.url, link: story.media.name, collectDate: story.collect_date }} /></h3>
    <div className="actions">
      <ReadItNowButton onClick={() => window.open(`/api/stories/${story.stories_id}/raw.html`, '_blank')} />
    </div>
    <h2><FormattedHTMLMessage {...localMessages.storyText} /></h2>
    <Row>
      <Col lg={12}>
        <HighlightedText text={story.story_text} search={location.query.search.split(',')} />
      </Col>
    </Row>
  </Grid>
);

StoryCachedContainer.propTypes = {
  // from parent
  story: PropTypes.object.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node,
  location: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.info.fetchStatus,
  story: state.story.info,
});


const fetchAsyncData = (dispatch, { params }) => {
  dispatch(selectStory({ id: params.id }));
  dispatch(fetchStory(params.id, { text: true }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['params'])(
      StoryCachedContainer
    )
  )
);
