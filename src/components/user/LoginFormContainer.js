import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, injectIntl } from 'react-intl';
import LoginForm from './LoginForm';
import PageTitle from '../common/PageTitle';

const localMessages = {
  loginTitle: { id: 'login.title', defaultMessage: 'Login' },
};

class LoginContainer extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      this.context.router.push('/home');
    }
  }

  render() {
    const { isLoggedIn } = this.props.intl;
    const className = `logged-in-${isLoggedIn}`;
    return (
      <Grid>
        <PageTitle value={localMessages.loginTitle} />
        <Row>
          <Col lg={12} className={className}>
            <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
          </Col>
        </Row>
        <Row>
          <Col lg={4} className={className}>
            <LoginForm location={this.props.location} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

LoginContainer.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  location: PropTypes.object,
};

LoginContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
});

export default
injectIntl(
  connect(mapStateToProps)(
    LoginContainer
  )
);
