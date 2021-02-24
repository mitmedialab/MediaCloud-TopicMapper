import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { Container } from '@material-ui/core';
import { push } from 'react-router-redux';
import SourceSearchContainer from './SourceSearchContainer';

const SourceControlBar = props => (
  <div className="controlbar controlbar-sources">
    <div className="main">
      <Container maxWidth="lg">
        <Row>
          <Col lg={(props.showSearch === true) ? 7 : 12} xs={12} className="left">
            {props.children}
          </Col>
          <Col lg={5} xs={12} className="right">
            {(props.showSearch === true) && (
              <SourceSearchContainer
                onAdvancedSearchSelected={props.handleAdvancedSearchSelected}
                onMediaSourceSelected={props.handleMediaSourceSelected}
                onCollectionSelected={props.handleCollectionSelected}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  </div>
);

SourceControlBar.propTypes = {
  // from parent
  children: PropTypes.node,
  showSearch: PropTypes.bool,
  // from context
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleMediaSourceSelected: PropTypes.func.isRequired,
  handleCollectionSelected: PropTypes.func.isRequired,
  handleAdvancedSearchSelected: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = dispatch => ({
  handleMediaSourceSelected: (item) => {
    dispatch(push(`/sources/${item.value}`));
  },
  handleCollectionSelected: (item) => {
    dispatch(push(`/collections/${item.value}`));
  },
  handleAdvancedSearchSelected: (searchStr) => {
    dispatch(push(`/search?search=${searchStr}`));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SourceControlBar
  )
);
