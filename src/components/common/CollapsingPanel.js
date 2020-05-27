import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

class CollapsingPanel extends React.Component {
  state = {
    open: false,
  };

  handleToggle = (evt) => {
    evt.preventDefault();
    this.setState((prevState) => ({ open: !prevState.open }));
  };

  render() {
    const { titleMsg, children } = this.props;
    return (
      <div className={`collapsing-panel ${this.state.open ? 'open' : 'closed'}`}>
        <Row>
          <Col lg={11}><h3><FormattedMessage {...titleMsg} /></h3></Col>
          <Col lg={1}>
            {!this.state.open && (<ExpandMoreIcon onClick={this.handleToggle} />)}
            {this.state.open && (<ExpandLessIcon onClick={this.handleToggle} />)}
          </Col>
        </Row>
        {this.state.open && children}
      </div>
    );
  }
}

CollapsingPanel.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from parent
  titleMsg: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default injectIntl(CollapsingPanel);
