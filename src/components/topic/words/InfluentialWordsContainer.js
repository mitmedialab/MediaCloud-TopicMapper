import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Word2VecTimespanPlayerContainer from './Word2VecTimespanPlayerContainer';
import WordCloudComparisonContainer from './WordCloudComparisonContainer';
import FociWordComparison from './FociWordComparison';

const localMessages = {
  title: { id: 'topic.influentialWords.title', defaultMessage: 'Influential Words' },
  intro: { id: 'topic.influentialWords.intro', defaultMessage: 'This screen lets you compare the words most used within this Timespan to the words used with this Subtopic. The words on the left are the most used in this Timespan. Those on the right are the most used within this Subtopic (if one is set, otherwise they are the most used in the whole snapshot).' },
};

const InfluentialWordsContainer = props => (
  <Grid>
    <Helmet><title>{props.intl.formatMessage(localMessages.title)}</title></Helmet>
    <Row>
      <Col lg={12} md={12} sm={12}>
        <h1><FormattedMessage {...localMessages.title} /></h1>
        <p><FormattedMessage {...localMessages.intro} /></p>
      </Col>
    </Row>
    <FociWordComparison filters={props.filters} topicId={props.topicId} />
    <WordCloudComparisonContainer />
    <Word2VecTimespanPlayerContainer />
  </Grid>
);

InfluentialWordsContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from state
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
});

export default connect(mapStateToProps)(injectIntl(InfluentialWordsContainer));
