import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../common/AsyncContainer';
import { fetchSourceSentenceCount } from '../../../actions/sourceActions';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';

import messages from '../../../resources/messages';
import composeHelpfulContainer from '../../common/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';

const localMessages = {
  title: { id: 'sentenceCount.title', defaultMessage: 'Sentences in this Media Source' },
  helpTitle: { id: 'source.summary.sentenceCount.help.title', defaultMessage: 'About Sentences Over Time' },
  helpText: { id: 'source.summary.sentenceCount.help.text',
    defaultMessage: '<p>This chart shows you the number of sentences we have collected from this source over time. Click on the line to see a summary of the content in this source for that date. The grey vertical lines indicate weeks where we didn\'t get as many stories as we\'d expect to.</p>',
  },
};

class SourceSentenceCountContainer extends React.Component {
  downloadCsv = () => {
    const { sourceId } = this.props;
    const url = `/api/sources/${sourceId}/sentences/sentence-count.csv`;
    window.location = url;
  }
  handleDataPointClick = (startDate, endDate) => {
    const { sourceId } = this.props;
    const startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    const endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    const url = `https://dashboard.mediacloud.org/#query/["*"]/[{"sources":[${sourceId}]}]/["${startDateStr}"]/["${endDateStr}"]/[{"uid":1,"name":"time","color":"55868A"}]`;
    window.open(url, '_blank');
  }
  render() {
    const { total, counts, health, filename, helpButton } = this.props;
    const { formatMessage } = this.props.intl;
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

SourceSentenceCountContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  health: PropTypes.array,
  total: PropTypes.number,
  counts: PropTypes.array,
  // from parent
  sourceId: PropTypes.number.isRequired,
  filename: PropTypes.string,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.sources.selected.sentenceCount.fetchStatus,
  total: state.sources.sources.selected.sentenceCount.total,
  counts: state.sources.sources.selected.sentenceCount.list,
  health: state.sources.sources.selected.sentenceCount.health,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchSourceSentenceCount(ownProps.sourceId));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeHelpfulContainer(localMessages.helpTitle, [localMessages.helpText, messages.attentionChartHelpText])(
        composeAsyncContainer(
          SourceSentenceCountContainer
        )
      )
    )
  );
