import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ActionMenu from '../../common/ActionMenu';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import GeoChart from '../../vis/GeoChart';
import { filtersAsUrlParams, formatAsUrlParams } from '../../util/location';
import messages from '../../../resources/messages';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import { getBrandLightColor } from '../../../styles/colors';
import { fetchTopicProviderTagUse, filterByQuery } from '../../../actions/topicActions';
import { TAG_SET_GEOGRAPHIC_PLACES, CLIFF_VERSION_TAG_LIST } from '../../../lib/tagUtil';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const localMessages = {
  title: { id: 'topic.summary.geo.title', defaultMessage: 'Geographic Attention' },
  helpIntro: { id: 'topic.summary.geo.info',
    defaultMessage: '<p>This is a map of the countries stories within this Topic are about. We\'ve extracted the places mentioned in each story and the ones mentioned most make a story "about" that place. Darker countries have more stories about them.</p>' },
  notEnoughData: { id: 'topic.summary.geo.notEnoughData',
    defaultMessage: '<i>Sorry, but only {pct} of the stories have been processed to add the places they are about.  We can\'t gaurantee the accuracy of partial results, so we can\'t show a report of the geographic attention right now.  If you are really curious, you can download the CSV using the link in the top-right of this box, but don\'t trust those numbers as fully accurate. Email us if you want us to process this topic to add geographic attention.</i>',
  },
};

const COVERAGE_REQUIRED = 0.7; // need > this many of the stories tagged to show the results

class GeoTagSummaryContainer extends React.Component {
  downloadCsv = () => {
    const { topicId, filters } = this.props;
    const url = `/api/topics/${topicId}/provider/tag-use.csv?${filtersAsUrlParams(filters)}&${formatAsUrlParams({
      tagSetsId: TAG_SET_GEOGRAPHIC_PLACES,
      tagsId: CLIFF_VERSION_TAG_LIST,
    })}`;
    window.location = url;
  }

  handleEntityClick = (evt, country) => {
    const { filters, updateQueryFilter } = this.props;
    const queryFragment = `tags_id_stories: ${country.tags_id}`;
    if (filters.q && filters.q.length > 0) {
      updateQueryFilter(`(${filters.q}) AND (${queryFragment})`);
    } else {
      updateQueryFilter(queryFragment);
    }
  }

  render() {
    const { data, coverage } = this.props;
    const { formatNumber } = this.props.intl;
    const coverageRatio = coverage.count / coverage.total;
    let content;
    if (coverageRatio > COVERAGE_REQUIRED) {
      // add in some properties so the map can be rendered correctly
      content = (
        <GeoChart
          data={data}
          countryMaxColorScale={getBrandLightColor()}
          backgroundColor="#f5f5f5"
          onCountryClick={this.handleEntityClick}
        />
      );
    } else {
      content = (
        <p>
          <FormattedHTMLMessage
            {...localMessages.notEnoughData}
            values={{ pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }) }}
          />
        </p>
      );
    }
    return (
      <>
        {content}
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={this.downloadCsv}
            >
              <ListItemText><FormattedMessage {...messages.downloadCSV} /></ListItemText>
              <ListItemIcon><DownloadButton /></ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </>
    );
  }
}

GeoTagSummaryContainer.propTypes = {
  // from state
  data: PropTypes.array.isRequired,
  coverage: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  updateQueryFilter: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.provider.tagUse.fetchStatuses.places || FETCH_INVALID,
  data: state.topics.selected.provider.tagUse.results.places ? state.topics.selected.provider.tagUse.results.places.list : [],
  coverage: state.topics.selected.provider.tagUse.results.places ? state.topics.selected.provider.tagUse.results.places.coverage : {},
});

const mapDispatchToProps = (dispatch) => ({
  updateQueryFilter: (newQueryFilter) => dispatch(filterByQuery(newQueryFilter)),
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderTagUse(props.topicId, {
  ...props.filters,
  uid: 'places',
  tagSetsId: TAG_SET_GEOGRAPHIC_PLACES,
  tagsId: CLIFF_VERSION_TAG_LIST,
}));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.helpIntro, messages.heatMapHelpText)(
      withFilteredAsyncData(fetchAsyncData)(
        GeoTagSummaryContainer
      )
    )
  )
);
