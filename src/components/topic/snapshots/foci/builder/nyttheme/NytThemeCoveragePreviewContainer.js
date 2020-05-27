import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../../../common/hocs/AsyncDataContainer';
import { fetchCreateFocusNytThemeCoverage } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import PieChart from '../../../../../vis/PieChart';
import { getBrandDarkColor } from '../../../../../../styles/colors';

const localMessages = {
  title: { id: 'topic.snapshot.nytTheme.coverage.title', defaultMessage: 'Story Coverage' },
  intro: { id: 'topic.snapshot.nytTheme.coverage.intro', defaultMessage: 'By NYT Top Themes' },
  included: { id: 'topic.snapshot.nytTheme.coverage.matching', defaultMessage: 'Stories about these top themes' },
  notIncluded: { id: 'topic.snapshot.nytTheme.coverage.total', defaultMessage: 'All Stories' },
};

const NytThemeCoveragePreviewContainer = (props) => {
  const { counts, numThemes } = props;
  const { formatMessage } = props.intl;
  let content = null;
  if (counts !== null && counts !== undefined) {
    content = (
      <PieChart
        title={formatMessage(localMessages.title)}
        data={[
          { name: formatMessage(localMessages.included), y: counts.count, color: getBrandDarkColor() },
          { name: formatMessage(localMessages.notIncluded), y: counts.total - counts.count, color: '#cccccc' },
        ]}
        height={250}
        showDataLabels={false}
      />
    );
  }
  return (
    <DataCard>
      <h2>
        <FormattedMessage {...localMessages.title} numThemes={numThemes} />
      </h2>
      <p><FormattedMessage {...localMessages.intro} numThemes={numThemes} /></p>
      {content}
    </DataCard>
  );
};

NytThemeCoveragePreviewContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  numThemes: PropTypes.number.isRequired,
  // from state
  counts: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.create.nytThemeCoverage.fetchStatus,
  counts: state.topics.selected.focalSets.create.nytThemeCoverage.counts,
});

const fetchAsyncData = (dispatch, { topicId, numThemes }) => dispatch(fetchCreateFocusNytThemeCoverage(topicId, { numThemes }));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['numThemes'])(
      NytThemeCoveragePreviewContainer
    )
  )
);
