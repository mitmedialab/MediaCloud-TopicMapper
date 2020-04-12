import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import { fetchStoryQuotes } from '../../../actions/storyActions';
import withAsyncData from '../hocs/AsyncDataContainer';
import DataCard from '../DataCard';

const localMessages = {
  title: { id: 'story.quotes.title', defaultMessage: 'Quotes in Story' },
  index: { id: 'story.quotes.index', defaultMessage: 'Index' },
  speaker: { id: 'story.quotes.speaker', defaultMessage: 'Speaker' },
  canonicalSpeaker: { id: 'story.quotes.canonicalSpeaker', defaultMessage: 'Canonical Speaker' },
  text: { id: 'story.quotes.quote', defaultMessage: 'Quote' },
  snippet: { id: 'story.quotes.snippet', defaultMessage: 'Quote In Context' },
};

const StoryQuoteTable = ({ quotes }) => (
  <DataCard className="story-images-container">
    <h2><FormattedMessage {...localMessages.title} /></h2>
    <Row>
      <Col lg={12}>
        <table>
          <thead>
            <tr>
              <th><FormattedMessage {...localMessages.index} /></th>
              <th><FormattedMessage {...localMessages.speaker} /></th>
              <th><FormattedMessage {...localMessages.canonicalSpeaker} /></th>
              <th><FormattedMessage {...localMessages.text} /></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, idx) => (
              <tr key={idx}>
                <td>{q.index}</td>
                <td>{q.speaker}</td>
                <td>{q.canonicalSpeaker}</td>
                <td>{q.text}</td>
                <td>...{q.snippet}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </Row>
  </DataCard>
);

StoryQuoteTable.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  storyId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  quotes: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.reddit.fetchStatus,
  quotes: state.story.quotes.all,
});

const fetchAsyncData = (dispatch, { storyId }) => dispatch(fetchStoryQuotes(storyId));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['storyId'])(
      StoryQuoteTable
    )
  )
);
