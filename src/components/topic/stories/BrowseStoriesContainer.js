import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { pagedAndSortedLocation } from '../../util/location';
import withPaging from '../../common/hocs/PagedContainer';
import TopicPageTitle from '../TopicPageTitle';
import TopicStoriesContainer from '../provider/TopicStoriesContainer';

const localMessages = {
  title: { id: 'topic.influentialStories.title', defaultMessage: 'Browse Stories' },
};

const BrowseStoriesContainer = ({ previousButton, nextButton, linkId }) => (
  <Grid>
    <Row>
      <Col lg={12}>
        <TopicPageTitle value={localMessages.title} />
        <h1><FormattedMessage {...localMessages.title} /></h1>
        <TopicStoriesContainer
          border={false}
          uid="browse"
          extraArgs={{ limit: 100 }}
          linkId={linkId}
        />
        { previousButton }
        { nextButton }
      </Col>
    </Row>
  </Grid>
);

BrowseStoriesContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  // from state
  links: PropTypes.object,
  linkId: PropTypes.string,
  // from PagedContainer wrapper
  nextButton: PropTypes.node,
  previousButton: PropTypes.node,
};

const mapStateToProps = (state, ownProps) => ({
  links: state.topics.selected.provider.stories.results.browse ? state.topics.selected.provider.stories.results.browse.link_ids : {},
  linkId: ownProps.location.query.linkId,
});

const handlePageChange = (dispatch, props, linkId) => {
  // just update the URL
  dispatch(push(pagedAndSortedLocation(
    props.location,
    linkId,
    props.sort,
    props.filters,
  )));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withPaging(handlePageChange)(
      BrowseStoriesContainer
    )
  )
);
