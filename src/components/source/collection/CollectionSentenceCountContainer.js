import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../common/AsyncContainer';
import { fetchCollectionSentenceCount } from '../../../actions/sourceActions';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';

import messages from '../../../resources/messages';
import composeHelpfulContainer from '../../common/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';

const localMessages = {
  title: { id: 'sentenceCount.title', defaultMessage: 'Sentences in this Collection' },
  helpTitle: { id: 'collection.summary.sentenceCount.help.title', defaultMessage: 'About Sentences Over Time' },
  helpText: { id: 'collection.summary.sentenceCount.help.text',
    defaultMessage: '<p>This chart shows you the number of sentences we have collected from the sources in this collection over time. Click on the line to see a summary of the content in this collection for that date.</p>',
  },
};

class CollectionSentenceCountContainer extends React.Component {
  downloadCsv = () => {
    const { collectionId } = this.props;
    const url = `/api/collections/${collectionId}/sentences/sentence-count.csv`;
    window.location = url;
  }
  handleDataPointClick = (startDate, endDate) => {
    const { collectionId } = this.props;
    const startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    const endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    const url = `https://dashboard.mediacloud.org/#query/["*"]/[{"sets":[${collectionId}]}]/["${startDateStr}"]/["${endDateStr}"]/[{"uid":1,"name":"time","color":"55868A"}]`;
    window.open(url, '_blank');
  }
  render() {
    const { total, counts, health, intl, filename, helpButton } = this.props;
    const { formatMessage } = intl;
    return (
      <DataCard>
        <div className="actions">
          <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
        </div>
        <h2>
          <FormattedMessage {...localMessages.title} />
          {helpButton}
        </h2>
        <AttentionOverTimeChart
          total={total}
          data={counts}
          health={health}
          height={250}
          filename={filename}
          onDataPointClick={this.handleDataPointClick}
        />
      </DataCard>
    );
  }
}

CollectionSentenceCountContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  health: PropTypes.array,
  total: PropTypes.number,
  counts: PropTypes.array,
  // from parent
  collectionId: PropTypes.number.isRequired,
  filename: PropTypes.string,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.selected.collectionSentenceCount.fetchStatus,
  total: state.sources.collections.selected.collectionSentenceCount.total,
  counts: state.sources.collections.selected.collectionSentenceCount.list,
  health: state.sources.collections.selected.collectionSentenceCount.health,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchCollectionSentenceCount(ownProps.collectionId));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeHelpfulContainer(localMessages.helpTitle, [localMessages.helpText, messages.attentionChartHelpText])(
        composeAsyncContainer(
          CollectionSentenceCountContainer
        )
      )
    )
  );
