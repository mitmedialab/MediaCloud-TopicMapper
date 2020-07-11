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
  title: { id: 'collection.summary.geo.title', defaultMessage: 'Geographic Attention' },
  intro: { id: 'collection.summary.geo.info',
    defaultMessage: '<p>Here is a heatmap of countries mentioned in this collection. Darker countried are mentioned more. Click a country to load an Explorer search showing you how the sources in this collection cover it.</p>' },
  helpTitle: { id: 'collection.summary.geo.help.title', defaultMessage: 'About Geographic Attention' },
};

class CollectionGeographyContainer extends React.Component {
  handleDownload = () => {
    const { collectionId, geolist } = this.props;
    const filename = `collection-${collectionId}-geo-tags.csv`;
    downloadData(filename, geolist);
  }

  handleCountryClick = (event, geo) => {
    const { collectionId, collectionName } = this.props;
    const countryName = geo.name;
    const countryTagId = geo.tags_id;
    const endDate = getCurrentDate();
    const startDate = oneMonthBefore(endDate);
    const url = urlToExplorerQuery(`${countryName} in ${collectionName}`, `(tags_id_stories:${countryTagId})`,
      [], [collectionId], startDate, endDate);
    window.open(url, '_blank');
  }

  render() {
    const { geolist, intl, helpButton } = this.props;
    const { formatMessage } = intl;
    return (
      <DataCard>
        <div className="actions">
          <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.handleDownload} />
        </div>
        <h2>
          <FormattedMessage {...localMessages.title} />
          {helpButton}
        </h2>
        <GeoChart data={geolist} onCountryClick={this.handleCountryClick} countryMaxColorScale={getBrandLightColor()} />
      </DataCard>
    );
  }
}

CollectionGeographyContainer.propTypes = {
  // from state
  geolist: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string,
  // from parent
  collectionName: PropTypes.string.isRequired,
  collectionId: PropTypes.number.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.platforms.tags.fetchStatus,
  geolist: state.platforms.tags.results.collection ? state.platforms.tags.results.collection.results : [],
});

const fetchAsyncData = (dispatch, { collectionId }) => dispatch(fetchPlatformTags({
  uid: 'collection',
  platform_query: `tags_id_media:${collectionId}`,
  platform_channel: JSON.stringify({ tags_sets_id: TAG_SET_GEOGRAPHIC_PLACES }),
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.intro, messages.heatMapHelpText])(
      withAsyncData(fetchAsyncData)(
        CollectionGeographyContainer
      )
    )
  )
);
