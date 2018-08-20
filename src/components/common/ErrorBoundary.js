import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Raven from 'raven-js';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { ErrorNotice } from './Notice';

const localMessages = {
  generic: { id: 'error.generic', defaultMessage: 'Oops! Something went wrong.' },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: undefined };
  }

  componentDidCatch(error) {
    // Display fallback UI
    this.setState({ hasError: true, errorMessage: error.toString() });
    // You can also log the error to an error reporting service
    Raven.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <Grid>
            <Row>
              <Col lg={12}>
                <ErrorNotice details={this.state.errorMessage}>
                  <FormattedMessage {...localMessages.generic} />
                </ErrorNotice>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(ErrorBoundary);
