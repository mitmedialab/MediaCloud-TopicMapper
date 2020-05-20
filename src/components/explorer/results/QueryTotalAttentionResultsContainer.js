import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { fetchQuerySplitStoryCount, fetchDemoQuerySplitStoryCount, resetSentenceCounts } from '../../../actions/explorerActions';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import AppButton from '../../common/AppButton';
import ActionMenu from '../../common/ActionMenu';
import BubbleRowChart from '../../vis/BubbleRowChart';
import { queryChangedEnoughToUpdate, postToDownloadUrl, ensureSafeResults } from '../../../lib/explorerUtil';
import { downloadSvg } from '../../util/svg';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';
import withQueryResults from './QueryResultsSelector';

const BUBBLE_CHART_DOM_ID = 'bubble-chart-story-total';

const localMessages = {
  title: { id: 'explorer.storyCount.title', defaultMessage: 'Total Attention' },
  helpIntro: { id: 'explorer.storyCount.help.into',
    defaultMessage: '<p>Compare the total number of stories where at least one sentence matched each of your queries.  Rollover the circles to see the exact numbers, or click the menu in the bottom right to download the data.</p>',
  },
  helpDetails: { id: 'explorer.storyCount.help.details',
    defaultMessage: '<p>It is harder to determine how much of the media\'s attention your search got. If you want to dig into that, a good place to start is comparing your query to a search for everything from the sources and collections you are searching.  You can do this by searching for * in the same date range and media; that matches every story.</p>',
  },
  downloadOneCsv: { id: 'explorer.attention.total.downloadCsv', defaultMessage: 'Download all story URLs' },
  downloadCsv: { id: 'explorer.attention.total.downloadCsv', defaultMessage: 'Download all story URLs for {name}' },
  downloadSvg: { id: 'explorer.attention.total.downloadSvg', defaultMessage: 'Download SVG' },
  viewNormalized: { id: 'explorer.attention.mode.viewNormalized', defaultMessage: 'View by Story Count (default)' },
  viewRegular: { id: 'explorer.attention.mode.viewRegular', defaultMessage: 'View by Story Percentage' },
};

const VIEW_NORMALIZED = 'VIEW_NORMALIZED';
const VIEW_REGULAR = 'VIEW_REGULAR';
const DOWNLOAD_PATH = '/api/explorer/stories/all-story-urls.csv';

class QueryTotalAttentionResultsContainer extends React.Component {
  state = {
    view: VIEW_REGULAR, // which view to show (see view constants above)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { results, queries } = this.props;
    return queryChangedEnoughToUpdate(queries, nextProps.queries, results, nextProps.results)
    || (this.state.view !== nextState.view);
  }

  setView = (nextView) => {
    this.setState({ view: nextView });
  }

  downloadCsv = (query) => {
    postToDownloadUrl(DOWNLOAD_PATH, query);
  }

  render() {
    const { results, queries } = this.props;
    const { formatNumber } = this.props.intl;
    let content = null;

    const safeResults = ensureSafeResults(queries, results);
    if (safeResults) {
      let bubbleData = [];
      bubbleData = safeResults.map((query, idx) => {
        const value = (this.state.view === VIEW_REGULAR) ? query.results.total : query.results.ratio;
        let centerText;
        if (this.state.view === VIEW_REGULAR) {
          centerText = formatNumber(value);
        } else {
          centerText = formatNumber(value, { style: 'percent', maximumFractionDigits: 2 });
        }
        const rolloverText = `${query.label}: ${centerText}`;
        return {
          value,
          aboveText: (idx % 2 === 0) ? query.label : null,
          belowText: (idx % 2 !== 0) ? query.label : null,
          centerText,
          rolloverText,
          centerTextColor: '#FFFFFF',
          fill: query.color,
        };
      });
      const downloadOptimizer = (
        <ActionMenu actionTextMsg={messages.downloadOptions}>
          {queries.map((q, idx) => (
            <MenuItem
              className="action-icon-menu-item"
              onClick={() => this.downloadCsv(q)}
              key={`csv-download-${idx}`}
            >
              <ListItemText>
                <FormattedMessage {...localMessages.downloadCsv} values={{ name: q.label }} />
              </ListItemText>
              <ListItemIcon>
                <DownloadButton />
              </ListItemIcon>
            </MenuItem>
          ))}
          <MenuItem
            className="action-icon-menu-item"
            onClick={() => downloadSvg('attention-bubble', BUBBLE_CHART_DOM_ID)}
          >
            <ListItemText>
              <FormattedMessage {...localMessages.downloadSvg} />
            </ListItemText>
            <ListItemIcon>
              <DownloadButton />
            </ListItemIcon>
          </MenuItem>
        </ActionMenu>
      );
      content = (
        <div>
          <BubbleRowChart
            data={bubbleData}
            padding={0}
            domId={BUBBLE_CHART_DOM_ID}
            width={650}
          />
          <div className="actions">
            {downloadOptimizer}
            <ActionMenu actionTextMsg={messages.viewOptions}>
              {[{
                view: VIEW_REGULAR,
                msg: localMessages.viewNormalized,
              }, {
                view: VIEW_NORMALIZED,
                msg: localMessages.viewRegular,
              }].map(item => (
                <MenuItem
                  className="action-icon-menu-item"
                  key={`view-options-${item.view}`}
                  disabled={this.state.view === item.view}
                  onClick={() => this.setView(item.view)}
                >
                  <ListItemText>
                    <FormattedMessage {...item.msg} />
                  </ListItemText>
                </MenuItem>
              ))}
            </ActionMenu>
          </div>
        </div>
      );
    }
    return content;
  }
}

QueryTotalAttentionResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  results: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.storySplitCount.fetchStatus || FETCH_INVALID,
  results: state.explorer.storySplitCount.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleExplore: () => {
    if (ownProps.queries.length === 1) {
      const q = ownProps.queries[0];
      return (
        <AppButton
          variant="text"
          className="action-menu-single-download"
          onClick={() => postToDownloadUrl(DOWNLOAD_PATH, q)}
          aria-controls="action-menu"
          aria-haspopup="true"
          aria-owns="action-menu"
          label={ownProps.intl.formatMessage(localMessages.downloadOneCsv, { name: q.label })}
          size="small"
        />
      );
    }
    return (
      <ActionMenu className="border-button" actionTextMsg={messages.downloadOptions}>
        {ownProps.queries.map((q, idx) => (
          <MenuItem
            className="action-icon-menu-item"
            onClick={() => postToDownloadUrl(DOWNLOAD_PATH, q)}
            key={idx}
          >
            <ListItemText>
              <FormattedMessage {...localMessages.downloadCsv} values={{ name: q.label }} />
            </ListItemText>
            <ListItemIcon>
              <DownloadButton />
            </ListItemIcon>
          </MenuItem>
        ))}
      </ActionMenu>
    );
  },
});


function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    shouldUpdate: (nextProps) => { // QueryResultsSelector needs to ask the child for internal repainting
      const { selectedTimePeriod } = stateProps;
      return nextProps.selectedTimePeriod !== selectedTimePeriod;
    },
  };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withSummary(localMessages.title, localMessages.helpIntro, [localMessages.helpDetails, messages.countsVsPercentageHelp], null, true)(
      withQueryResults(resetSentenceCounts, fetchQuerySplitStoryCount, fetchDemoQuerySplitStoryCount)(
        QueryTotalAttentionResultsContainer
      )
    )
  )
);
