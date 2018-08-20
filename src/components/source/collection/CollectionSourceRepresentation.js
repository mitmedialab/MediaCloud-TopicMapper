import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import DataCard from '../../common/DataCard';
import { fetchCollectionSourceRepresentation } from '../../../actions/sourceActions';
import messages from '../../../resources/messages';
import withHelp from '../../common/hocs/HelpfulContainer';
import ActionMenu from '../../common/ActionMenu';
import PackedBubbleChart from '../../vis/PackedBubbleChart';
import { getBrandDarkColor } from '../../../styles/colors';
import SVGAndCSVMenu from '../../common/SVGAndCSVMenu';
import { downloadSvg } from '../../util/svg';

const localMessages = {
  chartTitle: { id: 'collection.summary.sourceRepresentation.chart.title', defaultMessage: 'Sentences By Source' },
  title: { id: 'collection.summary.sourceRepresentation.title', defaultMessage: 'Source Representation' },
  helpTitle: { id: 'collection.summary.sourceRepresentation.help.title', defaultMessage: 'About Source Representation' },
  helpText: { id: 'collection.summary.sourceRepresentation.help.text',
    defaultMessage: '<p>This visualization gives you a sense of how much content each source contributes to this collection.  Each source is a circle.  The larger and darker the circle, the more stories it has in this collection.  Rollover one to see the actual number of stories. Click the source to learn more about it.</p><p>For performance reasons, these percentages are based on a sample of 5000 stories from this collection.  Our tests show that this sampling provides accurate results.</p>',
  },
  cantShow: { id: 'collection.summary.sourceRepresentation.cantShow', defaultMessage: 'Sorry, this collection has too many sources for us to compute a map of how much content each source contributes to it.' },
  overallSeries: { id: 'collection.bubble.series.overall', defaultMessage: 'Overall' },
  bubbleChartTitle: { id: 'collection.bubble.bubbleChart.title', defaultMessage: 'Total Bubble Representation' },
  lineChartTitle: { id: 'collection.bubble.lineChart.title', defaultMessage: 'Bubble Representation' },
};

const BUBBLE_CHART_DOM_ID = 'source-representation-bubble-chart';
const SENTENCE_PERCENTAGE_MIN_VALUE = 0.01; // 1 percent threshold
const TOP_N_LABELS_TO_SHOW = 5; // only the top N bubbles will get a label visible on them (so the text is readable)

class CollectionSourceRepresentation extends React.Component {

  downloadCsv = () => {
    const { collection } = this.props;
    const url = `/api/collections/${collection.tags_id}/sources/representation/representation.csv`;
    window.location = url;
  }

  render() {
    const { helpButton, sources, navToSource, collection } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;

    let content = null;
    // if no sources that means there were too many to compute the chart for
    if (sources.length === 0) {
      content = <p><FormattedMessage {...localMessages.cantShow} /></p>;
    } else {
      const contributingSources = Object.values(sources).filter(d => d.story_pct > SENTENCE_PERCENTAGE_MIN_VALUE);
      const otherSources = Object.values(sources).filter(d => d.story_pct <= SENTENCE_PERCENTAGE_MIN_VALUE);
      const otherTotal = d3.sum(otherSources.map(d => d.story_pct));
      const otherSourcesNode = {
        value: otherTotal,
        rolloverText: `${formatMessage(messages.other)}: ${formatNumber(otherTotal, { style: 'percent', maximumFractionDigits: 2 })}`,
        fill: '#eee',
      };
      const maxPct = Math.ceil(d3.max(contributingSources.map(d => d.story_pct)) * 100) / 100;
      const scaleRange = d3.scaleLinear()
        .domain([0, maxPct])
        .range([d3.rgb('#ffffff'), d3.rgb(getBrandDarkColor())]);

      const bubbleData = [
        ...contributingSources.sort((a, b) => b.story_pct - a.story_pct).map((s, idx) => ({
          id: s.media_id,
          value: s.story_pct,
          centerText: (idx < TOP_N_LABELS_TO_SHOW) ? s.media_name : null,
          rolloverText: `${s.media_name}: ${formatNumber(s.story_pct, { style: 'percent', maximumFractionDigits: 2 })}`,
          fill: scaleRange(s.story_pct),
        })),
      ];

      if (sources.length - contributingSources.length !== 0) {
        bubbleData.push(otherSourcesNode);
      }

      content = (
        <PackedBubbleChart
          data={bubbleData}
          height={400}
          domId={BUBBLE_CHART_DOM_ID}
          onClick={navToSource}
        />
      );
    }
    return (
      <DataCard>
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <SVGAndCSVMenu
              downloadCsv={this.downloadCsv}
              downloadSvg={() => {
                const filename = `${slugify(collection.label)}-source-representation`;
                downloadSvg(filename, BUBBLE_CHART_DOM_ID);
              }}
              label={formatMessage(localMessages.title)}
            />
          </ActionMenu>
        </div>
        <h2>
          <FormattedMessage {...localMessages.title} />
          {helpButton}
        </h2>
        {content}
      </DataCard>
    );
  }

}

CollectionSourceRepresentation.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  sources: PropTypes.array.isRequired,
  // from parent
  collection: PropTypes.number.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  navToSource: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.selected.collectionSourceRepresentation.fetchStatus,
  sources: state.sources.collections.selected.collectionSourceRepresentation.sources,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchCollectionSourceRepresentation(ownProps.collection.tags_id));
  },
  navToSource: (element) => {
    dispatch(push(`/sources/${element.data.id}`));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withHelp(localMessages.helpTitle, [localMessages.helpText])(
        withAsyncFetch(
          CollectionSourceRepresentation
        )
      )
    )
  );
