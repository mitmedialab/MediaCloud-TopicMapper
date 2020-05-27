import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { schemeCategory10 } from 'd3';
import { fetchTopicProviderTagUse, filterByQuery } from '../../../actions/topicActions';
import ActionMenu from '../../common/ActionMenu';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import withSummary from '../../common/hocs/SummarizedVizualization';
import BubbleRowChart from '../../vis/BubbleRowChart';
import { downloadSvg } from '../../util/svg';
import messages from '../../../resources/messages';
import SVGAndCSVMenu from '../../common/SVGAndCSVMenu';
import { filtersAsUrlParams, formatAsUrlParams } from '../../util/location';
import { WarningNotice } from '../../common/Notice';
import { topicDownloadFilename } from '../../util/topicUtil';
import { TAG_SET_NYT_THEMES, TAG_NYT_LABELER_1_0_0 } from '../../../lib/tagUtil';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const BUBBLE_CHART_DOM_ID = 'nyt-tag-representation-bubble-chart';
const COLORS = schemeCategory10;
const PERCENTAGE_MIN_VALUE = 0.03; // anything lower than this goes into an "other" bubble
const COVERAGE_REQUIRED = 0.8; // need > this many of the stories tagged to show the results
const BUBBLES_TO_SHOW = 5;

const localMessages = {
  title: { id: 'topic.summary.nytLabels.title', defaultMessage: 'Top 5 Themes' },
  all: { id: 'topic.summary.nytLabels.all', defaultMessage: 'Themes' },
  descriptionIntro: { id: 'topic.summary.nytLabels.help.title', defaultMessage: '<p>The top themes that stories within this Topic are about, as determined by our machine learning models trained on news media.</p>' },
  notEnoughData: { id: 'topic.summary.nytLabels.notEnoughData',
    defaultMessage: 'Sorry, but only {pct} of the stories have been processed to add themes.  We can\'t gaurantee the accuracy of partial results, so we can\'t show a report of the top themes right now.  If you are really curious, you can download the CSV using the link in the top-right of this box, but don\'t trust those numbers as fully accurate. Email us if you want us to process this topic to add themes.',
  },
  lowSignal: { id: 'topic.summary.nytLabels.lowSignal',
    defaultMessage: 'There aren\'t enough stories with themes to show a useful chart here.  {link} to see details if you\'d like to.',
  },
};

class NytLabelSummaryContainer extends React.Component {
  downloadCsv = (evt) => {
    const { topicId, filters } = this.props;
    if (evt.preventDefault) {
      evt.preventDefault();
    }
    const url = `/api/topics/${topicId}/provider/tag-use.csv?${filtersAsUrlParams(filters)}&${formatAsUrlParams({
      tagSetsId: TAG_SET_NYT_THEMES,
      tagsId: TAG_NYT_LABELER_1_0_0,
    })}`;
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
    const { data, coverage, topicName, filters } = this.props;
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
        <>
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
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <SVGAndCSVMenu
                downloadCsv={this.downloadCsv}
                downloadSvg={() => downloadSvg(
                  `${topicDownloadFilename(topicName, filters)}-top-NYT-themes`,
                  BUBBLE_CHART_DOM_ID
                )}
                label={formatMessage(localMessages.all)}
              />
            </ActionMenu>
          </div>
        </>
      );
    } else {
      content = (
        <>
          <p>
            <FormattedMessage
              {...localMessages.notEnoughData}
              values={{ pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }) }}
            />
          </p>
        </>
      );
    }
    return content;
  }
}

NytLabelSummaryContainer.propTypes = {
  // from parent
  location: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  topicName: PropTypes.string.isRequired,
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  coverage: PropTypes.object.isRequired,
  data: PropTypes.array,
  // from dispatch
  updateQueryFilter: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topicName: state.topics.selected.info.name,
  fetchStatus: state.topics.selected.provider.tagUse.fetchStatuses.nytThemes || FETCH_INVALID,
  data: state.topics.selected.provider.tagUse.results.nytThemes ? state.topics.selected.provider.tagUse.results.nytThemes.list : [],
  coverage: state.topics.selected.provider.tagUse.results.nytThemes ? state.topics.selected.provider.tagUse.results.nytThemes.coverage : {},
});

const mapDispatchToProps = dispatch => ({
  updateQueryFilter: (newQueryFilter) => {
    dispatch(filterByQuery(newQueryFilter));
  },
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderTagUse(props.topicId, {
  ...props.filters,
  uid: 'nytThemes',
  tagSetsId: TAG_SET_NYT_THEMES,
  tagsId: TAG_NYT_LABELER_1_0_0,
}));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.descriptionIntro, messages.nytThemeHelpDetails)(
      withFilteredAsyncData(fetchAsyncData)(
        NytLabelSummaryContainer
      )
    )
  )
);
