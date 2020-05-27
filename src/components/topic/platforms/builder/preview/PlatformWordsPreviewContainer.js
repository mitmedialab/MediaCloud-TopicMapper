import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import withAsyncData from '../../../../common/hocs/AsyncDataContainer';
import withDescription from '../../../../common/hocs/DescribedDataCard';
import OrderedWordCloud from '../../../../vis/OrderedWordCloud';
import DataCard from '../../../../common/DataCard';
import { fetchPlatformWords } from '../../../../../actions/platformActions';
import messages from '../../../../../resources/messages';
import { topicQueryAsString } from '../../../../util/topicUtil';

const localMessages = {
  descriptionIntro: { id: 'topic.summary.words.help.into',
    defaultMessage: "The words most used in the matching content can give you some clues about what is being discussed. If this isn't the conversation you want to capture, then go back and edit your query to remove certain words.",
  },
};
const WORD_CLOUD_DOM_ID = 'topic-platform-preview-word-cloud';

const formSelector = formValueSelector('platform');

const PlatformWordsPreview = ({ words, intl }) => (
  <DataCard>
    <h2>
      <FormattedMessage {...messages.topWords} />
    </h2>
    <OrderedWordCloud
      words={words}
      title={intl.formatMessage(messages.topWords)}
      domId={WORD_CLOUD_DOM_ID}
      width={700}
    />
  </DataCard>
);

PlatformWordsPreview.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topic: PropTypes.object.isRequired,
  lastUpdated: PropTypes.number,
  formatPlatformChannelData: PropTypes.func, // will be pass the formValues, and should return a string suitable for upload to server
  // from state
  fetchStatus: PropTypes.string.isRequired,
  words: PropTypes.array,
  supported: PropTypes.bool,
  selectedPlatform: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
  fetchStatus: state.platforms.words.fetchStatus,
  words: state.platforms.words.list,
  supported: state.platforms.words.supported,
  formValues: formSelector(state, 'media', 'query', 'channel'),
  selectedPlatform: state.topics.selected.platforms.selected,
});

const fetchAsyncData = (dispatch, { topic, formValues, selectedPlatform, formatPlatformChannelData }) => {
  // call the fetcher the parent passed in to fetch the data we want to show
  dispatch(fetchPlatformWords({
    platform_type: selectedPlatform.platform,
    platform_query: topicQueryAsString(formValues.query),
    platform_source: selectedPlatform.source,
    platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
    start_date: topic.start_date,
    end_date: topic.end_date,
  }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['lastUpdated', 'supported'])(
      withDescription(localMessages.descriptionIntro, messages.wordcloudHelpText, 'supported')(
        PlatformWordsPreview
      )
    )
  )
);
