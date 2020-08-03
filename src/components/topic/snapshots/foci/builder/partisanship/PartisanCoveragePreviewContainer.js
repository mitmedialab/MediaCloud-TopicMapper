import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../../../common/hocs/AsyncDataContainer';
import { fetchCreateFocusRetweetCoverage } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import PieChart from '../../../../../vis/PieChart';
import { getBrandDarkColor } from '../../../../../../styles/colors';

const localMessages = {
  title: { id: 'topic.snapshot.retweet.coverage.title', defaultMessage: 'Story Coverage' },
  intro2016: { id: 'topic.snapshot.retweet.coverage.intro', defaultMessage: 'Our categorization of media sources by how much Trump and Clinton followers retweeted them in 2016 only covers the top 1000 sources from our 2016 US election topic.  This pie chart shows you how many stories form those media appear in this topic, versus how many don\'t.  If the coverage in this topic isn\'t high, you might not want to use this subtopic creation technique.' },
  intro2020: { id: 'topic.snapshot.retweet.coverage.intro', defaultMessage: 'TODO: TBD' },
  included: { id: 'topic.snapshot.keywords.coverage.matching', defaultMessage: 'Stories with partisanship info' },
  notIncluded: { id: 'topic.snapshot.keywords.coverage.total', defaultMessage: 'Stories without partisanship info' },
};

const PartisanCoveragePreviewContainer = (props) => {
  const { counts, year } = props;
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
        <FormattedMessage {...localMessages.title} />
      </h2>
      <p><FormattedMessage {...localMessages[`intro${year}`]} /></p>
      {content}
    </DataCard>
  );
};

PartisanCoveragePreviewContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  // from state
  counts: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.create.retweetCoverage.fetchStatus,
  counts: state.topics.selected.focalSets.create.retweetCoverage.counts,
});

const fetchAsycData = (dispatch, { topicId, year }) => dispatch(fetchCreateFocusRetweetCoverage(topicId, year));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsycData)(
      PartisanCoveragePreviewContainer
    )
  )
);
