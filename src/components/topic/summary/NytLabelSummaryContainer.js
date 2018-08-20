import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { schemeCategory10 } from 'd3';
import { push } from 'react-router-redux';
import { fetchTopicNytLabelCounts, filterByQuery } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withDescription from '../../common/hocs/DescribedDataCard';
import BubbleRowChart from '../../vis/BubbleRowChart';
import { downloadSvg } from '../../util/svg';
import DataCard from '../../common/DataCard';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import messages from '../../../resources/messages';
import SVGAndCSVMenu from '../../common/SVGAndCSVMenu';
import { DownloadButton } from '../../common/IconButton';
import { filtersAsUrlParams, filteredLocation } from '../../util/location';
import { WarningNotice } from '../../common/Notice';

const BUBBLE_CHART_DOM_ID = 'nyt-tag-representation-bubble-chart';
const COLORS = schemeCategory10;
const PERCENTAGE_MIN_VALUE = 0.03; // anything lower than this goes into an "other" bubble
const COVERAGE_REQUIRED = 0.8;  // need > this many of the stories tagged to show the results
const BUBBLES_TO_SHOW = 5;

const localMessages = {
  title: { id: 'topic.summary.nytLabels.title', defaultMessage: 'Top {number} Themes' },
  descriptionIntro: { id: 'topic.summary.nytLabels.help.title', defaultMessage: 'The top themes that stories within this Topic are about, as determined by our machine learning models trained on news media.' },
  notEnoughData: { id: 'topic.summary.nytLabels.notEnoughData',
    defaultMessage: 'Sorry, but only {pct} of the stories have been processed to add themes.  We can\'t gaurantee the accuracy of partial results, so we can\'t show a report of the top themes right now.  If you are really curious, you can download the CSV using the link in the top-right of this box, but don\'t trust those numbers as fully accurate. Email us if you want us to process this topic to add themes.',
  },
  lowSignal: { id: 'topic.summary.nytLabels.lowSignal',
    defaultMessage: 'There aren\'t enough stories with themes to show a useful chart here.  {link} to see details if you\'d like to.',
  },
};

class NytLabelSummaryContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { fetchData, filters } = this.props;
    if (nextProps.filters !== filters) {
      fetchData(nextProps);
    }
  }
  downloadCsv = (evt) => {
    const { topicId, filters } = this.props;
    if (evt) {
      evt.preventDefault();
    }
    const url = `/api/topics/${topicId}/nyt-tags/counts.csv?${filtersAsUrlParams(filters)}`;
    window.location = url;
  }
  handleBubbleClick = (data) => {
    const { filters, updateQueryFilter } = this.props;
    const queryFragment = `tags_id_stories: ${data.tagsId}`;
    if (filters.q && filters.q.length > 0) {
      updateQueryFilter(`(${filters.q}) AND (${queryFragment})`);
    } else {
      updateQueryFilter(queryFragment);
    }
  }
  render() {
    const { data, coverage } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    const coverageRatio = coverage.total !== undefined && coverage.total > 0 ? coverage.count / coverage.total : 0;
    let content;
    if (coverageRatio > COVERAGE_REQUIRED) {
      const dataOverMinTheshold = data.filter(d => d.pct > PERCENTAGE_MIN_VALUE);
      const bubbleData = [
        ...dataOverMinTheshold.map((s, idx) => ({
          value: s.pct,
          tagsId: s.tags_id,
          fill: COLORS[idx + 1],
          aboveText: (idx % 2 === 0) ? s.tag : null,
          belowText: (idx % 2 !== 0) ? s.tag : null,
          rolloverText: `${s.tag}: ${formatNumber(s.pct, { style: 'percent', maximumFractionDigits: 2 })}`,
        })),
      ];
      let warning;
      if (dataOverMinTheshold.length === 0) {
        warning = (
          <WarningNotice>
            <FormattedMessage
              {...localMessages.lowSignal}
              values={{
                link: <a href="#download-csv" onClick={this.downloadCSV}> <FormattedMessage {...messages.downloadCSV} /></a>,
              }}
            />
          </WarningNotice>
        );
      }
      content = (
        <div>
          <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
            <div className="actions">
              <SVGAndCSVMenu
                downloadCsv={() => this.downloadCsv}
                downloadSvg={() => downloadSvg(BUBBLE_CHART_DOM_ID)}
                label={formatMessage(messages.topicName)}
              />
            </div>
          </Permissioned>
          <h2>
            <FormattedMessage {...localMessages.title} values={{ number: BUBBLES_TO_SHOW }} />
          </h2>
          {warning}
          <BubbleRowChart
            maxBubbleRadius={60}
            data={bubbleData.slice(0, BUBBLES_TO_SHOW)}
            width={700}
            height={220}
            domId={BUBBLE_CHART_DOM_ID}
            asPercentage
            onBubbleClick={this.handleBubbleClick}
            minCutoffValue={0.05}
          />
        </div>
      );
    } else {
      content = (
        <div>
          <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
            <div className="actions">
              <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
            </div>
          </Permissioned>
          <h2>
            <FormattedMessage {...localMessages.title} values={{ number: BUBBLES_TO_SHOW }} />
          </h2>
          <p>
            <FormattedMessage
              {...localMessages.notEnoughData}
              values={{ pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }) }}
            />
          </p>
        </div>
      );
    }
    return (
      <DataCard>
        {content}
      </DataCard>
    );
  }
}

NytLabelSummaryContainer.propTypes = {
  // from parent
  location: PropTypes.object.isRequired,
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
  coverage: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  data: PropTypes.array,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  updateQueryFilter: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.nytlabels.fetchStatus,
  data: state.topics.selected.nytlabels.entities,
  coverage: state.topics.selected.nytlabels.coverage,
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (props) => {
    dispatch(fetchTopicNytLabelCounts(props.topicId, props.filters));
  },
  updateQueryFilter: (newQueryFilter) => {
    const newFilters = {
      ...ownProps.filters,
      q: newQueryFilter,
    };
    const newLocation = filteredLocation(ownProps.location, newFilters);
    dispatch(push(newLocation));
    dispatch(filterByQuery(newQueryFilter));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withDescription(localMessages.descriptionIntro, messages.nytThemeHelpDetails)(
        withAsyncFetch(
          NytLabelSummaryContainer
        )
      )
    )
  );
