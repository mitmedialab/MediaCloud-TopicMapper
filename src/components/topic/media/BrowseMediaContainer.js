import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import TopicMediaContainer from '../provider/TopicMediaContainer';
import { pagedAndSortedLocation } from '../../util/location';
import withPaging from '../../common/hocs/PagedContainer';
import TopicPageTitle from '../TopicPageTitle';

const localMessages = {
  title: { id: 'topic.influentialMedia.title', defaultMessage: 'Browse Media' },
};

const BrowseMediaContainer = ({ previousButton, nextButton, linkId }) => (
  <Grid>
    <Row>
      <Col lg={12}>
        <TopicPageTitle value={localMessages.title} />
        <h1><FormattedMessage {...localMessages.title} /></h1>
        <TopicMediaContainer
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

BrowseMediaContainer.propTypes = {
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
  links: state.topics.selected.provider.media.results.browse ? state.topics.selected.provider.media.results.browse.link_ids : {},
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
      BrowseMediaContainer
    )
  )
);
