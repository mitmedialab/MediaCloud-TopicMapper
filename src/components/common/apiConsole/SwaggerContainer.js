import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SwaggerUi from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

class SwaggerContainer extends Component {
  componentDidMount() {
    const { user } = this.props;
    console.log(user.key);
    /*
    const swaggerUi = SwaggerUi({
      dom_id: '#swagger-wrapper',
      url: specUrl,
      onComplete: () => {
        if (user.isLoggedIn) {
          swaggerUi.preauthorizeApiKey('key', user.key);
        }
      },
    }); */
  }

  render() {
    const { specUrl, user } = this.props;
    return (
      <SwaggerUi
        id="swagger-wrapper"
        url={specUrl}
        onComplete={(swaggerUi) => {
          if (user.isLoggedIn) {
            swaggerUi.preauthorizeApiKey('key', user.key);
          }
        }}
      />
    );
  }
}

SwaggerContainer.propTypes = {
  // from parent
  specUrl: PropTypes.string,
  // from store
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  user: state.user,
});

export default
connect(mapStateToProps)(
  SwaggerContainer
);
