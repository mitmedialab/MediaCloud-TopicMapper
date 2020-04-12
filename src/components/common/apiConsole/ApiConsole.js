import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import SwaggerContainer from './SwaggerContainer';

const localMessages = {
  pageTitle: { id: 'apiConsole.pageTitle', defaultMessage: 'API Console' },
  subTitle: { id: 'apiConsole.subTitle', defaultMessage: 'Try Out the Media Cloud API' },
  intro: { id: 'apiConsole.intro', defaultMessage: 'All of our data is available programatically via our API. If you are a coder, you can fetch data directly from our system using a variety of endpoints.  The console below lets you browse and try out some of our most commonly used API endpoints.  If you are planning to go this route and work in the Python programming language, read more:<ul><li><a target=_new href="https://github.com/berkmancenter/mediacloud/blob/master/doc/api_2_0_spec/api_2_0_spec.md">Full API Documentation</a></li><li><a target=_new href="https://pypi.org/project/mediacloud/">Python API CLient</a></li></ul>' },
};

const ApiConsole = props => (
  <Grid>
    <Helmet><title>{props.intl.formatMessage(localMessages.pageTitle)}</title></Helmet>
    <Row>
      <Col lg={8}>
        <h1><FormattedMessage {...localMessages.pageTitle} /></h1>
        <h2><FormattedMessage {...localMessages.subTitle} /></h2>
        <p><FormattedHTMLMessage {...localMessages.intro} /></p>
      </Col>
    </Row>
    <hr />
    <Row>
      <Col lg={12}>
        <SwaggerContainer specUrl="/static/api-spec.yml" />
      </Col>
    </Row>
  </Grid>
);

ApiConsole.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(ApiConsole);
