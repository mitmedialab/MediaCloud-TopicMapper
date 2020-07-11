import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import GeoChart, { downloadData } from '../../vis/GeoChart';
import DataCard from '../../common/DataCard';
import { fetchPlatformTags } from '../../../actions/platformActions';
import messages from '../../../resources/messages';
import withHelp from '../../common/hocs/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';
import { getBrandLightColor } from '../../../styles/colors';
import { getCurrentDate, oneMonthBefore } from '../../../lib/dateUtil';
import { TAG_SET_GEOGRAPHIC_PLACES } from '../../../lib/tagUtil';
import { urlToExplorerQuery } from '../../../lib/urlUtil';

const localMessages = {
  title: { id: 'source.summary.map.title', defaultMessage: 'Geographic Attention' },
  helpTitle: { id: 'source.summary.map.help.title', defaultMessage: 'Geographic Attention' },
  intro: { id: 'source.summary.map.intro',
    defaultMessage: '<p>Here is a heatmap of countries stories from this source are about. Darker countried are mentioned more. Click a country to load an Explorer search showing you how the this source covers it.</p>' },
};

class SourceGeographyContainer extends React.Component {
  handleDownload = () => {
    const { source, geolist } = this.props;
    const filename = `source-${source.media_id}-geo-tags.csv`;
    downloadData(filename, geolist);
  }

  handleCountryClick= (event, geo) => {
    const { source } = this.props;
    const countryName = geo.name;
    const countryTagId = geo.tags_id;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const url = urlToExplorerQuery(`${countryName} in ${source.name || source.url}`, `(tags_id_stories:${countryTagId})`,
      [source.media_id], [], startDate, endDate);
    window.open(url, '_blank');
  }

  render() {
    const { intro, geolist, helpButton } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <DataCard>
        <div className="actions">
          <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.handleDownload} />
        </div>
        <h2>
          <FormattedMessage {...localMessages.title} />
          {helpButton}
        </h2>
        <p>{intro}</p>
        <GeoChart data={geolist} onCountryClick={this.handleCountryClick} countryMaxColorScale={getBrandLightColor()} />
      </DataCard>
    );
  }
}

SourceGeographyContainer.propTypes = {
  // from parent
  source: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  geolist: PropTypes.array.isRequired,
  // from parent
  intro: PropTypes.string,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.platforms.tags.fetchStatus,
  geolist: state.platforms.tags.results.mediaSource ? state.platforms.tags.results.mediaSource.results : [],
});

const fetchAsyncData = (dispatch, { source }) => dispatch(fetchPlatformTags({
  uid: 'mediaSource',
  platform_query: `media_id:${source.media_id}`,
  platform_channel: JSON.stringify({ tags_sets_id: TAG_SET_GEOGRAPHIC_PLACES }),
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.intro, messages.heatMapHelpText])(
      withAsyncData(fetchAsyncData)(
        SourceGeographyContainer
      )
    )
  )
);
