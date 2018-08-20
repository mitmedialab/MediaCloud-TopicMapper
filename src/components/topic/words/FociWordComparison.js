import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import DataCard from '../../common/DataCard';
import AppButton from '../../common/AppButton';
import messages from '../../../resources/messages';
import FocusSetSelectorContainer from '../attention/FocusSetSelectorContainer';
import { filtersAsUrlParams } from '../../util/location';

const localMessages = {
  title: { id: 'topic.attention.series.overall', defaultMessage: 'Compare Top Words' },
  intro: { id: 'topic.attention.bubbleChart.title', defaultMessage: 'Download a comparison between top words in each subtopic.' },
};

class FociWordComparison extends React.Component {
  state = {
    focalSetId: undefined,
  }

  render() {
    const { topicId, filters } = this.props;
    return (
      <DataCard>
        <h2><FormattedMessage {...localMessages.title} /></h2>
        <p><FormattedMessage {...localMessages.intro} /></p>
        <FocusSetSelectorContainer
          selectedFocalSetId={this.state.focalSetId}
          topicId={topicId}
          hideNoneOption
          onFocalSetSelected={(evt, idx, focalSetId) => this.setState({ focalSetId })}
        />
        <AppButton
          onClick={() => {
            const url = `/api/topics/${topicId}/words/subtopic-comparison.csv?focal_sets_id=`
              + `${this.state.focalSetId}&${filtersAsUrlParams(filters)}`;
            window.location = url;
          }}
          label={messages.download}
        />
      </DataCard>
    );
  }
}

FociWordComparison.propTypes = {
  // from parent
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
};

export default injectIntl(FociWordComparison);
